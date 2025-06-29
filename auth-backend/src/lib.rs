pub mod config;
pub mod database;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod services;
pub mod utils;

use sqlx::SqlitePool;
use std::sync::Arc;
use crate::{config::Settings, utils::jwt::JwtKeys};

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub jwt_keys: Arc<JwtKeys>,
    pub settings: Arc<Settings>,
}