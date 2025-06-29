use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use crate::{services::admin_service::AdminService, models::response::{ApiResponse, ErrorResponse}, AppState, middleware::auth::{AuthUser, RequireRole}};

#[utoipa::path(
    get,
    path = "/api/analytics/logins-per-day",
    responses(
        (status = 200, description = "Logins per day", body = ApiResponse<Vec<crate::services::admin_service::LoginsPerDay>>),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse)
    ),
    security(("bearer_auth" = [])),
    tag = "analytics"
)]
pub async fn logins_per_day(
    State(state): State<AppState>,
    _auth_user: AuthUser,
    _require_admin: RequireRole,
) -> impl IntoResponse {
    let admin_service = AdminService::new(&state.pool);
    match admin_service.get_logins_per_day().await {
        Ok(data) => (
            StatusCode::OK,
            Json(ApiResponse::success(data, "Logins per day retrieved")),
        ).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse::new(e.to_string())),
        ).into_response(),
    }
} 