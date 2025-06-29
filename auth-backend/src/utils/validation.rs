use validator::ValidationError;

pub fn validate_password_strength(password: &str) -> Result<(), ValidationError> {
    let mut score = 0;
    
    if password.len() >= 8 {
        score += 1;
    }
    if password.chars().any(|c| c.is_lowercase()) {
        score += 1;
    }
    if password.chars().any(|c| c.is_uppercase()) {
        score += 1;
    }
    if password.chars().any(|c| c.is_numeric()) {
        score += 1;
    }
    if password.chars().any(|c| "!@#$%^&*()_+-=[]{}|;:,.<>?".contains(c)) {
        score += 1;
    }
    
    if score < 4 {
        return Err(ValidationError::new("weak_password"));
    }
    
    Ok(())
}