use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct SlackMessage {
    pub user: String,
    pub text: String,
    pub ts: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SlackApiResponse {
    ok: bool,
    messages: Option<Vec<SlackMessage>>,
    error: Option<String>,
}

#[tauri::command]
async fn fetch_slack_message(
    channel_id: String,
    timestamp: String,
) -> Result<SlackMessage, String> {
    // 環境変数からSlackトークンを取得
    let token = env::var("SLACK_BOT_TOKEN")
        .map_err(|_| "SLACK_BOT_TOKEN環境変数が設定されていません".to_string())?;

    let client = reqwest::Client::new();
    let url = "https://slack.com/api/conversations.history";

    let response = client
        .get(url)
        .header("Authorization", format!("Bearer {}", token))
        .query(&[
            ("channel", channel_id.as_str()),
            ("latest", timestamp.as_str()),
            ("inclusive", "true"),
            ("limit", "1"),
        ])
        .send()
        .await
        .map_err(|e| format!("リクエストエラー: {}", e))?;

    let api_response: SlackApiResponse = response
        .json()
        .await
        .map_err(|e| format!("JSONパースエラー: {}", e))?;

    if !api_response.ok {
        return Err(format!(
            "Slack APIエラー: {}",
            api_response.error.unwrap_or_else(|| "不明なエラー".to_string())
        ));
    }

    let messages = api_response
        .messages
        .ok_or_else(|| "メッセージが見つかりません".to_string())?;

    let message = messages
        .into_iter()
        .next()
        .ok_or_else(|| "メッセージが空です".to_string())?;

    Ok(message)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![fetch_slack_message])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
