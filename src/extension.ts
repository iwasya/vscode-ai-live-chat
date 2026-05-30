import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { ChatPanel } from './webview';

export function activate(context: vscode.ExtensionContext): void {
  ChatPanel.register(context);
  registerCommands(context);
}

export function deactivate(): void {}
