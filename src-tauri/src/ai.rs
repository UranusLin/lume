use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Debug, Deserialize)]
pub struct AIRequest {
    pub prompt: String,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GPTRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
}

#[derive(Debug, Deserialize)]
pub struct GPTResponse {
    pub choices: Vec<GPTChoice>,
}

#[derive(Debug, Deserialize)]
pub struct GPTChoice {
    pub message: ChatMessage,
}

#[tauri::command]
pub async fn ai_complete(prompt: String, model: String) -> Result<String, String> {
    let api_key = std::env::var("OPENAI_API_KEY").map_err(|_| "OPENAI_API_KEY not set")?;
    let client = Client::new();

    let request = GPTRequest {
        model: model.clone(),
        messages: vec![
            ChatMessage {
                role: "system".to_string(),
                content: "You are a LaTeX expert assistant. Return only valid LaTeX code or helpful advice as requested.".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: prompt,
            },
        ],
    };

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<GPTResponse>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.choices[0].message.content.clone())
}
