use axum::{
    extract::{State, Multipart},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use validator::Validate;

use crate::{
    models::{
        user::{UpdateProfileRequest, ChangePasswordRequest, UserProfile},
        response::{ApiResponse, ErrorResponse},
    },
    services::user_service::UserService,
    middleware::auth::AuthUser,
    AppState,
};

/// Get user profile
#[utoipa::path(
    get,
    path = "/api/users/profile",
    responses(
        (status = 200, description = "User profile retrieved", body = ApiResponse<UserProfile>),
        (status = 401, description = "Unauthorized", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "user"
)]
pub async fn get_profile(auth_user: AuthUser) -> impl IntoResponse {
    let profile: UserProfile = auth_user.user.into();
    (
        StatusCode::OK,
        Json(ApiResponse::success(profile, "Profile retrieved successfully")),
    )
}

/// Update user profile
#[utoipa::path(
    put,
    path = "/api/users/profile",
    request_body = UpdateProfileRequest,
    responses(
        (status = 200, description = "Profile updated successfully", body = ApiResponse<UserProfile>),
        (status = 400, description = "Validation error", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "user"
)]
pub async fn update_profile(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(payload): Json<UpdateProfileRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(errors) = payload.validate() {
        let error_details = serde_json::to_value(&errors).unwrap_or_default();
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::with_details("Validation failed", error_details)),
        ).into_response();
    }

    let user_service = UserService::new(&state.pool);
    
    match user_service.update_profile(auth_user.user.id, payload).await {
        Ok(user) => {
            let profile: UserProfile = user.into();
            (
                StatusCode::OK,
                Json(ApiResponse::success(profile, "Profile updated successfully")),
            ).into_response()
        }
        Err(e) => {
            tracing::error!("Profile update error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new(e.to_string())),
            ).into_response()
        }
    }
}

/// Change user password
#[utoipa::path(
    put,
    path = "/api/users/password",
    request_body = ChangePasswordRequest,
    responses(
        (status = 200, description = "Password changed successfully", body = ApiResponse<String>),
        (status = 400, description = "Validation error", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "user"
)]
pub async fn change_password(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(payload): Json<ChangePasswordRequest>,
) -> impl IntoResponse {
    // Validate request
    if let Err(errors) = payload.validate() {
        let error_details = serde_json::to_value(&errors).unwrap_or_default();
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::with_details("Validation failed", error_details)),
        ).into_response();
    }

    let user_service = UserService::new(&state.pool);
    
    match user_service.change_password(auth_user.user.id, payload).await {
        Ok(_) => (
            StatusCode::OK,
            Json(ApiResponse::success("Password changed", "Password changed successfully")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Password change error: {:?}", e);
            let status = if e.to_string().contains("Invalid current password") {
                StatusCode::BAD_REQUEST
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            };
            (status, Json(ErrorResponse::new(e.to_string()))).into_response()
        }
    }
}

/// Delete user account
#[utoipa::path(
    delete,
    path = "/api/users/account",
    responses(
        (status = 200, description = "Account deleted successfully", body = ApiResponse<String>),
        (status = 401, description = "Unauthorized", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "user"
)]
pub async fn delete_account(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> impl IntoResponse {
    let user_service = UserService::new(&state.pool);
    
    match user_service.delete_account(auth_user.user.id).await {
        Ok(_) => (
            StatusCode::OK,
            Json(ApiResponse::success("Account deleted", "Account deleted successfully")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Account deletion error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new(e.to_string())),
            ).into_response()
        }
    }
}

/// Upload user avatar
#[utoipa::path(
    post,
    path = "/api/users/avatar",
    responses(
        (status = 200, description = "Avatar uploaded successfully", body = ApiResponse<String>),
        (status = 400, description = "Invalid file", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "user"
)]
pub async fn upload_avatar(
    State(state): State<AppState>,
    auth_user: AuthUser,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let user_service = UserService::new(&state.pool);
    
    match user_service.upload_avatar(auth_user.user.id, &mut multipart).await {
        Ok(avatar_url) => (
            StatusCode::OK,
            Json(ApiResponse::success(avatar_url, "Avatar uploaded successfully")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Avatar upload error: {:?}", e);
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse::new(e.to_string())),
            ).into_response()
        }
    }
}