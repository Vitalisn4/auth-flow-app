use anyhow::{anyhow, Result};
use axum::extract::Multipart;
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use sqlx::SqlitePool;
use std::path::Path;
use uuid::Uuid;

use crate::models::{
    user::{User, UserRow, UpdateProfileRequest, ChangePasswordRequest},
};

pub struct UserService<'a> {
    pool: &'a SqlitePool,
}

impl<'a> UserService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_user_by_id(&self, user_id: &Uuid) -> Result<User> {
        let user_row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE id = ?",
        )
        .bind(user_id)
        .fetch_one(self.pool)
        .await?;

        Ok(user_row.into())
    }

    pub async fn update_profile(&self, user_id: Uuid, request: UpdateProfileRequest) -> Result<User> {
        // Check if email is already taken by another user
        let existing_user = sqlx::query!(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            request.email,
            user_id
        )
        .fetch_optional(self.pool)
        .await?;

        if existing_user.is_some() {
            return Err(anyhow!("Email is already taken"));
        }

        // Update user profile
        sqlx::query(
            "UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?",
        )
        .bind(&request.name)
        .bind(&request.email)
        .bind(&Utc::now())
        .bind(&user_id)
        .execute(self.pool)
        .await?;

        // Fetch updated user
        self.get_user_by_id(&user_id).await
    }

    pub async fn change_password(&self, user_id: Uuid, request: ChangePasswordRequest) -> Result<()> {
        // Get current user
        let user_row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE id = ?",
        )
        .bind(&user_id)
        .fetch_one(self.pool)
        .await?;

        // Verify current password
        if !verify(&request.current_password, &user_row.password_hash)? {
            return Err(anyhow!("Invalid current password"));
        }

        // Hash new password
        let new_password_hash = hash(&request.new_password, DEFAULT_COST)?;

        // Update password
        sqlx::query(
            "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
        )
        .bind(&new_password_hash)
        .bind(&Utc::now())
        .bind(&user_id)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete_account(&self, user_id: Uuid) -> Result<()> {
        // Delete user (refresh tokens will be deleted by foreign key constraint)
        sqlx::query("DELETE FROM users WHERE id = ?")
            .bind(&user_id)
            .execute(self.pool)
            .await?;

        Ok(())
    }

    pub async fn upload_avatar(&self, user_id: Uuid, multipart: &mut Multipart) -> Result<String> {
        while let Some(field) = multipart.next_field().await.map_err(|e| anyhow!("Multipart error: {}", e))? {
            let name = field.name().unwrap_or("");
            
            if name == "avatar" {
                let filename = field.file_name()
                    .ok_or_else(|| anyhow!("No filename provided"))?
                    .to_string();

                // Validate file type
                let extension = Path::new(&filename)
                    .extension()
                    .and_then(|ext| ext.to_str())
                    .ok_or_else(|| anyhow!("Invalid file extension"))?
                    .to_lowercase();

                if !["jpg", "jpeg", "png", "gif"].contains(&extension.as_str()) {
                    return Err(anyhow!("Invalid file type. Only JPG, PNG, and GIF are allowed"));
                }

                let data = field.bytes().await.map_err(|e| anyhow!("Failed to read file: {}", e))?;

                // Validate file size (5MB max)
                if data.len() > 5 * 1024 * 1024 {
                    return Err(anyhow!("File too large. Maximum size is 5MB"));
                }

                // Generate unique filename
                let new_filename = format!("{}_{}.{}", user_id, Uuid::new_v4(), extension);
                let file_path = format!("uploads/avatars/{}", new_filename);

                // Save file
                tokio::fs::write(&file_path, &data).await
                    .map_err(|e| anyhow!("Failed to save file: {}", e))?;

                let avatar_url = format!("/uploads/avatars/{}", new_filename);

                // Update user avatar URL
                sqlx::query(
                    "UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?",
                )
                .bind(&avatar_url)
                .bind(&Utc::now())
                .bind(&user_id)
                .execute(self.pool)
                .await?;

                return Ok(avatar_url);
            }
        }

        Err(anyhow!("No avatar file found in request"))
    }

    pub async fn list_users(&self) -> Result<Vec<User>> {
        let user_rows = sqlx::query_as::<_, UserRow>("SELECT * FROM users ORDER BY created_at DESC")
            .fetch_all(self.pool)
            .await?;
        Ok(user_rows.into_iter().map(Into::into).collect())
    }
}