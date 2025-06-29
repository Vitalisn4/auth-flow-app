use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Settings {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_refresh_secret: String,
    pub cors_origin: String,
    pub server_port: u16,
}

impl Settings {
    pub fn new() -> anyhow::Result<Self> {
        dotenv::dotenv().ok();
        
        let settings = Settings {
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite:./auth.db".to_string()),
            jwt_secret: std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "your-super-secure-secret-key".to_string()),
            jwt_refresh_secret: std::env::var("JWT_REFRESH_SECRET")
                .unwrap_or_else(|_| "your-refresh-secret-key".to_string()),
            cors_origin: std::env::var("CORS_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            server_port: std::env::var("SERVER_PORT")
                .unwrap_or_else(|_| "3001".to_string())
                .parse()
                .unwrap_or(3001),
        };
        
        Ok(settings)
    }
}