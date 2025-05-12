use calamine::{open_workbook_auto, Reader};

#[tauri::command]
pub fn get_sheet_names(file_path: String) -> Result<Vec<String>, String> {
    let workbook = open_workbook_auto(&file_path)
        .map_err(|e| format!("Failed to open workbook: {}", e))?;
    Ok(workbook.sheet_names())
}