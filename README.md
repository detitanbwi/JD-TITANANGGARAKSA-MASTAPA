# JD-TITANANGGARAKSA-MASTAPA
# 🏡 MASTAPA – Masyarakat Taat Pajak

**MASTAPA** adalah aplikasi mobile berbasis **Kodular** untuk membantu proses **pemungutan pajak desa** agar lebih transparan, rapi, dan terpercaya.  
Aplikasi ini ditujukan untuk **billman/pemungut pajak** yang melakukan penagihan door-to-door di desa.  

---

## 🎯 Latar Belakang
Di banyak desa, pemungutan pajak masih dilakukan manual oleh perangkat desa (billman).  
Sering kali **setoran pajak tidak langsung sampai ke pihak desa**, sehingga masyarakat mendapati tagihan menumpuk padahal mereka sudah membayar.  
Hal ini menimbulkan masalah kepercayaan, dan data pajak sulit diverifikasi.  

**MASTAPA hadir sebagai solusi**:  
- Pemungut dapat langsung mencatat pembayaran di aplikasi.  
- Setiap transaksi dilengkapi **foto bukti pembayaran**.  
- Data disimpan secara **aman offline** (SQLite / TinyDB).  
- Bisa disinkronisasi ke **Google Spreadsheet & Google Drive** sebagai pusat data desa.  

---

## ✨ Fitur Utama
- 📌 **Pencatatan Pembayaran Pajak**
  - Input berdasarkan **NOP (Nomor Objek Pajak)**.  
  - Data: nama, alamat, besaran pajak tahunan.  
  - Input pembayaran (tahun, bulan, jumlah).  
  - Foto bukti pembayaran wajib (langsung kamera, bukan galeri).  

- 📋 **Daftar Riwayat**
  - Lihat semua pembayaran per NOP.  
  - Tampilkan status lunas / belum lunas per tahun.  

- 🔍 **Pencarian & Filter**
  - Cari berdasarkan NOP atau nama wajib pajak.  
  - Filter berdasarkan tahun.  

- 📊 **Ringkasan Pajak**
  - Total pajak masuk per hari/bulan.  
  - Daftar wajib pajak yang belum bayar.  

- ☁️ **Integrasi Online (Opsional)**
  - Sinkronisasi ke **Google Spreadsheet** (database pajak).  
  - Foto bukti otomatis diupload ke **Google Drive**.  
  - Memanfaatkan **Google App Script** untuk memproses data.  

---

## 🖼️ Tampilan Aplikasi
(Screenshot atau mockup aplikasi di sini)  
- Dashboard  
- Input Pembayaran  
- Daftar Riwayat  
- Detail Pembayaran (dengan foto)  

---

## 🚀 Cara Menjalankan
1. Clone repository ini.  
2. Import file `.aia` ke [Kodular Creator](https://creator.kodular.io).  
3. Build menjadi APK.  
4. Install di Android device.  
5. (Opsional) Setup Google Spreadsheet + App Script untuk sinkronisasi data.  

---

## 📂 Struktur Proyek

mastapa/  
│  
├── aia/ → File project Kodular (.aia)  
├── apk/ → File APK hasil build untuk demo  
├── assets/ → Icon/logo/asset UI  
├── data/ → Contoh file JSON/Spreadsheet dummy  
├── scripts/ → Script Google Apps Script (API backend)
└── README.md


---

## 💡 Roadmap Pengembangan
- [x] Pencatatan transaksi offline  
- [x] Input foto bukti pembayaran  
- [ ] Ringkasan laporan per bulan  
- [ ] Sinkronisasi dengan Google Spreadsheet  
- [ ] Export data ke CSV/Excel  
- [ ] QR Code struk pembayaran  

---

## Backend (Google Apps Script)

Proyek ini menggunakan Google Apps Script sebagai API untuk menghubungkan aplikasi Niotron dengan Google Spreadsheet & Google Drive.

Struktur script:
- `scripts/api.gs` → Endpoint utama untuk menerima request dari aplikasi.
- `scripts/config.gs` → Konfigurasi Spreadsheet ID dan Drive Folder ID.

## Cara Import AIA ke Kodular

1. Buka [Kodular Creator](https://builder.kodular.io).
2. Login menggunakan akun Google Anda.
3. Klik **Projects → Import Project (.aia) from my computer**.
4. Pilih file `.aia` yang ada di folder `/aia` pada repo ini.
5. Setelah berhasil di-import, project akan muncul di daftar proyek Anda.
6. Klik **Open Project** untuk mulai mengedit.

> **Tips:** Setelah selesai membuat perubahan, Anda bisa export kembali project dalam bentuk `.aia` atau langsung build ke `.apk`.

## 👨‍💻 Dibuat oleh
**Titan Anggaraksa – Wirodayan Digital**  
Untuk kompetisi **Jagoan Digital 2025**.  

---


