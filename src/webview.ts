import * as vscode from 'vscode';
import { getActiveFileText, getProjectContext } from './contextReader';
import { getApiKey } from './secrets';
import { getSettings } from './settings';
import { YouClient } from './youClient';

type WebviewMessage =
  | { type: 'sendMessage'; text: string; includeWorkspace?: boolean }
  | { type: 'clearChat' }
  | { type: 'insertAnswer'; text: string }
  | { type: 'replaceSelection'; text: string }
  | { type: 'historyChanged'; messages: ChatMessage[] };

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
};

const historyKey = 'youLiveChat.chatHistory';

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext): ChatPanel {
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
          vscode.Uri.joinPath(context.extensionUri, 'media')
        ]
      }
    );

    ChatPanel.currentPanel = new ChatPanel(panel, context);
    return ChatPanel.currentPanel;
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this.panel = panel;
    this.context = context;
    this.extensionUri = context.extensionUri;

    this.panel.webview.html = this.getHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (message: WebviewMessage) => this.handleMessage(message),
      null,
      this.disposables
    );
  }

  public async submitPrompt(prompt: string, visibleQuestion?: string, includeWorkspace = false): Promise<void> {
    this.panel.webview.postMessage({
      type: 'userMessage',
      text: visibleQuestion ?? prompt
    });

    await this.requestAnswer(prompt, includeWorkspace);
  }

  public clear(): void {
    this.panel.webview.postMessage({ type: 'clearChat' });
    void this.context.workspaceState.update(historyKey, []);
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
      await this.submitPrompt(message.text, undefined, Boolean(message.includeWorkspace));
      return;
    }

    if (message.type === 'insertAnswer') {
      await insertAtCursor(message.text);
      return;
    }

    if (message.type === 'replaceSelection') {
      await replaceSelectionWithAnswer(message.text);
      return;
    }

    if (message.type === 'historyChanged') {
      await this.context.workspaceState.update(historyKey, message.messages.slice(-80));
    }
  }

  private async requestAnswer(prompt: string, includeWorkspace: boolean): Promise<void> {
    const settings = getSettings();
    const apiKey = await getApiKey(this.context);

    if (!apiKey) {
      this.panel.webview.postMessage({
        type: 'error',
        text: 'API key You.com belum diatur. Jalankan command "You Chat: Set API Key".'
      });
      return;
    }

    this.panel.webview.postMessage({ type: 'loading', value: true });

    const workspaceContext = includeWorkspace
      ? await buildWorkspaceContext(settings.maxContextChars, settings.projectMaxFiles)
      : '';

    const localizedPrompt = [
      settings.language === 'id'
        ? 'Kamu adalah AI assistant untuk developer di VS Code. Jawab dengan jelas, praktis, dan langsung ke inti dalam bahasa Indonesia.'
        : 'You are an AI assistant for developers in VS Code. Answer clearly, practically, and directly in English.',
      includeWorkspace
        ? 'Kamu menerima konteks workspace lokal dari extension VS Code. Gunakan konteks itu sebagai sumber utama. Jangan mengatakan bahwa kamu tidak bisa membaca proyek lokal jika konteks workspace sudah dilampirkan.'
        : 'Jika konteks workspace tidak dilampirkan, jangan mengklaim sudah membaca file lokal.',
      settings.enableWebSearch
        ? 'Gunakan kemampuan research/web intelligence jika relevan.'
        : 'Fokus pada konteks yang diberikan user.',
      workspaceContext,
      '',
      'Pertanyaan user:',
      prompt
    ].join('\n');

    try {
      const client = new YouClient({ apiKey });
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
    const savedHistory = escapeAttribute(JSON.stringify(this.context.workspaceState.get<ChatMessage[]>(historyKey, [])));

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
  <div id="initialState" data-messages="${savedHistory}" hidden></div>
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
    <label class="workspace-toggle" title="Lampirkan snapshot workspace lokal ke prompt berikutnya">
      <input id="workspaceToggle" type="checkbox">
      <span>Use Workspace</span>
    </label>
    <textarea id="prompt" rows="3" placeholder="Tulis pertanyaan..." aria-label="Tulis pertanyaan"></textarea>
    <button id="sendButton" type="submit">Send</button>
  </form>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

async function buildWorkspaceContext(maxChars: number, maxFiles: number): Promise<string> {
  const activeFile = getActiveFileText(Math.min(maxChars, 8000));
  const project = await getProjectContext(maxChars, maxFiles);

  if (!activeFile && (!project || project.files.length === 0)) {
    return '\nKonteks workspace: tidak ada workspace atau file aktif yang bisa dibaca.\n';
  }

  const sections: string[] = [
    '',
    'Konteks workspace lokal dari VS Code extension:',
    'Catatan privasi: konteks ini hanya dilampirkan karena user mengaktifkan Use Workspace atau menjalankan command eksplisit.'
  ];

  if (activeFile) {
    sections.push(
      '',
      `File aktif: ${activeFile.fileName}`,
      `Bahasa file aktif: ${activeFile.languageId}`,
      activeFile.truncated ? `Catatan: file aktif dipotong sampai ${Math.min(maxChars, 8000)} karakter.` : '',
      'Isi file aktif:',
      '```',
      activeFile.text,
      '```'
    );
  }

  if (project && project.files.length > 0) {
    sections.push(
      '',
      `Nama workspace: ${project.rootName}`,
      project.truncated ? `Catatan: snapshot proyek dipotong. Maksimum ${maxFiles} file dan ${maxChars} karakter.` : '',
      'Snapshot file proyek:'
    );

    for (const file of project.files) {
      sections.push(
        '',
        `File: ${file.path}`,
        file.truncated ? 'Catatan: file ini dipotong.' : '',
        '```',
        file.text,
        '```'
      );
    }
  }

  return sections.filter((line) => line !== '').join('\n');
}

async function insertAtCursor(text: string): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Tidak ada editor aktif untuk insert jawaban.');
    return;
  }

  await editor.edit((builder) => {
    builder.insert(editor.selection.active, extractBestCode(text));
  });
}

async function replaceSelectionWithAnswer(text: string): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Tidak ada editor aktif untuk replace selection.');
    return;
  }

  if (editor.selection.isEmpty) {
    vscode.window.showWarningMessage('Pilih kode dulu sebelum replace selection.');
    return;
  }

  await editor.edit((builder) => {
    builder.replace(editor.selection, extractBestCode(text));
  });
}

function extractBestCode(text: string): string {
  const fenced = text.match(/```(?:[\w.+-]+)?\s*([\s\S]*?)```/);
  return (fenced?.[1] ?? text).trim();
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getNonce(): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
