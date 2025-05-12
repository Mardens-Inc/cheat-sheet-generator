mod commands;
use commands::excel_commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![excel_commands::get_sheet_names])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
