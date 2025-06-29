use anyhow::Result;
use chrono::{Utc, Duration, DateTime};
use sqlx::SqlitePool;
use serde::Serialize;
use uuid::Uuid;

use crate::models::response::{DashboardStats, ActivityItem};

pub struct AdminService<'a> {
    pool: &'a SqlitePool,
}

#[derive(Debug, Serialize)]
pub struct LoginsPerDay {
    pub date: String,
    pub logins: i64,
}

impl<'a> AdminService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_dashboard_stats(&self) -> Result<DashboardStats> {
        // Get total users
        let total_users: i32 = sqlx::query_scalar!("SELECT COUNT(*) FROM users")
            .fetch_one(self.pool)
            .await?;

        // Get active sessions (refresh tokens created in last 10 minutes)
        let ten_minutes_ago = Utc::now() - Duration::minutes(10);
        let active_sessions: i32 = sqlx::query_scalar!(
            "SELECT COUNT(DISTINCT user_id) FROM refresh_tokens WHERE created_at > ?",
            ten_minutes_ago
        )
        .fetch_one(self.pool)
        .await?;

        // Get new registrations today
        let today = Utc::now().date_naive();
        let new_registrations_today: i32 = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM users WHERE DATE(created_at) = ?",
            today
        )
        .fetch_one(self.pool)
        .await?;

        // Get login attempts today (approximate by counting refresh tokens created today)
        let login_attempts_today: i32 = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM refresh_tokens WHERE DATE(created_at) = ?",
            today
        )
        .fetch_one(self.pool)
        .await?;

        Ok(DashboardStats {
            total_users: total_users.into(),
            active_sessions: active_sessions.into(),
            new_registrations_today: new_registrations_today.into(),
            login_attempts_today: login_attempts_today.into(),
        })
    }

    pub async fn get_recent_activity(&self) -> Result<Vec<ActivityItem>> {
        // Get recent user registrations
        let registrations = sqlx::query!(
            r#"
            SELECT id, email, created_at, 'User registration' as action, 'success' as status
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 10
            "#
        )
        .fetch_all(self.pool)
        .await?;

        // Get recent login attempts (refresh token creations)
        let logins = sqlx::query!(
            r#"
            SELECT rt.id, u.email, rt.created_at, 'User login' as action, 'success' as status
            FROM refresh_tokens rt
            JOIN users u ON rt.user_id = u.id
            ORDER BY rt.created_at DESC
            LIMIT 10
            "#
        )
        .fetch_all(self.pool)
        .await?;

        let mut activities = Vec::new();

        // Add registrations
        for reg in registrations {
            activities.push(ActivityItem {
                id: Uuid::from_slice(&reg.id.expect("User ID should not be null")).unwrap().to_string(),
                action: reg.action,
                user_email: reg.email,
                timestamp: DateTime::parse_from_rfc3339(&reg.created_at)?.with_timezone(&Utc),
                status: reg.status,
            });
        }

        // Add logins
        for login in logins {
            activities.push(ActivityItem {
                id: Uuid::from_slice(&login.id.expect("Refresh token ID should not be null")).unwrap().to_string(),
                action: login.action,
                user_email: login.email,
                timestamp: DateTime::parse_from_rfc3339(&login.created_at)?.with_timezone(&Utc),
                status: login.status,
            });
        }

        // Sort by timestamp descending and take top 20
        activities.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        activities.truncate(20);

        Ok(activities)
    }

    pub async fn get_logins_per_day(&self) -> Result<Vec<LoginsPerDay>> {
        let rows = sqlx::query!(
            r#"
            SELECT strftime('%w', created_at) as weekday, COUNT(*) as logins
            FROM refresh_tokens
            WHERE created_at >= datetime('now', '-6 days')
            GROUP BY weekday
            ORDER BY weekday
            "#
        )
        .fetch_all(self.pool)
        .await?;

        let day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let mut result = Vec::new();
        for row in rows {
            let idx: usize = row.weekday.as_ref().unwrap().parse().unwrap_or(0);
            result.push(LoginsPerDay {
                date: day_names[idx].to_string(),
                logins: row.logins as i64,
            });
        }
        Ok(result)
    }
}