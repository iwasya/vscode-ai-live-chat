import * as vscode from 'vscode';
import { getActiveFileText, getProjectContext, getSelectedText } from './contextReader';
import { getSettings } from './settings';
import { ChatPanel } from './webview';

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('youLiveChat.openChat', () => {
      ChatPanel.createOrShow(context.extensionUri);
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

      await ChatPanel.createOrShow(context.extensionUri).submitPrompt(prompt, 'Analisis kode yang dipilih');
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

      await ChatPanel.createOrShow(context.extensionUri).submitPrompt(prompt, 'Jelaskan file aktif');
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

      await ChatPanel.createOrShow(context.extensionUri).submitPrompt(prompt, 'Perbaiki kode yang dipilih');
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

      await ChatPanel.createOrShow(context.extensionUri).submitPrompt(prompt, selected ? 'Cek bug kode yang dipilih' : 'Cek bug file aktif');
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

      await ChatPanel.createOrShow(context.extensionUri).submitPrompt(prompt, 'Analisis proyek dan saran perbaikan');
    }),
    vscode.commands.registerCommand('youLiveChat.clearChat', () => {
      ChatPanel.currentPanel?.clear();
    })
  );
}
