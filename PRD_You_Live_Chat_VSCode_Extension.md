# PRD - You Live Chat VS Code Extension

**Nama produk sementara:** You Live Chat for VS Code  
**Jenis produk:** Visual Studio Code Extension  
**Target pengguna:** Developer, mahasiswa IT, programmer, technical writer, dan pengguna VS Code  
**Versi dokumen:** 1.0  
**Status:** Draft MVP  

---

## 1. Ringkasan Produk

You Live Chat for VS Code adalah extension Visual Studio Code yang menyediakan fitur live chat AI langsung di dalam editor. Extension ini dirancang agar pengguna dapat bertanya, menjelaskan kode, menganalisis error, memperbaiki kode, mencari referensi teknis, dan menggunakan konteks dari file aktif tanpa perlu berpindah ke browser.

Integrasi utama menggunakan You.com API sebagai sumber AI dan web intelligence. Pada versi awal, extension difokuskan pada fitur chat panel, pengaturan API key, pengiriman prompt, pembacaan selected code, dan penjelasan file aktif.

---

## 2. Latar Belakang Masalah

Developer sering berpindah antara VS Code, browser, dokumentasi, forum, AI chat, dan terminal ketika mengerjakan kode. Perpindahan konteks ini membuat proses kerja kurang efisien, terutama ketika pengguna hanya ingin menanyakan error, meminta penjelasan kode, atau mencari referensi teknis secara cepat.

Masalah utama yang ingin diselesaikan:

1. Developer perlu bantuan AI tanpa meninggalkan VS Code.
2. Developer sering membutuhkan penjelasan kode, error, dan dokumentasi secara cepat.
3. Developer membutuhkan jawaban berbasis informasi web yang relatif terbaru.
4. Banyak AI coding assistant terlalu kompleks untuk kebutuhan sederhana.
5. Pengguna ingin extension ringan yang dapat menggunakan API key sendiri.

---

## 3. Tujuan Produk

Tujuan produk ini adalah membuat VS Code extension yang dapat:

1. Menampilkan panel live chat AI di dalam VS Code.
2. Menghubungkan pertanyaan pengguna ke You.com API.
3. Membantu menjelaskan kode yang dipilih pengguna.
4. Membantu memperbaiki error atau bug.
5. Membantu membuat kode berdasarkan instruksi pengguna.
6. Mengambil konteks dari file aktif.
7. Menyimpan API key secara aman.
8. Memberikan pengalaman chat yang ringan, cepat, dan mudah dipakai.

---

## 4. Sasaran Pengguna

### 4.1 Developer Pemula

Membutuhkan bantuan untuk memahami error, syntax, function, struktur kode, dan konsep teknis dasar.

### 4.2 Developer Menengah

Membutuhkan bantuan untuk refactor kode, generate function, membuat dokumentasi, dan mencari referensi teknis.

### 4.3 Mahasiswa IT

Membutuhkan bantuan untuk memahami tugas pemrograman, debugging, algoritma, framework, dan konsep software development.

### 4.4 Freelancer / Indie Developer

Membutuhkan assistant cepat di dalam VS Code untuk mempercepat pembuatan project.

---

## 5. Scope Produk

### 5.1 MVP

| Kode | Fitur | Deskripsi |
|---|---|---|
| F-01 | Open Chat Panel | Pengguna dapat membuka panel chat dari Command Palette. |
| F-02 | Chat UI | Pengguna dapat mengetik pertanyaan dan melihat jawaban. |
| F-03 | Integrasi You.com API | Extension mengirim prompt ke You.com API. |
| F-04 | API Key Setting | Pengguna dapat menyimpan API key. |
| F-05 | Loading State | UI menampilkan status saat AI sedang menjawab. |
| F-06 | Error Handling | UI menampilkan pesan error jika request gagal. |
| F-07 | Chat History Sementara | Riwayat chat tersimpan selama panel aktif. |
| F-08 | Ask Selected Code | Pengguna dapat bertanya berdasarkan kode yang dipilih. |
| F-09 | Explain Active File | AI dapat menjelaskan isi file aktif. |
| F-10 | Copy Answer | Pengguna dapat menyalin jawaban AI. |

### 5.2 Fitur Setelah MVP

