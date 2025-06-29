use anyhow::Result;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};

use crate::models::{
    auth::{Claims, RefreshClaims},
    user::User,
};

pub struct JwtKeys {
    pub access_secret: String,
    pub refresh_secret: String,
}

impl JwtKeys {
    pub fn new(access_secret: String, refresh_secret: String) -> Self {
        Self {
            access_secret,
            refresh_secret,
        }
    }

    pub fn generate_access_token(&self, user: &User) -> Result<String> {
        let now = Utc::now();
        let exp = now + Duration::minutes(10); // 10 minutes

        let claims = Claims {
            sub: user.id.to_string(),
            email: user.email.clone(),
            role: user.role.clone(),
            exp: exp.timestamp() as usize,
            iat: now.timestamp() as usize,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.access_secret.as_ref()),
        )?;

        Ok(token)
    }

    pub fn generate_refresh_token(&self, user: &User) -> Result<String> {
        let now = Utc::now();
        let exp = now + Duration::days(7); // 7 days

        let claims = RefreshClaims {
            sub: user.id.to_string(),
            exp: exp.timestamp() as usize,
            iat: now.timestamp() as usize,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.refresh_secret.as_ref()),
        )?;

        Ok(token)
    }

    pub fn verify_access_token(&self, token: &str) -> Result<Claims> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.access_secret.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }

    pub fn verify_refresh_token(&self, token: &str) -> Result<RefreshClaims> {
        let token_data = decode::<RefreshClaims>(
            token,
            &DecodingKey::from_secret(self.refresh_secret.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }
}