use calamine::{open_workbook_auto, DataType, Reader};
use rayon::prelude::*;
use serde_json::{json, Value};

#[tauri::command]
pub fn get_sheet_names(file_path: String) -> Result<Vec<String>, String> {
    let workbook =
        open_workbook_auto(&file_path).map_err(|e| format!("Failed to open workbook: {}", e))?;
    Ok(workbook.sheet_names())
}

#[tauri::command]
pub fn get_sheet_data(file_path: String, sheet_name: String) -> Result<String, String> {
    // Open the workbook
    let mut workbook =
        open_workbook_auto(&file_path).map_err(|e| format!("Failed to open workbook: {}", e))?;

    let range = workbook.worksheet_range(sheet_name.as_str()).map_err(|_|"Failed to extract worksheet table".to_string())?;
    let headers = range.headers().ok_or("No headers found")?;

    // Skip the header row
    let range = range.rows().skip(1);
    let result: Vec<Value> = range
        .collect::<Vec<_>>()
        .par_iter()
        .map(|row| {
            let mut row_obj = serde_json::Map::new();
            for (index, col) in row.iter().enumerate() {
                if index < headers.len() {
                    let header = &headers[index];
                    let value = col.as_string().unwrap_or_default();
                    row_obj.insert(header.to_string(), json!(value));
                }
            }
            Value::Object(row_obj)
        })
        .collect();
    let json = serde_json::to_string(&result).map_err(|e| format!("Failed to serialize: {}", e))?;
    Ok(json)
}
