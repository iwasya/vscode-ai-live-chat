import * as vscode from 'vscode';
import { getSettings } from './settings';
import { YouClient } from './youClient';

type WebviewMessage =
  | { type: 'sendMessage'; text: string }
  | { type: 'clearChat' };

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri): ChatPanel {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel.panel.reveal(column);
      return ChatPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'youLiveChat',
      'You Live Chat',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media')
        ]
      }
    );

    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
    return ChatPanel.currentPanel;
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.panel.webview.html = this.getHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (message: WebviewMessage) => this.handleMessage(message),
      null,
      this.disposables
    );
  }

  public async submitPrompt(prompt: string, visibleQuestion?: string): Promise<void> {
    this.panel.webview.postMessage({
      type: 'userMessage',
      text: visibleQuestion ?? prompt
    });

    await this.requestAnswer(prompt);
  }

  public clear(): void {
    this.panel.webview.postMessage({ type: 'clearChat' });
  }

  public dispose(): void {
    ChatPanel.currentPanel = undefined;

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      disposable?.dispose();
    }
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    if (message.type === 'clearChat') {
      this.clear();
      return;
    }

    if (message.type === 'sendMessage') {
      await this.submitPrompt(message.text);
    }
  }

  private async requestAnswer(prompt: string): Promise<void> {
    const settings = getSettings();

    if (!settings.apiKey) {
      this.panel.webview.postMessage({
        type: 'error',
        text: 'API key You.com belum diatur. Buka Settings dan isi youLiveChat.apiKey.'
      });
      return;
    }

    const localizedPrompt = [
      settings.language === 'id'
        ? 'Kamu adalah AI assistant untuk developer di VS Code. Jawab dengan jelas, praktis, dan langsung ke inti dalam bahasa Indonesia.'
        : 'You are an AI assistant for developers in VS Code. Answer clearly, practically, and directly in English.',
      settings.enableWebSearch
        ? 'Gunakan kemampuan research/web intelligence jika relevan.'
        : 'Fokus pada konteks yang diberikan user.',
      '',
      'Pertanyaan user:',
      prompt
    ].join('\n');

    this.panel.webview.postMessage({ type: 'loading', value: true });

    try {
      const client = new YouClient({ apiKey: settings.apiKey });
      const answer = await client.research(localizedPrompt);
      this.panel.webview.postMessage({ type: 'assistantMessage', text: answer });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi error yang tidak diketahui.';
      this.panel.webview.postMessage({ type: 'error', text: message });
    } finally {
      this.panel.webview.postMessage({ type: 'loading', value: false });
    }
  }

  private getHtml(): string {
    const webview = this.panel.webview;
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <title>You Live Chat</title>
</head>
<body>
  <header class="app-header">
    <div>
      <h1>You Live Chat</h1>
      <p>Mode: Research</p>
    </div>
    <button id="clearButton" class="icon-button" title="Clear chat" aria-label="Clear chat">Clear</button>
  </header>

  <main id="chat" class="chat" aria-live="polite"></main>

  <div id="loading" class="loading" hidden>AI sedang menjawab...</div>

  <form id="composer" class="composer">
    <textarea id="prompt" rows="3" placeholder="Tulis pertanyaan..." aria-label="Tulis pertanyaan"></textarea>
    <button id="sendButton" type="submit">Send</button>
  </form>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
