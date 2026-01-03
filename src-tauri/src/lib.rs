use serde::{Deserialize, Serialize};
use std::env;
use std::process::Command;

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

// GitHub Pull Request の型定義
#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubUser {
    pub login: String,
    #[serde(rename = "avatarUrl")]
    pub avatar_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubPullRequest {
    pub title: String,
    pub number: u32,
    pub state: String,
    #[serde(rename = "isDraft")]
    pub is_draft: bool,
    pub author: GitHubUser,
    pub assignees: Vec<GitHubUser>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub url: String,
}

#[tauri::command]
async fn fetch_github_pr(
    owner: String,
    repo: String,
    number: u32,
) -> Result<GitHubPullRequest, String> {
    // gh pr view コマンドを実行
    let output = Command::new("gh")
        .args([
            "pr", "view",
            &number.to_string(),
            "--repo", &format!("{}/{}", owner, repo),
            "--json", "title,number,state,isDraft,author,assignees,createdAt,url"
        ])
        .output()
        .map_err(|e| format!("gh コマンド実行エラー: {}. gh CLIがインストールされているか確認してください。", e))?;

    if !output.status.success() {
        let error_message = String::from_utf8_lossy(&output.stderr);
        return Err(format!("gh コマンドエラー: {}", error_message));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| format!("出力のパースエラー: {}", e))?;

    let pr: GitHubPullRequest = serde_json::from_str(&stdout)
        .map_err(|e| format!("JSONパースエラー: {}", e))?;

    Ok(pr)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![fetch_slack_message, fetch_github_pr])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