| Kode | Fitur | Deskripsi |
|---|---|---|
| F-11 | Insert Answer to Editor | Jawaban AI dapat dimasukkan ke file aktif. |
| F-12 | Fix Selected Code | AI memperbaiki kode yang dipilih. |
| F-13 | Refactor Selected Code | AI merapikan struktur kode. |
| F-14 | Generate Unit Test | AI membuat unit test dari kode. |
| F-15 | Explain Error from Terminal | AI menjelaskan error dari terminal. |
| F-16 | Persistent Chat History | Riwayat chat tersimpan lokal. |
| F-17 | Multiple Chat Sessions | Pengguna dapat membuat beberapa sesi chat. |
| F-18 | API Mode Selector | Pengguna dapat memilih mode API. |
| F-19 | Streaming Response | Jawaban tampil bertahap seperti live chat. |
| F-20 | Markdown Rendering | Jawaban tampil dengan format Markdown. |

### 5.3 Non-Scope Versi Awal

Fitur berikut tidak termasuk dalam MVP:

1. Login akun pengguna.
2. Sinkronisasi cloud.
3. Marketplace payment.
4. Multi-provider AI.
5. Fine-tuning model.
6. Auto-complete seperti GitHub Copilot.
7. Indexing seluruh repository secara otomatis.
8. Kolaborasi real-time antar pengguna.
9. Web dashboard admin.
10. Sistem langganan internal.

---

## 6. User Flow

### 6.1 Membuka Chat

```text
User membuka VS Code
-> Tekan Ctrl + Shift + P
-> Pilih "You Chat: Open Chat"
-> Panel chat terbuka di samping editor
-> User mengetik pertanyaan
-> Extension mengirim request ke You.com API
-> Jawaban tampil di panel
```

### 6.2 Bertanya Berdasarkan Kode yang Dipilih

```text
User memilih potongan kode
-> Klik kanan
-> Pilih "Ask You Chat About Selection"
-> Panel chat terbuka
-> Kode terpilih dikirim sebagai konteks
-> AI menjelaskan, memperbaiki, atau memberi saran
```

### 6.3 Menjelaskan File Aktif

```text
User membuka file
-> Menjalankan command "Explain Current File"
-> Extension mengambil isi file aktif
-> AI memberikan ringkasan fungsi file
```

---

## 7. Functional Requirements

### 7.1 Chat Panel

Extension harus menyediakan panel chat berbasis Webview.

Kebutuhan:

1. Panel memiliki area riwayat percakapan.
2. Panel memiliki textarea input.
3. Panel memiliki tombol kirim.
4. Panel dapat menerima pesan dari extension backend.
5. Panel dapat mengirim pesan ke extension backend.
6. Panel mendukung tampilan loading.
7. Panel mendukung pesan error.
8. Panel otomatis scroll ke jawaban terbaru.

### 7.2 API Key Management

Extension harus menyediakan cara untuk menyimpan API key You.com.

Kebutuhan:

1. Pengguna dapat memasukkan API key dari VS Code Settings.
2. Pada versi lanjutan, API key disimpan menggunakan SecretStorage VS Code.
3. Extension menolak request jika API key belum tersedia.
4. API key tidak boleh ditampilkan di chat panel.
5. API key tidak boleh masuk ke log.

### 7.3 You.com API Integration

Extension harus dapat mengirim request ke You.com API.

Mode integrasi awal yang direkomendasikan:

| Mode | Fungsi |
|---|---|
| Research API | Untuk pertanyaan kompleks dan jawaban berbasis sumber. |
| Search API | Untuk pencarian web cepat. |
| Contents API | Untuk membaca isi halaman dari URL tertentu. |

Untuk MVP, mode utama yang direkomendasikan adalah Research API karena lebih cocok untuk pengalaman chat berbasis pertanyaan.

Catatan: endpoint, header, payload, dan response final harus disesuaikan dengan dokumentasi You.com API yang aktif pada akun developer pengguna.

### 7.4 Ask Selected Code

Extension harus dapat membaca teks yang sedang dipilih pengguna di editor.

Kebutuhan:

1. Jika ada selected text, extension mengambil teks tersebut.
2. Extension membuat prompt otomatis.
3. Prompt dikirim ke You.com API.
4. Jawaban ditampilkan di panel chat.

