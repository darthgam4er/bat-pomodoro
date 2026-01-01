use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager, State, WindowEvent,
};

// Discord client state
struct DiscordState {
    client: Mutex<Option<DiscordIpcClient>>,
}

// Discord Application ID
const DISCORD_CLIENT_ID: &str = "1453887107910074398";

#[tauri::command]
fn update_discord_status(
    discord: State<DiscordState>,
    mode: String,
    time_left: i64,
    is_overtime: bool,
    overtime_seconds: i64,
    session: i32,
    total_sessions: i32,
    // Custom settings from frontend
    image_url: String,
    focus_text: String,
    break_text: String,
) -> Result<(), String> {
    let mut client_guard = discord.client.lock().map_err(|e| e.to_string())?;
    
    // Initialize client if needed
    if client_guard.is_none() {
        let mut client = DiscordIpcClient::new(DISCORD_CLIENT_ID).map_err(|e| e.to_string())?;
        if client.connect().is_err() {
            return Err("Could not connect to Discord".to_string());
        }
        *client_guard = Some(client);
    }
    
    let client = client_guard.as_mut().ok_or("Discord client not initialized")?;
    
    // Format time
    let time_display = if is_overtime {
        format!("+{}:{:02} overtime", overtime_seconds / 60, overtime_seconds % 60)
    } else {
        format!("{}:{:02} remaining", time_left / 60, time_left % 60)
    };
    
    // Use custom settings from frontend
    let (state_text, large_text) = match mode.as_str() {
        "focus" => (
            format!("Session {}/{} ⚙️", session, total_sessions),
            focus_text.clone(),
        ),
        "shortBreak" | "longBreak" => (
            break_text.clone(),
            if mode == "longBreak" { "Long Rest 🌙".to_string() } else { "Short Rest ✨".to_string() },
        ),
        _ => (
            "Standing By".to_string(),
            "Mahoraga Timer".to_string(),
        ),
    };
    
    let activity = activity::Activity::new()
        .state(&state_text)
        .details(&time_display)
        .assets(
            activity::Assets::new()
                .large_image(&image_url)
                .large_text(&large_text)
        );
    
    client.set_activity(activity).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn clear_discord_status(discord: State<DiscordState>) -> Result<(), String> {
    let mut client_guard = discord.client.lock().map_err(|e| e.to_string())?;
    
    if let Some(client) = client_guard.as_mut() {
        let _ = client.clear_activity();
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(DiscordState {
            client: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            update_discord_status,
            clear_discord_status
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            app.handle().plugin(tauri_plugin_fs::init())?;
            app.handle().plugin(tauri_plugin_notification::init())?;

            // System Tray Setup
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show Bat Pomodoro", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app: &tauri::AppHandle, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray: &tauri::tray::TrayIcon, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        // Prevent closing, hide instead (Minimize to Tray)
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
