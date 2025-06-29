use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: T,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ErrorResponse {
    pub success: bool,
    pub error: String,
    pub details: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DashboardStats {
    pub total_users: i64,
    pub active_sessions: i64,
    pub new_registrations_today: i64,
    pub login_attempts_today: i64,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActivityItem {
    pub id: String,
    pub action: String,
    pub user_email: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub status: String,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T, message: impl Into<String>) -> Self {
        Self {
            success: true,
            data,
            message: message.into(),
        }
    }
}

impl ErrorResponse {
    pub fn new(error: impl Into<String>) -> Self {
        Self {
            success: false,
            error: error.into(),
            details: None,
        }
    }

    pub fn with_details(error: impl Into<String>, details: serde_json::Value) -> Self {
        Self {
            success: false,
            error: error.into(),
            details: Some(details),
        }
    }
}