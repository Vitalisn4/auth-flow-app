use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, DecodingKey, Validation};

use crate::{
    models::{auth::Claims, response::ErrorResponse, user::User},
    services::user_service::UserService,
    AppState,
};

pub struct AuthUser {
    pub user: User,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|header| header.to_str().ok())
            .ok_or_else(|| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(ErrorResponse::new("Missing authorization header")),
                ).into_response()
            })?;

        let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(ErrorResponse::new("Invalid authorization header format")),
            ).into_response()
        })?;

        let key = DecodingKey::from_secret(state.jwt_keys.access_secret.as_ref());
        let token_data = decode::<Claims>(token, &key, &Validation::default())
            .map_err(|_| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(ErrorResponse::new("Invalid token")),
                ).into_response()
            })?;

        let user_service = UserService::new(&state.pool);
        let user = user_service
            .get_user_by_id(&token_data.claims.sub.parse().map_err(|_| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(ErrorResponse::new("Invalid user ID in token")),
                ).into_response()
            })?)
            .await
            .map_err(|_| {
                (
                    StatusCode::UNAUTHORIZED,
                    Json(ErrorResponse::new("User not found")),
                ).into_response()
            })?;

        Ok(AuthUser { user })
    }
}

pub struct RequireRole;

#[async_trait]
impl FromRequestParts<AppState> for RequireRole {
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_user = AuthUser::from_request_parts(parts, state).await?;
        
        if auth_user.user.role != "admin" {
            return Err((
                StatusCode::FORBIDDEN,
                Json(ErrorResponse::new("Admin access required")),
            ).into_response());
        }

        Ok(RequireRole)
    }
}