use base64::{engine::general_purpose, Engine as _};
use serde::Deserialize;
use std::fs;
use std::path::Path;

#[derive(Debug, Deserialize)]
pub struct SaveImageRequest {
    pub directory: String,
    pub filename: String,
    pub data: String, // Base64 encoded image data
}

#[tauri::command]
pub fn save_image(request: SaveImageRequest) -> Result<String, String> {
    // Decode the base64 image data
    let data = request.data.replace("data:image/png;base64,", "");
    let decoded = general_purpose::STANDARD
        .decode(data)
        .map_err(|e| format!("Failed to decode image data: {}", e))?;

    // Create the full path
    let path = Path::new(&request.directory).join(&request.filename);
    
    // Ensure the directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Write the file
    fs::write(&path, decoded)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(format!("Successfully saved image to {}", path.display()))
}