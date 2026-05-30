import * as vscode from 'vscode';

export type YouLiveChatSettings = {
  apiKey: string;
  defaultMode: 'research';
  maxContextChars: number;
  projectMaxFiles: number;
  language: 'id' | 'en';
  enableWebSearch: boolean;
};

export function getSettings(): YouLiveChatSettings {
  const config = vscode.workspace.getConfiguration('youLiveChat');

  return {
    apiKey: config.get<string>('apiKey', '').trim(),
    defaultMode: 'research',
    maxContextChars: config.get<number>('maxContextChars', 12000),
    projectMaxFiles: config.get<number>('projectMaxFiles', 25),
    language: config.get<'id' | 'en'>('language', 'id'),
    enableWebSearch: config.get<boolean>('enableWebSearch', true)
  };
}
