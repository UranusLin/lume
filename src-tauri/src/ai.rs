use serde::{Deserialize, Serialize};
use reqwest::Client;
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

// --- OpenAI & Gemini (OpenAI-compatible) Structures ---
#[derive(Debug, Serialize, Deserialize)]
pub struct OpenAIRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
}

#[derive(Debug, Deserialize)]
pub struct OpenAIResponse {
    pub choices: Vec<OpenAIChoice>,
}

#[derive(Debug, Deserialize)]
pub struct OpenAIChoice {
    pub message: ChatMessage,
}

// --- Anthropic Structures ---
#[derive(Debug, Serialize, Deserialize)]
pub struct AnthropicRequest {
    pub model: String,
    pub max_tokens: u32,
    pub messages: Vec<ChatMessage>,
    pub system: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AnthropicResponse {
    pub content: Vec<AnthropicContent>,
}

#[derive(Debug, Deserialize)]
pub struct AnthropicContent {
    pub text: String,
}

fn parse_error_response(provider: &str, status: reqwest::StatusCode, body: &str) -> String {
    let json: Result<Value, _> = serde_json::from_str(body);
    
    match provider {
        "google" => {
            if let Ok(value) = json {
                // Handle both object { "error": ... } and array [{ "error": ... }]
                let error_obj = if value.is_array() {
                    value.get(0).and_then(|v| v.get("error"))
                } else {
                    value.get("error")
                };

                if let Some(error) = error_obj {
                    if let Some(msg) = error.get("message").and_then(|m| m.as_str()) {
                        if status.as_u16() == 429 {
                            return format!("Gemini Quota Exceeded: {}. Please wait a few seconds and try again.", msg.split('\n').next().unwrap_or(msg));
                        }
                        return format!("Gemini Error ({}): {}", status, msg);
                    }
                }
            }
        },
        "openai" => {
            if let Ok(v) = json {
                if let Some(error) = v.get("error") {
                    if let Some(msg) = error.get("message").and_then(|m| m.as_str()) {
                        return format!("OpenAI Error ({}): {}", status, msg);
                    }
                }
            }
        },
        "anthropic" => {
            if let Ok(v) = json {
                if let Some(error) = v.get("error") {
                    if let Some(msg) = error.get("message").and_then(|m| m.as_str()) {
                        return format!("Anthropic Error ({}): {}", status, msg);
                    }
                }
            }
        },
        _ => {}
    }

    format!("{} API Error ({}): {}", provider.to_uppercase(), status, body)
}

#[tauri::command]
pub async fn ai_complete(
    prompt: String, 
    model: String, 
    provider: String, 
    api_key: String
) -> Result<String, String> {
    if api_key.trim().is_empty() {
        return Err(format!("API Key for {} is not set. Please go to Settings to configure it.", provider));
    }

    let client = Client::new();
    let system_prompt = "You are a LaTeX expert assistant. Return only valid LaTeX code or helpful advice as requested.";

    match provider.as_str() {
        "openai" => {
            let request = OpenAIRequest {
                model: model.clone(),
                messages: vec![
                    ChatMessage { role: "system".to_string(), content: system_prompt.to_string() },
                    ChatMessage { role: "user".to_string(), content: prompt },
                ],
            };
            let response = client
                .post("https://api.openai.com/v1/chat/completions")
                .header("Authorization", format!("Bearer {}", api_key))
                .json(&request)
                .send()
                .await
                .map_err(|e| e.to_string())?;

            let status = response.status();
            let text = response.text().await.map_err(|e| e.to_string())?;

            if !status.is_success() {
                return Err(parse_error_response("openai", status, &text));
            }

            let parsed: OpenAIResponse = serde_json::from_str(&text)
                .map_err(|e| format!("Failed to parse OpenAI response: {}. Raw: {}", e, text))?;
            
            Ok(parsed.choices[0].message.content.clone())
        },
        "anthropic" => {
            let request = AnthropicRequest {
                model: model.clone(),
                max_tokens: 4096,
                system: Some(system_prompt.to_string()),
                messages: vec![
                    ChatMessage { role: "user".to_string(), content: prompt },
                ],
            };
            let response = client
                .post("https://api.anthropic.com/v1/messages")
                .header("x-api-key", api_key)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .json(&request)
                .send()
                .await
                .map_err(|e| e.to_string())?;

            let status = response.status();
            let text = response.text().await.map_err(|e| e.to_string())?;

            if !status.is_success() {
                return Err(parse_error_response("anthropic", status, &text));
            }

            let parsed: AnthropicResponse = serde_json::from_str(&text)
                .map_err(|e| format!("Failed to parse Anthropic response: {}. Raw: {}", e, text))?;
            
            Ok(parsed.content[0].text.clone())
        },
        "google" => {
            let request = OpenAIRequest {
                model: model.clone(),
                messages: vec![
                    ChatMessage { role: "system".to_string(), content: system_prompt.to_string() },
                    ChatMessage { role: "user".to_string(), content: prompt },
                ],
            };
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key={}",
                api_key
            );
            let response = client
                .post(url)
                .header("Authorization", format!("Bearer {}", api_key))
                .json(&request)
                .send()
                .await
                .map_err(|e| e.to_string())?;

            let status = response.status();
            let text = response.text().await.map_err(|e| e.to_string())?;

            if !status.is_success() {
                return Err(parse_error_response("google", status, &text));
            }

            let parsed: OpenAIResponse = serde_json::from_str(&text)
                .map_err(|e| format!("Failed to parse Google response: {}. Raw: {}", e, text))?;
            
            Ok(parsed.choices[0].message.content.clone())
        },
        _ => Err(format!("Unsupported AI provider: {}", provider)),
    }
}
