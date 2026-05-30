# You Live Chat for VS Code

Extension VS Code untuk live chat AI ringan menggunakan You.com Research API.

## Fitur MVP

- Buka panel chat dari Command Palette: `You Chat: Open Chat`
- Kirim pertanyaan ke You.com API
- Simpan API key melalui VS Code Settings: `youLiveChat.apiKey`
- Tanya berdasarkan kode yang dipilih: `You Chat: Ask Selected Code`
- Jelaskan file aktif: `You Chat: Explain Current File`
- Perbaiki kode yang dipilih: `You Chat: Fix Selected Code`
- Cek bug kode terpilih atau file aktif: `You Chat: Check Code Bugs`
- Analisis proyek dan saran perbaikan: `You Chat: Analyze Project and Suggest Improvements`
- Clear chat dan copy jawaban AI

## Menjalankan Lokal

1. Jalankan `npm install`
2. Jalankan `npm run compile`
3. Tekan `F5` di VS Code untuk membuka Extension Development Host
4. Isi setting `youLiveChat.apiKey`
5. Jalankan command `You Chat: Open Chat`

## Analisis Proyek

Command `You Chat: Analyze Project and Suggest Improvements` membaca file kode dari workspace aktif, mengabaikan folder seperti `node_modules`, `out`, `dist`, `build`, dan `.git`, lalu mengirim snapshot ringkas ke You.com API.

Setting yang bisa diatur:

- `youLiveChat.maxContextChars`: total maksimum karakter konteks
- `youLiveChat.projectMaxFiles`: jumlah maksimum file proyek yang dibaca

## Catatan API

MVP ini memakai You.com Research API:

```text
POST https://api.you.com/v1/research
Header: X-API-Key
Body: { "input": "...", "research_effort": "standard" }
```

Jika format response API berubah, update parsing di `src/youClient.ts`.