Contoh prompt internal:

```text
Jelaskan kode berikut secara ringkas dan beri saran jika ada potensi bug:

{selected_code}
```

### 7.5 Explain Current File

Extension harus dapat mengambil isi file aktif.

Kebutuhan:

1. Ambil file yang sedang dibuka.
2. Batasi jumlah karakter agar tidak melebihi limit request.
3. Kirim isi file sebagai konteks.
4. AI mengembalikan ringkasan struktur, fungsi, dan saran perbaikan.

### 7.6 Error Handling

| Kondisi | Pesan yang Ditampilkan |
|---|---|
| API key kosong | API key You.com belum diatur. |
| API key salah | API key tidak valid atau tidak memiliki akses. |
| Internet gagal | Gagal terhubung ke You.com API. |
| Rate limit | Limit request API tercapai. |
| Response kosong | Tidak ada jawaban dari API. |
| File terlalu besar | File terlalu besar, pilih bagian kode tertentu. |

---

## 8. Non-Functional Requirements

### 8.1 Performance

1. Panel chat harus terbuka dengan cepat.
2. Extension tidak boleh membuat VS Code freeze.
3. Request API harus asynchronous.
4. File besar harus dipotong sebelum dikirim ke API.
5. Riwayat chat MVP cukup disimpan di memory.

### 8.2 Security

1. API key tidak boleh hardcode di source code.
2. API key tidak boleh tampil di UI.
3. API key tidak boleh masuk ke console log.
4. Selected code hanya dikirim ketika user melakukan aksi eksplisit.
5. Extension harus menjelaskan bahwa kode akan dikirim ke API eksternal.

### 8.3 Compatibility

1. Mendukung VS Code desktop.
2. Target minimum VS Code: versi 1.90 ke atas.
3. Bahasa utama extension: TypeScript.
4. UI menggunakan HTML, CSS, dan JavaScript di Webview.

---

## 9. Desain Sistem

### 9.1 Arsitektur

```text
VS Code
|
|-- Extension Backend
|   |-- Command Handler
|   |-- Editor Context Reader
|   |-- API Key Manager
|   |-- You.com API Client
|
|-- Webview Chat UI
|   |-- Chat History
|   |-- Input Box
|   |-- Loading State
|   |-- Error Display
|
|-- You.com API
    |-- Research API
    |-- Search API
    |-- Contents API
```

### 9.2 Struktur Folder

```text
you-live-chat-vscode/
|-- package.json
|-- tsconfig.json
|-- README.md
|-- src/
|   |-- extension.ts
|   |-- youClient.ts
|   |-- webview.ts
|   |-- commands.ts
|   |-- contextReader.ts
|   |-- settings.ts
|-- media/
|   |-- main.js
|   |-- style.css
|   |-- icons/
|-- assets/
    |-- logo.png
```

---

## 10. Command VS Code

| Command ID | Nama Command | Fungsi |
|---|---|---|
| youLiveChat.openChat | You Chat: Open Chat | Membuka panel chat. |
| youLiveChat.askSelection | You Chat: Ask Selected Code | Bertanya berdasarkan kode terpilih. |
| youLiveChat.explainFile | You Chat: Explain Current File | Menjelaskan file aktif. |
| youLiveChat.fixSelection | You Chat: Fix Selected Code | Memperbaiki kode terpilih. |
| youLiveChat.clearChat | You Chat: Clear Chat | Menghapus riwayat chat. |

---

## 11. VS Code Settings

| Setting | Tipe | Default | Deskripsi |
|---|---|---|---|
| youLiveChat.apiKey | string | "" | API key You.com. |
| youLiveChat.defaultMode | string | research | Mode API default. |
| youLiveChat.maxContextChars | number | 12000 | Batas karakter konteks. |
| youLiveChat.language | string | id | Bahasa jawaban default. |
| youLiveChat.enableWebSearch | boolean | true | Mengaktifkan mode web search. |

---

## 12. Data yang Disimpan

### 12.1 MVP

| Data | Lokasi | Keterangan |
|---|---|---|
| API Key | VS Code Settings | Sementara untuk versi awal. |
| Chat History | Memory Webview | Hilang saat panel ditutup. |
| User Preference | VS Code Settings | Mode, bahasa, max context. |

