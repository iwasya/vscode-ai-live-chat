import * as vscode from 'vscode';

export type EditorContext = {
  fileName: string;
  languageId: string;
  text: string;
  truncated: boolean;
};

export type ProjectContext = {
  rootName: string;
  files: Array<{
    path: string;
    text: string;
    truncated: boolean;
  }>;
  truncated: boolean;
};

const projectFileGlob = '**/*.{ts,tsx,js,jsx,json,md,css,scss,html,vue,svelte,py,php,java,kt,go,rs,cs,cpp,c,h,sql,yml,yaml,sh}';
const projectExcludeGlob = '**/{node_modules,out,dist,build,.git,.vscode-test,coverage,vendor,target,.next,.nuxt}/**';

export function getSelectedText(): EditorContext | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    return undefined;
  }

  return {
    fileName: editor.document.fileName,
    languageId: editor.document.languageId,
    text: editor.document.getText(editor.selection),
    truncated: false
  };
}

export async function getProjectContext(maxChars: number, maxFiles: number): Promise<ProjectContext | undefined> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return undefined;
  }

  const uris = await vscode.workspace.findFiles(projectFileGlob, projectExcludeGlob, maxFiles);
  let remainingChars = maxChars;
  const files: ProjectContext['files'] = [];

  for (const uri of uris) {
    if (remainingChars <= 0) {
      break;
    }

    const bytes = await vscode.workspace.fs.readFile(uri);
    const fullText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    const sliceLength = Math.min(fullText.length, remainingChars, 4000);
    const text = fullText.slice(0, sliceLength);

    files.push({
      path: vscode.workspace.asRelativePath(uri, false),
      text,
      truncated: text.length < fullText.length
    });

    remainingChars -= text.length;
  }

  return {
    rootName: workspaceFolder.name,
    files,
    truncated: uris.length >= maxFiles || remainingChars <= 0
  };
}

export function getActiveFileText(maxChars: number): EditorContext | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return undefined;
  }

  const fullText = editor.document.getText();
  const truncated = fullText.length > maxChars;

  return {
    fileName: editor.document.fileName,
    languageId: editor.document.languageId,
    text: truncated ? fullText.slice(0, maxChars) : fullText,
    truncated
  };
}
