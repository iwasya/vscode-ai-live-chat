import * as vscode from 'vscode';
import { getSettings } from './settings';

const apiKeySecretKey = 'youLiveChat.apiKey';
const apiBaseUrlSecretKey = 'youLiveChat.apiBaseUrl';
const modelSecretKey = 'youLiveChat.model';

export type ApiConnection = {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
};

export async function getApiKey(context: vscode.ExtensionContext): Promise<string> {
  const secretApiKey = await context.secrets.get(apiKeySecretKey);
  return secretApiKey?.trim() || getSettings().apiKey;
}

export async function getApiConnection(context: vscode.ExtensionContext): Promise<ApiConnection> {
  const settings = getSettings();
  const [secretApiKey, secretApiBaseUrl, secretModel] = await Promise.all([
    context.secrets.get(apiKeySecretKey),
    context.secrets.get(apiBaseUrlSecretKey),
    context.secrets.get(modelSecretKey)
  ]);

  return {
    apiKey: secretApiKey?.trim() || settings.apiKey,
    apiBaseUrl: secretApiBaseUrl?.trim() || settings.apiBaseUrl,
    model: secretModel?.trim() || settings.model
  };
}

export async function setApiKey(context: vscode.ExtensionContext): Promise<boolean> {
  const value = await vscode.window.showInputBox({
    title: 'Set AI API Key',
    prompt: 'API key akan disimpan di VS Code SecretStorage.',
    password: true,
    ignoreFocusOut: true,
    validateInput: (input) => input.trim() ? undefined : 'API key tidak boleh kosong.'
  });

  if (value === undefined) {
    return false;
  }

  await context.secrets.store(apiKeySecretKey, value.trim());
  vscode.window.showInformationMessage('API key berhasil disimpan dengan aman.');
  return true;
}

export async function setApiBaseUrl(context: vscode.ExtensionContext): Promise<boolean> {
  const settings = getSettings();
  const value = await vscode.window.showInputBox({
    title: 'Set AI API Base URL',
    prompt: 'Contoh: https://api.openai.com/v1, https://openrouter.ai/api/v1, atau https://api.you.com/v1/research.',
    value: settings.apiBaseUrl,
    ignoreFocusOut: true,
    validateInput: (input) => validateUrl(input.trim())
  });

  if (value === undefined) {
    return false;
  }

  await context.secrets.store(apiBaseUrlSecretKey, normalizeBaseUrl(value.trim()));
  vscode.window.showInformationMessage('AI API base URL berhasil disimpan.');
  return true;
}

export async function setModel(context: vscode.ExtensionContext): Promise<boolean> {
  const settings = getSettings();
  const value = await vscode.window.showInputBox({
    title: 'Set AI Model',
    prompt: 'Contoh: gpt-4o-mini, openai/gpt-4o-mini, deepseek-chat, llama-3.3-70b-versatile, atau research untuk You.com.',
    value: settings.model,
    ignoreFocusOut: true,
    validateInput: (input) => input.trim() ? undefined : 'Model tidak boleh kosong.'
  });

  if (value === undefined) {
    return false;
  }

  await context.secrets.store(modelSecretKey, value.trim());
  vscode.window.showInformationMessage('AI model berhasil disimpan.');
  return true;
}

export async function clearApiKey(context: vscode.ExtensionContext): Promise<void> {
  await context.secrets.delete(apiKeySecretKey);
  vscode.window.showInformationMessage('API key di SecretStorage sudah dihapus.');
}

export async function clearApiConnection(context: vscode.ExtensionContext): Promise<void> {
  await Promise.all([
    context.secrets.delete(apiKeySecretKey),
    context.secrets.delete(apiBaseUrlSecretKey),
    context.secrets.delete(modelSecretKey)
  ]);
  vscode.window.showInformationMessage('Konfigurasi AI API di SecretStorage sudah dihapus.');
}

export async function setApiConnection(context: vscode.ExtensionContext): Promise<void> {
  const didSetBaseUrl = await setApiBaseUrl(context);
  if (!didSetBaseUrl) {
    return;
  }

  const didSetModel = await setModel(context);
  if (!didSetModel) {
    return;
  }

  await setApiKey(context);
}

function validateUrl(value: string): string | undefined {
  if (!value) {
    return 'Base URL tidak boleh kosong.';
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? undefined : 'Gunakan URL http atau https.';
  } catch {
    return 'Base URL tidak valid.';
  }
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}