### 12.2 Versi Lanjutan

| Data | Lokasi | Keterangan |
|---|---|---|
| API Key | SecretStorage | Lebih aman. |
| Chat History | GlobalState / WorkspaceState | Bisa dibuka lagi. |
| Session List | Local Extension Storage | Multi-session. |

---

## 13. UI Requirements

### 13.1 Layout Chat Panel

Komponen UI:

1. Header: nama extension, tombol clear chat, indikator mode API.
2. Chat Area: bubble user, bubble AI, Markdown rendering, code block.
3. Input Area: textarea, tombol send, shortcut Ctrl + Enter.
4. Action Buttons: copy, insert to editor, explain more, regenerate.

### 13.2 Sketsa Tampilan

```text
+--------------------------------------+
| You Live Chat                         |
| Mode: Research                        |
+--------------------------------------+
| You: Jelaskan kode ini                |
|                                      |
| AI: Kode ini berfungsi untuk...       |
|                                      |
+--------------------------------------+
| Tulis pertanyaan...           [Send] |
+--------------------------------------+
```

---

## 14. Prompt Template

### 14.1 General Chat

```text
Kamu adalah AI assistant untuk developer di VS Code.
Jawab dengan jelas, praktis, dan langsung ke inti.

Pertanyaan user:
{user_question}
```

### 14.2 Explain Code

```text
Jelaskan kode berikut dalam bahasa Indonesia.
Berikan:
1. Fungsi utama kode
2. Alur kerja
3. Potensi masalah
4. Saran perbaikan jika ada

Kode:
{selected_code}
```

### 14.3 Fix Code

```text
Perbaiki kode berikut.
Berikan:
1. Penyebab masalah
2. Kode yang sudah diperbaiki
3. Penjelasan perubahan

Kode:
{selected_code}
```

### 14.4 Refactor Code

```text
Refactor kode berikut agar lebih bersih, mudah dibaca, dan maintainable.
Jangan mengubah fungsi utama kode.

Kode:
{selected_code}
```

---

## 15. Acceptance Criteria

### 15.1 Open Chat Panel

Diterima jika:

1. User dapat menjalankan command dari Command Palette.
2. Panel chat muncul di VS Code.
3. Panel tidak error saat dibuka.
4. Input chat dapat diketik.

### 15.2 Send Message

Diterima jika:

1. User dapat mengirim pertanyaan.
2. Extension mengirim request ke You.com API.
3. Jawaban tampil di chat panel.
4. Loading muncul selama proses request.

### 15.3 API Key

Diterima jika:

1. Jika API key kosong, sistem menampilkan error.
2. Jika API key valid, request berhasil.
3. API key tidak tampil di UI chat.

### 15.4 Ask Selected Code

Diterima jika:

1. User dapat memilih kode.
2. User menjalankan command Ask Selected Code.
3. Kode terpilih masuk ke prompt.
4. Jawaban AI relevan dengan kode tersebut.

### 15.5 Explain Current File

Diterima jika:

1. User membuka file.
2. Command Explain Current File dapat dijalankan.
3. Isi file dikirim sebagai konteks.
4. AI memberikan penjelasan file.

---

## 16. Roadmap Pengembangan

### Tahap 1 - Setup Extension

Target:

1. Buat project TypeScript VS Code extension.
2. Buat command open chat.
3. Buat Webview UI.
4. Tes panel dapat terbuka.

Output:

```text
Extension lokal bisa dijalankan dengan F5.
```

### Tahap 2 - Integrasi You.com API

Target:

1. Buat youClient.ts.
2. Tambah setting API key.
3. Kirim prompt ke API.
4. Tampilkan response ke chat.

Output:

```text
User bisa chat dengan You.com API dari VS Code.
```

### Tahap 3 - Context Editor

Target:

1. Ambil selected code.
2. Ambil active file.
3. Buat command explain/fix/refactor.
4. Tampilkan hasil ke panel.

Output:

```text
Extension bisa membantu analisis kode langsung dari editor.
```

### Tahap 4 - UX Improvement

Target:

1. Markdown rendering.
2. Copy answer.
3. Insert answer to editor.
4. Clear chat.
5. Shortcut keyboard.

