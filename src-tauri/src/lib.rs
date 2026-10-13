// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct FileIcon {
    width: u32,
    height: u32,
    pixels: Vec<u8>,
}

#[tauri::command]
fn get_file_icon(path: String) -> Result<FileIcon, String> {
    let icon = file_icon_provider::get_file_icon(path, 64)
        .map_err(|error| error.to_string())?;

    Ok(FileIcon {
        width: icon.width,
        height: icon.height,
        pixels: icon.pixels,
    })
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet, get_file_icon])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
