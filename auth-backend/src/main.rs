use auth_backend::{
    config::Settings,
    database::connection::create_connection_pool,
    handlers::{auth, user, admin, analytics},
    middleware::{cors::cors_layer, logging::logging_layer},
    utils::jwt::JwtKeys,
};
use axum::{
    routing::{get, post, put, delete},
    Router,
};
use std::sync::Arc;
use tower_http::services::ServeDir;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "AuthFlow API",
        description = "A secure authentication API built with Rust and Axum",
        version = "1.0.0"
    ),
    paths(
        auth::register,
        auth::login,
        auth::logout,
        auth::refresh_token,
        auth::get_current_user,
        user::get_profile,
        user::update_profile,
        user::change_password,
        user::delete_account,
        user::upload_avatar,
        admin::get_dashboard_stats,
        admin::get_recent_activity,
        analytics::logins_per_day,
    ),
    components(schemas(
        auth_backend::models::auth::RegisterRequest,
        auth_backend::models::auth::LoginRequest,
        auth_backend::models::auth::AuthResponse,
        auth_backend::models::auth::RefreshRequest,
        auth_backend::models::user::User,
        auth_backend::models::user::UserProfile,
        auth_backend::models::user::UpdateProfileRequest,
        auth_backend::models::user::ChangePasswordRequest,
        auth_backend::models::response::ApiResponse<auth_backend::models::auth::AuthResponse>,
        auth_backend::models::response::ErrorResponse,
    )),
    tags(
        (name = "auth", description = "Authentication endpoints"),
        (name = "user", description = "User management endpoints"),
        (name = "admin", description = "Admin endpoints")
    )
)]
#[allow(dead_code)]
struct ApiDoc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "auth_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let settings = Settings::new()?;
    
    // Create database connection pool
    let pool = create_connection_pool(&settings.database_url).await?;
    
    // Run migrations
    sqlx::migrate!("./migrations").run(&pool).await?;
    
    // Initialize JWT keys
    let jwt_keys = Arc::new(JwtKeys::new(
        settings.jwt_secret.clone(),
        settings.jwt_refresh_secret.clone(),
    ));

    // Create application state
    let app_state = auth_backend::AppState {
        pool,
        jwt_keys,
        settings: Arc::new(settings.clone()),
    };

    // Build our application with routes
    let app = Router::new()
        // API routes
        .nest("/api", api_routes())
        
        // Static file serving for avatars
        .nest_service("/uploads", ServeDir::new("uploads"))
        
        // Add middleware
        .layer(cors_layer(&settings.cors_origin))
        .layer(logging_layer())
        
        // Add application state
        .with_state(app_state);

    // TODO: Add Swagger UI back once we figure out the correct integration method

    // Create uploads directory
    tokio::fs::create_dir_all("uploads/avatars").await?;

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", settings.server_port)).await?;
    
    tracing::info!("Server starting on port {}", settings.server_port);
    tracing::info!("API available at http://localhost:{}/api", settings.server_port);
    tracing::info!("Swagger UI temporarily disabled - will be re-enabled later");
    
    axum::serve(listener, app).await?;

    Ok(())
}

fn api_routes() -> Router<auth_backend::AppState> {
    Router::new()
        // Authentication routes
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/logout", post(auth::logout))
        .route("/auth/refresh", post(auth::refresh_token))
        .route("/auth/me", get(auth::get_current_user))
        
        // User routes
        .route("/users/profile", get(user::get_profile))
        .route("/users/profile", put(user::update_profile))
        .route("/users/password", put(user::change_password))
        .route("/users/account", delete(user::delete_account))
        .route("/users/avatar", post(user::upload_avatar))
        
        // Admin routes
        .route("/admin/dashboard/stats", get(admin::get_dashboard_stats))
        .route("/admin/dashboard/activity", get(admin::get_recent_activity))
        .route("/admin/users", get(admin::list_users))
        
        // Analytics routes
        .route("/analytics/logins-per-day", get(analytics::logins_per_day))
}