Output:

```text
Extension nyaman dipakai untuk coding harian.
```

### Tahap 5 - Packaging

Target:

1. Tambahkan icon.
2. Tulis README.
3. Buat file .vsix.
4. Tes install manual.

Output:

```text
Extension bisa dibagikan dan diinstall secara lokal.
```

### Tahap 6 - Publish

Target:

1. Buat publisher VS Code Marketplace.
2. Publish extension.
3. Buat dokumentasi penggunaan.
4. Buat changelog.

Output:

```text
Extension tersedia di VS Code Marketplace.
```

---

## 17. Tech Stack

| Bagian | Teknologi |
|---|---|
| Extension | TypeScript |
| Runtime | Node.js |
| Editor API | VS Code Extension API |
| UI | Webview HTML/CSS/JS |
| API | You.com API |
| Build | TypeScript Compiler |
| Packaging | VSCE |
| Storage | VS Code Settings, SecretStorage |
| Version Control | GitHub |

---

## 18. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Endpoint You.com berubah | Extension gagal request | Buat API client modular. |
| API key bocor | Masalah keamanan | Gunakan SecretStorage. |
| File terlalu besar | Request gagal atau mahal | Batasi karakter konteks. |
| Jawaban lambat | UX buruk | Tambah loading dan timeout. |
| Rate limit API | User gagal chat | Tampilkan pesan limit. |
| Response API tidak konsisten | Parsing gagal | Buat fallback parser. |
| Webview rentan XSS | Risiko keamanan | Sanitasi Markdown/HTML. |

---

## 19. Prioritas Backlog

### Prioritas Tinggi

1. Setup VS Code extension TypeScript.
2. Open Chat Panel.
3. Chat UI.
4. API key setting.
5. You.com API client.
6. Send message.
7. Display answer.
8. Error handling.
9. Ask selected code.
10. Explain current file.

### Prioritas Sedang

1. Markdown rendering.
2. Copy answer.
3. Insert answer to editor.
4. Clear chat.
5. Save chat history.
6. Prompt templates.
7. Mode selector.

### Prioritas Rendah

1. Multi-session.
2. Theme customization.
3. Export chat.
4. Publish Marketplace.
5. Multi-provider AI.
6. Team workspace.

---

## 20. Estimasi Versi Produk

### Versi 0.1.0 - MVP Local

Fitur:

1. Open chat panel.
2. Kirim pertanyaan.
3. Jawaban dari You.com API.
4. API key via settings.
5. Error handling dasar.

### Versi 0.2.0 - Coding Assistant

Fitur:

1. Ask selected code.
2. Explain current file.
3. Fix selected code.
4. Refactor selected code.

### Versi 0.3.0 - UX Release

Fitur:

1. Markdown rendering.
2. Copy button.
3. Insert to editor.
4. Chat history local.

### Versi 1.0.0 - Public Release

Fitur:

1. Stable API integration.
2. SecretStorage.
3. Documentation.
4. VSIX package.
5. Siap publish Marketplace.

---

## 21. Definisi Sukses

Produk dianggap berhasil jika:

1. Extension dapat dipasang dan dijalankan di VS Code.
2. User dapat chat dengan You.com API tanpa membuka browser.
3. User dapat bertanya berdasarkan selected code.
4. User dapat menjelaskan file aktif.
5. Error API ditangani dengan jelas.
6. Extension ringan dan tidak mengganggu performa VS Code.
7. Project siap dipush ke GitHub sebagai open-source.

---

## 22. Kesimpulan

You Live Chat for VS Code layak dibuat sebagai AI coding assistant ringan berbasis You.com API. MVP tidak terlalu besar, tetapi memiliki value yang jelas: developer dapat bertanya, menjelaskan kode, memperbaiki error, dan mencari informasi langsung dari VS Code.

Rekomendasi eksekusi awal:

```text
1. Setup extension TypeScript
2. Buat Webview chat
3. Tambahkan setting API key
4. Integrasikan You.com API
5. Tampilkan jawaban di panel
```

Setelah MVP berhasil, fitur coding assistant seperti Ask Selected Code, Fix Code, Refactor Code, dan Insert Answer to Editor dapat ditambahkan secara bertahap.
