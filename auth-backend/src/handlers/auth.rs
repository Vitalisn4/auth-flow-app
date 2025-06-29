use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use validator::Validate;

use crate::{
    models::{
        auth::{RegisterRequest, LoginRequest, RefreshRequest},
        response::{ApiResponse, ErrorResponse},
    },
    services::auth_service::AuthService,
    middleware::auth::AuthUser,
    AppState,
};

/// Register a new user
#[utoipa::path(
    post,
    path = "/api/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "User registered successfully", body = ApiResponse<AuthResponse>),
        (status = 400, description = "Validation error", body = ErrorResponse),
        (status = 409, description = "User already exists", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(errors) = payload.validate() {
        let error_details = serde_json::to_value(&errors).unwrap_or_default();
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::with_details("Validation failed", error_details)),
        ).into_response();
    }

    let auth_service = AuthService::new(&state.pool, &state.jwt_keys);
    
    match auth_service.register(payload).await {
        Ok(auth_response) => (
            StatusCode::CREATED,
            Json(ApiResponse::success(auth_response, "User registered successfully")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Registration error: {:?}", e);
            let status = if e.to_string().contains("already exists") {
                StatusCode::CONFLICT
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            };
            (status, Json(ErrorResponse::new(e.to_string()))).into_response()
        }
    }
}

/// Login user
#[utoipa::path(
    post,
    path = "/api/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = ApiResponse<AuthResponse>),
        (status = 400, description = "Validation error", body = ErrorResponse),
        (status = 401, description = "Invalid credentials", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(errors) = payload.validate() {
        let error_details = serde_json::to_value(&errors).unwrap_or_default();
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::with_details("Validation failed", error_details)),
        ).into_response();
    }

    let auth_service = AuthService::new(&state.pool, &state.jwt_keys);
    
    match auth_service.login(payload).await {
        Ok(auth_response) => (
            StatusCode::OK,
            Json(ApiResponse::success(auth_response, "Login successful")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Login error: {:?}", e);
            let status = if e.to_string().contains("Invalid credentials") {
                StatusCode::UNAUTHORIZED
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            };
            (status, Json(ErrorResponse::new(e.to_string()))).into_response()
        }
    }
}

/// Logout user
#[utoipa::path(
    post,
    path = "/api/auth/logout",
    responses(
        (status = 200, description = "Logout successful", body = ApiResponse<String>),
        (status = 401, description = "Unauthorized", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "auth"
)]
pub async fn logout(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> impl IntoResponse {
    let auth_service = AuthService::new(&state.pool, &state.jwt_keys);
    
    match auth_service.logout(auth_user.user.id).await {
        Ok(_) => (
            StatusCode::OK,
            Json(ApiResponse::success("Logged out", "Logout successful")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Logout error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new(e.to_string())),
            ).into_response()
        }
    }
}

/// Refresh access token
#[utoipa::path(
    post,
    path = "/api/auth/refresh",
    request_body = RefreshRequest,
    responses(
        (status = 200, description = "Token refreshed successfully", body = ApiResponse<AuthResponse>),
        (status = 401, description = "Invalid refresh token", body = ErrorResponse)
    ),
    tag = "auth"
)]
pub async fn refresh_token(
    State(state): State<AppState>,
    Json(payload): Json<RefreshRequest>,
) -> impl IntoResponse {
    let auth_service = AuthService::new(&state.pool, &state.jwt_keys);
    
    match auth_service.refresh_token(payload.refresh_token).await {
        Ok(auth_response) => (
            StatusCode::OK,
            Json(ApiResponse::success(auth_response, "Token refreshed successfully")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Token refresh error: {:?}", e);
            (
                StatusCode::UNAUTHORIZED,
                Json(ErrorResponse::new("Invalid refresh token")),
            ).into_response()
        }
    }
}

/// Get current user
#[utoipa::path(
    get,
    path = "/api/auth/me",
    responses(
        (status = 200, description = "Current user retrieved", body = ApiResponse<User>),
        (status = 401, description = "Unauthorized", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "auth"
)]
pub async fn get_current_user(auth_user: AuthUser) -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(ApiResponse::success(auth_user.user, "Current user retrieved")),
    )
}