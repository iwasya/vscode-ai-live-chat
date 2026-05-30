import * as vscode from 'vscode';
import { getActiveFileText, getProjectContext, getSelectedText } from './contextReader';
import { clearApiKey, setApiKey } from './secrets';
import { getSettings } from './settings';
import { ChatPanel } from './webview';

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('youLiveChat.openChat', async () => {
      await ChatPanel.createOrShow(context);
    }),
    vscode.commands.registerCommand('youLiveChat.setApiKey', async () => {
      await setApiKey(context);
    }),
    vscode.commands.registerCommand('youLiveChat.clearApiKey', async () => {
      await clearApiKey(context);
    }),
    vscode.commands.registerCommand('youLiveChat.askSelection', async () => {
      const selected = getSelectedText();
      if (!selected) {
        vscode.window.showWarningMessage('Pilih kode terlebih dahulu untuk ditanyakan.');
        return;
      }

      const prompt = [
        'Jelaskan kode berikut dalam bahasa Indonesia.',
        'Berikan:',
        '1. Fungsi utama kode',
        '2. Alur kerja',
        '3. Potensi masalah',
        '4. Saran perbaikan jika ada',
        '',
        `Bahasa file: ${selected.languageId}`,
        'Kode:',
        '```',
        selected.text,
        '```'
      ].join('\n');

      const chat = await ChatPanel.createOrShow(context);
      await chat.submitPrompt(prompt, 'Analisis kode yang dipilih');
    }),
    vscode.commands.registerCommand('youLiveChat.explainFile', async () => {
      const settings = getSettings();
      const file = getActiveFileText(settings.maxContextChars);
      if (!file) {
        vscode.window.showWarningMessage('Tidak ada file aktif untuk dijelaskan.');
        return;
      }

      const prompt = [
        'Jelaskan file berikut dalam bahasa Indonesia.',
        'Berikan ringkasan struktur, fungsi utama, alur penting, potensi masalah, dan saran perbaikan.',
        file.truncated ? `Catatan: isi file dipotong sampai ${settings.maxContextChars} karakter.` : '',
        '',
        `File: ${file.fileName}`,
        `Bahasa: ${file.languageId}`,
        'Isi file:',
        '```',
        file.text,
        '```'
      ].filter(Boolean).join('\n');

      const chat = await ChatPanel.createOrShow(context);
      await chat.submitPrompt(prompt, 'Jelaskan file aktif');
    }),
    vscode.commands.registerCommand('youLiveChat.fixSelection', async () => {
      const selected = getSelectedText();
      if (!selected) {
        vscode.window.showWarningMessage('Pilih kode terlebih dahulu untuk diperbaiki.');
        return;
      }

      const prompt = [
        'Perbaiki kode berikut.',
        'Berikan:',
        '1. Penyebab masalah',
        '2. Kode yang sudah diperbaiki',
        '3. Penjelasan perubahan',
        '',
        `Bahasa file: ${selected.languageId}`,
        'Kode:',
        '```',
        selected.text,
        '```'
      ].join('\n');

      const chat = await ChatPanel.createOrShow(context);
      await chat.submitPrompt(prompt, 'Perbaiki kode yang dipilih');
    }),
    vscode.commands.registerCommand('youLiveChat.checkBugs', async () => {
      const settings = getSettings();
      const selected = getSelectedText();
      const file = selected ?? getActiveFileText(settings.maxContextChars);

      if (!file) {
        vscode.window.showWarningMessage('Tidak ada kode aktif untuk dicek bug.');
        return;
      }

      const prompt = [
        selected
          ? 'Cek bug pada kode yang dipilih berikut.'
          : 'Cek bug pada file aktif berikut.',
        'Fokus pada bug nyata, edge case, masalah runtime, masalah typing, risiko security, dan logical error.',
        'Berikan:',
        '1. Daftar bug/risiko berdasarkan prioritas',
        '2. Lokasi atau bagian kode yang bermasalah',
        '3. Dampak bug',
        '4. Saran perbaikan yang spesifik',
        '5. Contoh patch/kode jika relevan',
        file.truncated ? `Catatan: konteks dipotong sampai ${settings.maxContextChars} karakter.` : '',
        '',
        `File: ${file.fileName}`,
        `Bahasa: ${file.languageId}`,
        'Kode:',
        '```',
        file.text,
        '```'
      ].filter(Boolean).join('\n');

      const chat = await ChatPanel.createOrShow(context);
      await chat.submitPrompt(prompt, selected ? 'Cek bug kode yang dipilih' : 'Cek bug file aktif');
    }),
    vscode.commands.registerCommand('youLiveChat.explainProblems', async () => {
      const diagnostics = collectDiagnostics();
      if (!diagnostics) {
        vscode.window.showInformationMessage('Tidak ada error atau warning di Problems untuk workspace/editor aktif.');
        return;
      }

      const prompt = [
        'Jelaskan dan prioritaskan Problems VS Code berikut.',
        'Berikan penyebab, dampak, dan langkah fix yang konkret. Jika memungkinkan, berikan contoh patch.',
        '',
        diagnostics
      ].join('\n');

      const chat = await ChatPanel.createOrShow(context);
      await chat.submitPrompt(prompt, 'Jelaskan Problems VS Code');
    }),
    vscode.commands.registerCommand('youLiveChat.analyzeProject', async () => {
      const settings = getSettings();
      const project = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'You Live Chat membaca konteks proyek...',
          cancellable: false
        },
        () => getProjectContext(settings.maxContextChars, settings.projectMaxFiles)
      );

      if (!project || project.files.length === 0) {
        vscode.window.showWarningMessage('Tidak ada workspace atau file proyek yang bisa dianalisis.');
        return;
      }

      const projectSnapshot = project.files.map((file) => [
        `File: ${file.path}`,
        file.truncated ? 'Catatan: file ini dipotong.' : '',
        '```',
        file.text,
        '```'
      ].filter(Boolean).join('\n')).join('\n\n');

      const prompt = [
        'Analisis proyek VS Code berikut dan beri saran perbaikan.',
        'Fokus pada arsitektur, struktur folder, kualitas kode, bug potensial, security, DX, maintainability, dan fitur yang belum lengkap.',
        'Berikan output dalam bahasa Indonesia dengan format:',
        '1. Ringkasan kondisi proyek',
        '2. Masalah atau risiko prioritas tinggi',
        '3. Saran perbaikan konkret',
        '4. Quick wins yang bisa langsung dikerjakan',
        '5. File yang paling perlu diperhatikan',
        project.truncated ? `Catatan: konteks proyek dipotong. Maksimum ${settings.projectMaxFiles} file dan ${settings.maxContextChars} karakter.` : '',
        '',
        `Nama proyek: ${project.rootName}`,
        'Snapshot file:',
        projectSnapshot
      ].filter(Boolean).join('\n');

      const chat = await ChatPanel.createOrShow(context);
      await chat.submitPrompt(prompt, 'Analisis proyek dan saran perbaikan');
    }),
    vscode.commands.registerCommand('youLiveChat.clearChat', () => {
      ChatPanel.currentPanel?.clear();
    })
  );
}

function collectDiagnostics(): string | undefined {
  const activeUri = vscode.window.activeTextEditor?.document.uri;
  const entries = activeUri
    ? [[activeUri, vscode.languages.getDiagnostics(activeUri)] as const]
    : vscode.languages.getDiagnostics();

  const lines = entries.flatMap(([uri, diagnostics]) => {
    return diagnostics
      .filter((diagnostic) => diagnostic.severity <= vscode.DiagnosticSeverity.Warning)
      .slice(0, 25)
      .map((diagnostic) => {
        const severity = diagnostic.severity === vscode.DiagnosticSeverity.Error ? 'Error' : 'Warning';
        const line = diagnostic.range.start.line + 1;
        const character = diagnostic.range.start.character + 1;
        const source = diagnostic.source ? ` [${diagnostic.source}]` : '';
        return `- ${severity}${source} ${vscode.workspace.asRelativePath(uri, false)}:${line}:${character} ${diagnostic.message}`;
      });
  });

  return lines.length ? lines.join('\n') : undefined;
}
