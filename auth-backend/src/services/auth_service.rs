use anyhow::{anyhow, Result};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use sqlx::SqlitePool;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    models::{
        auth::{RegisterRequest, LoginRequest, AuthResponse},
        user::{User, UserRow},
    },
    utils::{jwt::JwtKeys, password::hash_token},
};

pub struct AuthService<'a> {
    pool: &'a SqlitePool,
    jwt_keys: &'a Arc<JwtKeys>,
}

impl<'a> AuthService<'a> {
    pub fn new(pool: &'a SqlitePool, jwt_keys: &'a Arc<JwtKeys>) -> Self {
        Self { pool, jwt_keys }
    }

    pub async fn register(&self, request: RegisterRequest) -> Result<AuthResponse> {
        // Check if user already exists
        let existing_user = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE email = ?",
        )
        .bind(&request.email)
        .fetch_optional(self.pool)
        .await?;

        if existing_user.is_some() {
            return Err(anyhow!("User with this email already exists"));
        }

        // Hash password
        let password_hash = hash(&request.password, DEFAULT_COST)?;

        // Create user
        let user_id = Uuid::new_v4();
        let now = Utc::now();

        sqlx::query(
            r#"
            INSERT INTO users (id, email, password_hash, role, email_verified, terms_accepted, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&user_id)
        .bind(&request.email)
        .bind(&password_hash)
        .bind("user")
        .bind(false)
        .bind(request.agree_to_terms)
        .bind(&now)
        .bind(&now)
        .execute(self.pool)
        .await?;

        // Fetch created user
        let user_row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE id = ?",
        )
        .bind(&user_id)
        .fetch_one(self.pool)
        .await?;

        let user: User = user_row.into();

        // Generate tokens
        let (access_token, refresh_token) = self.generate_tokens(&user).await?;

        Ok(AuthResponse {
            user,
            token: access_token,
            refresh_token,
            expires_in: 600, // 10 minutes
        })
    }

    pub async fn login(&self, request: LoginRequest) -> Result<AuthResponse> {
        // Find user by email
        let user_row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE email = ?",
        )
        .bind(&request.email)
        .fetch_optional(self.pool)
        .await?
        .ok_or_else(|| anyhow!("Invalid credentials"))?;

        // Verify password
        if !verify(&request.password, &user_row.password_hash)? {
            return Err(anyhow!("Invalid credentials"));
        }

        // Update last login
        sqlx::query("UPDATE users SET last_login = ? WHERE id = ?")
            .bind(&Utc::now())
            .bind(&user_row.id)
            .execute(self.pool)
            .await?;

        let mut user: User = user_row.into();
        user.last_login = Some(Utc::now());

        // Generate tokens
        let (access_token, refresh_token) = self.generate_tokens(&user).await?;

        Ok(AuthResponse {
            user,
            token: access_token,
            refresh_token,
            expires_in: 600, // 10 minutes
        })
    }

    pub async fn logout(&self, user_id: Uuid) -> Result<()> {
        // Delete all refresh tokens for the user
        sqlx::query("DELETE FROM refresh_tokens WHERE user_id = ?")
            .bind(&user_id)
            .execute(self.pool)
            .await?;

        Ok(())
    }

    pub async fn refresh_token(&self, refresh_token: String) -> Result<AuthResponse> {
        // Verify refresh token
        let _claims = self.jwt_keys.verify_refresh_token(&refresh_token)?;
        
        // Check if refresh token exists in database
        let token_hash = hash_token(&refresh_token);
        let now = Utc::now();
        let stored_token = sqlx::query!(
            "SELECT user_id FROM refresh_tokens WHERE token_hash = ? AND expires_at > ?",
            token_hash,
            now
        )
        .fetch_optional(self.pool)
        .await?
        .ok_or_else(|| anyhow!("Invalid refresh token"))?;

        // Get user
        let user_row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE id = ?",
        )
        .bind(&stored_token.user_id)
        .fetch_one(self.pool)
        .await?;

        let user: User = user_row.into();

        // Delete old refresh token
        sqlx::query("DELETE FROM refresh_tokens WHERE token_hash = ?")
            .bind(&token_hash)
            .execute(self.pool)
            .await?;

        // Generate new tokens
        let (access_token, new_refresh_token) = self.generate_tokens(&user).await?;

        Ok(AuthResponse {
            user,
            token: access_token,
            refresh_token: new_refresh_token,
            expires_in: 600, // 10 minutes
        })
    }

    async fn generate_tokens(&self, user: &User) -> Result<(String, String)> {
        let access_token = self.jwt_keys.generate_access_token(user)?;
        let refresh_token = self.jwt_keys.generate_refresh_token(user)?;

        // Store refresh token in database
        let token_hash = hash_token(&refresh_token);
        let expires_at = Utc::now() + Duration::days(7);

        sqlx::query(
            r#"
            INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?)
            "#,
        )
        .bind(&Uuid::new_v4())
        .bind(&user.id)
        .bind(&token_hash)
        .bind(&expires_at)
        .bind(&Utc::now())
        .execute(self.pool)
        .await?;

        Ok((access_token, refresh_token))
    }
}