use qrc::QRCode;

#[tauri::command]
pub fn generate_qrcode(value: &str) -> String {
    let qrcode = QRCode::from_string(value.to_string());
    qrcode.to_svg(200)
}
