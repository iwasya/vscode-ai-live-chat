import * as vscode from 'vscode';
import { getSettings } from './settings';

const apiKeySecretKey = 'youLiveChat.apiKey';

export async function getApiKey(context: vscode.ExtensionContext): Promise<string> {
  const secretApiKey = await context.secrets.get(apiKeySecretKey);
  return secretApiKey?.trim() || getSettings().apiKey;
}

export async function setApiKey(context: vscode.ExtensionContext): Promise<void> {
  const value = await vscode.window.showInputBox({
    title: 'Set You.com API Key',
    prompt: 'API key akan disimpan di VS Code SecretStorage.',
    password: true,
    ignoreFocusOut: true,
    validateInput: (input) => input.trim() ? undefined : 'API key tidak boleh kosong.'
  });

  if (value === undefined) {
    return;
  }

  await context.secrets.store(apiKeySecretKey, value.trim());
  vscode.window.showInformationMessage('API key You.com berhasil disimpan dengan aman.');
}

export async function clearApiKey(context: vscode.ExtensionContext): Promise<void> {
  await context.secrets.delete(apiKeySecretKey);
  vscode.window.showInformationMessage('API key You.com di SecretStorage sudah dihapus.');
}
