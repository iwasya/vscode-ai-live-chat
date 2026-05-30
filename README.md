# You Live Chat for VS Code

Extension VS Code untuk live chat AI ringan menggunakan You.com Research API.

## GitHub About

Description:

```text
VS Code AI live chat extension powered by You.com API, with selected code analysis, bug checking, and project improvement suggestions.
```

Topics:

```text
vscode-extension, ai-chat, you-com-api, coding-assistant, bug-checker, typescript
```

## Fitur MVP

- Buka panel chat dari Command Palette: `You Chat: Open Chat`
- Kirim pertanyaan ke You.com API
- Simpan API key aman melalui SecretStorage: `You Chat: Set API Key`
- Tanya berdasarkan kode yang dipilih: `You Chat: Ask Selected Code`
- Jelaskan file aktif: `You Chat: Explain Current File`
- Perbaiki kode yang dipilih: `You Chat: Fix Selected Code`
- Cek bug kode terpilih atau file aktif: `You Chat: Check Code Bugs`
- Jelaskan error/warning dari Problems: `You Chat: Explain Problems`
- Analisis proyek dan saran perbaikan: `You Chat: Analyze Project and Suggest Improvements`
- Clear chat, copy jawaban AI, insert jawaban ke editor, dan replace selection dari jawaban AI
- Toggle `Use Workspace` di chat untuk melampirkan konteks file aktif dan snapshot proyek ke pertanyaan biasa
- Slash command langsung dari input chat: `/you`, `/ask`, `/fix`, `/bugs`, `/file`, `/project`, `/problems`, `/key`, `/clear`
- Ketik `/` di input chat untuk melihat autocomplete command
- Chat sidebar dibuka di sisi kanan agar terasa seperti assistant panel modern.

## Posisi Sidebar

Extension ini memberi default `workbench.sideBar.location` ke `right` dan command `You Chat: Open Chat` akan memindahkan sidebar ke kanan. VS Code belum menyediakan manifest resmi untuk memaksa hanya satu extension view default ke Secondary Sidebar; jika ingin hanya You Live Chat yang ada di kanan, pindahkan view-nya secara manual ke Secondary Sidebar lewat UI VS Code.

## Slash Commands

Ketik command berikut langsung di input chat:

- `/you` atau `/help`: tampilkan daftar command
- `/ask [instruksi]`: tanya berdasarkan selection, atau file aktif jika tidak ada selection
- `/fix [instruksi]`: perbaiki selection/file aktif
- `/bugs [instruksi]`: cek bug selection/file aktif
- `/file [instruksi]`: baca file aktif
- `/project`: analisis proyek
- `/problems`: jelaskan Problems VS Code
- `/key`: simpan API key
- `/clear`: hapus chat

## Menjalankan Lokal

1. Jalankan `npm install`
2. Jalankan `npm run compile`
3. Tekan `F5` di VS Code untuk membuka Extension Development Host
4. Jalankan command `You Chat: Set API Key`
5. Jalankan command `You Chat: Open Chat`

## Install dari VSIX

Build paket extension:

```bash
npm run package
```

Install hasil package:

```bash
code --install-extension you-live-chat-vscode-0.2.0.vsix
```

## Release Otomatis

Repo ini punya GitHub Actions untuk membuat Release otomatis saat tag `vX.Y.Z` dipush.

Contoh release versi patch:

```bash
npm version patch
git push origin main --tags
```

Workflow akan compile, package `.vsix`, membuat GitHub Release, dan meng-upload file `.vsix` sebagai asset release.

## Analisis Proyek

Command `You Chat: Analyze Project and Suggest Improvements` membaca file kode dari workspace aktif, mengabaikan folder seperti `node_modules`, `out`, `dist`, `build`, dan `.git`, lalu mengirim snapshot ringkas ke You.com API.

Di panel chat, aktifkan `Use Workspace` agar pertanyaan biasa juga membawa konteks workspace lokal. Extension membaca file melalui VS Code API, lalu melampirkan snapshot terbatas sesuai setting di bawah.

Setting yang bisa diatur:

- `youLiveChat.maxContextChars`: total maksimum karakter konteks
- `youLiveChat.projectMaxFiles`: jumlah maksimum file proyek yang dibaca

## Editor Actions

Setiap jawaban AI punya tombol:

- `Copy`: salin jawaban
- `Insert`: masukkan jawaban atau code block utama ke posisi cursor
- `Replace Selection`: ganti kode yang sedang dipilih dengan code block utama dari jawaban

## Catatan API

MVP ini memakai You.com Research API:

```text
POST https://api.you.com/v1/research
Header: X-API-Key
Body: { "input": "...", "research_effort": "standard" }
```

Jika format response API berubah, update parsing di `src/youClient.ts`.
