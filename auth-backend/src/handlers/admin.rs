use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};

#[allow(unused_imports)]
use crate::{
    models::response::{ApiResponse, ErrorResponse, DashboardStats, ActivityItem},
    services::admin_service::AdminService,
    services::user_service::UserService,
    middleware::auth::{AuthUser, RequireRole},
    AppState,
    models::user::User,
};

/// Get dashboard statistics
#[utoipa::path(
    get,
    path = "/api/admin/dashboard/stats",
    responses(
        (status = 200, description = "Dashboard stats retrieved", body = ApiResponse<DashboardStats>),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "admin"
)]
pub async fn get_dashboard_stats(
    State(state): State<AppState>,
    _auth_user: AuthUser,
    _require_admin: RequireRole,
) -> impl IntoResponse {
    let admin_service = AdminService::new(&state.pool);
    
    match admin_service.get_dashboard_stats().await {
        Ok(stats) => (
            StatusCode::OK,
            Json(ApiResponse::success(stats, "Dashboard stats retrieved")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Dashboard stats error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new(e.to_string())),
            ).into_response()
        }
    }
}

/// Get recent activity
#[utoipa::path(
    get,
    path = "/api/admin/dashboard/activity",
    responses(
        (status = 200, description = "Recent activity retrieved", body = ApiResponse<Vec<ActivityItem>>),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "admin"
)]
pub async fn get_recent_activity(
    State(state): State<AppState>,
    _auth_user: AuthUser,
    _require_admin: RequireRole,
) -> impl IntoResponse {
    let admin_service = AdminService::new(&state.pool);
    
    match admin_service.get_recent_activity().await {
        Ok(activity) => (
            StatusCode::OK,
            Json(ApiResponse::success(activity, "Recent activity retrieved")),
        ).into_response(),
        Err(e) => {
            tracing::error!("Recent activity error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new(e.to_string())),
            ).into_response()
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/admin/users",
    responses(
        (status = 200, description = "List all users", body = ApiResponse<Vec<User>>),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "admin"
)]
pub async fn list_users(
    State(state): State<AppState>,
    _auth_user: AuthUser,
    _require_admin: RequireRole,
) -> impl IntoResponse {
    let user_service = UserService::new(&state.pool);
    match user_service.list_users().await {
        Ok(users) => (
            StatusCode::OK,
            Json(ApiResponse::success(users, "User list retrieved")),
        ).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse::new(e.to_string())),
        ).into_response(),
    }
}