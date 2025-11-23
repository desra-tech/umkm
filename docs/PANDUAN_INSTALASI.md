# Panduan Instalasi Sistem Informasi Pembukuan UMKM

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Persyaratan Sistem](#persyaratan-sistem)
3. [Langkah-langkah Instalasi](#langkah-langkah-instalasi)
4. [Konfigurasi Awal](#konfigurasi-awal)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Pendahuluan

Sistem Informasi Pembukuan UMKM adalah aplikasi berbasis web yang dibangun dengan Google Apps Script dan Google Sheets sebagai database. Sistem ini dirancang khusus untuk membantu UMKM dalam mengelola keuangan mereka dengan mudah dan aman.

### Fitur Utama:
- ✅ Autentikasi dengan enkripsi password (SHA-256)
- ✅ Role-based access control (Admin & User)
- ✅ Input transaksi (Penerimaan, Pengeluaran, Modal)
- ✅ Master data (Akun, Pelanggan, Pemasok, Produk)
- ✅ Laporan keuangan (Laba Rugi, Neraca, Arus Kas)
- ✅ Point of Sale (POS/Kasir)
- ✅ Manajemen Persediaan
- ✅ Tracking Utang & Piutang
- ✅ Dashboard informatif

## Persyaratan Sistem

### Yang Anda Butuhkan:
1. **Akun Google** - Untuk mengakses Google Sheets dan Google Apps Script
2. **Google Chrome** atau browser modern lainnya
3. **Koneksi Internet** yang stabil
4. **Pengetahuan dasar** tentang Google Sheets (opsional)

### Tidak Perlu:
- ❌ Server hosting
- ❌ Database server
- ❌ Pemrograman lanjutan
- ❌ Biaya langganan

## Langkah-langkah Instalasi

### Langkah 1: Buat Google Spreadsheet Baru

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **+ Blank** untuk membuat spreadsheet baru
3. Beri nama spreadsheet: **"UMKM Financial System Database"**
4. Salin URL spreadsheet untuk referensi nanti

### Langkah 2: Buka Script Editor

1. Di Google Sheets, klik menu **Extensions** → **Apps Script**
2. Editor akan terbuka di tab baru
3. Hapus kode default (`function myFunction()`)

### Langkah 3: Upload File Backend

Upload file-file berikut ke Apps Script Editor:

#### File 1: Code.gs
1. Klik **+** di sebelah Files
2. Pilih **Script**
3. Beri nama: `Code.gs`
4. Salin isi dari file `/backend/Code.gs`
5. Paste ke editor

#### File 2: Auth.gs
1. Klik **+** lagi
2. Beri nama: `Auth.gs`
3. Salin isi dari file `/backend/Auth.gs`
4. Paste ke editor

#### File 3-6: File Backend Lainnya
Ulangi proses di atas untuk file-file berikut:
- `Security.gs`
- `Transactions.gs`
- `MasterData.gs`
- `Reports.gs`
- `Business.gs`

### Langkah 4: Upload File Frontend (HTML)

Upload file-file HTML:

1. Klik **+** → **HTML**
2. Beri nama sesuai file (tanpa ekstensi .html)
3. **⚠️ PENTING:** Upload SEMUA file HTML berikut satu per satu dari folder `/frontend/`:
   - `Login.html`
   - `Index.html`
   - `Styles.html`
   - `Scripts.html`
   - `Dashboard.html`
   - `Penerimaan.html`
   - `Pengeluaran.html`
   - `Modal.html` ⚠️ **File ini sering terlupa!**
   - `Accounts.html`
   - `Customers.html`
   - `Suppliers.html`
   - `Products.html`
   - `POS.html`
   - `Inventory.html`
   - `Receivables.html`
   - `Payables.html`
   - `ProfitLoss.html`
   - `BalanceSheet.html`
   - `CashFlow.html`
   - `Users.html`
   - `Settings.html`

**Total: 21 file HTML harus diupload!**

### Langkah 5: Deploy sebagai Web App

1. Klik tombol **Deploy** → **New deployment**
2. Klik ikon gear ⚙️ di sebelah "Select type"
3. Pilih **Web app**
4. Konfigurasi deployment:
   ```
   Description: UMKM Financial System v1.0
   Execute as: Me (your-email@gmail.com)
   Who has access: Anyone
   ```
5. Klik **Deploy**
6. **PENTING:** Salin URL web app yang muncul
   - Format: `https://script.google.com/macros/s/[ID]/exec`
7. Klik **Done**

### Langkah 6: Berikan Izin Akses

1. Klik URL web app yang telah disalin
2. Google akan menampilkan peringatan keamanan
3. Klik **Advanced** → **Go to UMKM Financial System (unsafe)**
4. Review izin yang diminta:
   - Akses ke Google Sheets Anda
   - Menyimpan dan mengelola data
5. Klik **Allow**

## Konfigurasi Awal

### Inisialisasi Database

Setelah deployment berhasil:

1. Buka Apps Script Editor
2. Pilih fungsi `initializeDatabase` dari dropdown
3. Klik **Run** (▶️)
4. Tunggu hingga eksekusi selesai
5. Cek Google Sheets Anda - seharusnya ada beberapa sheet baru:
   - Users
   - Accounts
   - Customers
   - Suppliers
   - Products
   - Transactions
   - Sales
   - Purchases
   - Receivables
   - Payables
   - Inventory
   - Settings

### Login Pertama Kali

1. Buka URL web app di browser
2. Gunakan kredensial default:
   ```
   Username: admin
   Password: admin123
   ```
3. **⚠️ PENTING:** Segera ubah password setelah login pertama!

### Mengganti Password Default

1. Login dengan akun admin
2. Klik menu **Administrasi** → **Kelola User**
3. Pilih user **admin**
4. Klik **Ubah Password**
5. Masukkan password lama: `admin123`
6. Masukkan password baru (minimal 8 karakter, harus ada angka dan huruf)
7. Konfirmasi password baru
8. Klik **Simpan**

### Konfigurasi Perusahaan

1. Klik menu **Administrasi** → **Pengaturan**
2. Isi informasi perusahaan:
   - Nama Perusahaan
   - Alamat
   - Nomor Telepon
   - Email
   - Tarif Pajak (default: 11%)
3. Klik **Simpan Pengaturan**

## Testing

### Test 0: Verifikasi File (RECOMMENDED)

**⚠️ Jalankan test ini terlebih dahulu untuk memastikan semua file telah diupload!**

1. Buka Apps Script Editor
2. Pilih fungsi `verifyHtmlFiles` dari dropdown
3. Klik **Run** (▶️)
4. Tunggu hingga eksekusi selesai
5. Klik **View** → **Logs** untuk melihat hasil
6. Hasil yang diharapkan:
   ```
   ✓ All HTML files are present!
   Found: 21 files
   Missing: 0 files
   ```
7. Jika ada file yang missing:
   - Lihat daftar file yang hilang di log
   - Upload file yang hilang (Langkah 4)
   - Jalankan `verifyHtmlFiles` lagi
   - Deploy ulang web app

### Test 1: Membuat Transaksi Penerimaan

1. Klik menu **Transaksi** → **Penerimaan**
2. Isi form:
   - Tanggal: Hari ini
   - Tipe: Kas
   - Akun Pendapatan: Pendapatan Penjualan
   - Jumlah: 1000000
   - Keterangan: Test transaksi penerimaan
3. Klik **Simpan**
4. Verifikasi data muncul di tabel riwayat

### Test 2: Melihat Dashboard

1. Klik menu **Dashboard**
2. Verifikasi card-card menampilkan data:
   - Total Pendapatan menunjukkan Rp 1.000.000
   - Laba Bersih menunjukkan Rp 1.000.000
3. Cek laporan di Google Sheets pada sheet "Transactions"

### Test 3: Membuat Pelanggan Baru

1. Klik menu **Master Data** → **Pelanggan**
2. Klik **+ Tambah Pelanggan**
3. Isi form pelanggan
4. Klik **Simpan**
5. Verifikasi pelanggan muncul di daftar

## Troubleshooting

### Masalah: "Exception: No HTML file named [FileName] was found"

**Penyebab:** File HTML tidak diupload ke Google Apps Script

**Solusi:**
1. Buka Apps Script Editor
2. Cek daftar file di panel kiri
3. Pastikan SEMUA 21 file HTML sudah ada:
   - Login, Index, Styles, Scripts, Dashboard
   - Penerimaan, Pengeluaran, **Modal** ⚠️
   - Accounts, Customers, Suppliers, Products
   - POS, Inventory, Receivables, Payables
   - ProfitLoss, BalanceSheet, CashFlow
   - Users, Settings
4. Upload file yang hilang:
   - Klik **+** → **HTML**
   - Beri nama sesuai file yang hilang (tanpa .html)
   - Salin isi dari folder `/frontend/[NamaFile].html`
   - Paste ke editor
   - Save (Ctrl+S)
5. Deploy ulang web app:
   - Deploy → Manage deployments
   - Edit deployment
   - Pilih "New version"
   - Deploy
6. Refresh halaman web app

### Masalah: "Exception: Argument cannot be null: mode"

**Penyebab:** Issue dengan setXFrameOptionsMode di Google Apps Script

**Solusi:**
File Code.gs sudah diperbaiki dengan error handling. Jika masih error:

1. Buka Apps Script Editor
2. Buka file `Code.gs`
3. Cari fungsi `doGet(e)` (sekitar baris 52)
4. Pastikan kode sudah menggunakan versi terbaru dengan try-catch untuk setXFrameOptionsMode
5. Jika perlu, ganti seluruh file Code.gs dengan versi terbaru dari repository
6. Save dan deploy ulang:
   - Deploy → Manage deployments
   - Edit deployment
   - New version
   - Deploy

**Versi alternatif (jika masih error):**
Hapus atau comment line yang berisi `setXFrameOptionsMode`:
```javascript
// output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DENY);
```

### Masalah: "Authorization required"

**Solusi:**
1. Kembali ke Apps Script Editor
2. Pilih fungsi `testSetup` dari dropdown
3. Klik **Run**
4. Ikuti proses otorisasi
5. Refresh halaman web app

### Masalah: "Cannot read property of undefined"

**Solusi:**
1. Pastikan semua file telah diupload dengan benar
2. Cek nama file - harus sesuai persis (case-sensitive)
3. Pastikan fungsi `include()` berfungsi di Code.gs
4. Re-deploy web app:
   - Deploy → Manage deployments
   - Edit deployment
   - Ubah version menjadi "New version"
   - Deploy

### Masalah: Data tidak muncul di dashboard

**Solusi:**
1. Buka Google Sheets
2. Cek apakah sheet "Transactions" memiliki data
3. Jalankan fungsi `initializeDatabase` lagi jika sheet kosong
4. Refresh halaman web app
5. Clear cache browser (Ctrl+Shift+Del)

### Masalah: "Login failed"

**Solusi:**
1. Cek apakah sheet "Users" memiliki data
2. Pastikan ada user dengan username "admin"
3. Jika tidak ada, jalankan fungsi `createDefaultAdmin`:
   ```javascript
   // Di Apps Script Editor
   function resetAdmin() {
     createDefaultAdmin();
   }
   ```
4. Run fungsi `resetAdmin`
5. Coba login lagi dengan admin/admin123

### Masalah: Lambat saat loading

**Solusi:**
1. Google Sheets memiliki batasan performa
2. Jika data sudah banyak (>10,000 baris), pertimbangkan:
   - Arsipkan data lama ke sheet terpisah
   - Gunakan filter tanggal saat load data
   - Implementasi pagination untuk tabel

## Keamanan

### Best Practices:

1. **Password Policy:**
   - Gunakan password minimal 8 karakter
   - Kombinasi huruf besar, kecil, angka, dan simbol
   - Ganti password secara berkala (setiap 3-6 bulan)

2. **Access Control:**
   - Hanya berikan akses Admin ke orang terpercaya
   - Gunakan role User untuk staf operasional
   - Review daftar user secara berkala

3. **Backup:**
   - Buat backup Google Sheets secara berkala
   - Menu: File → Make a copy
   - Simpan backup di folder terpisah
   - Gunakan fitur backup otomatis (tersedia di menu Admin)

4. **Audit:**
   - Review log aktivitas secara berkala
   - Cek transaksi yang mencurigakan
   - Verifikasi laporan keuangan setiap bulan

## Update dan Maintenance

### Cara Update Sistem:

1. Backup data Anda terlebih dahulu
2. Download versi terbaru dari repository
3. Upload file yang diupdate ke Apps Script
4. Deploy ulang dengan version baru
5. Test semua fungsi

### Jadwal Maintenance Berkala:

- **Mingguan:** Review transaksi dan backup data
- **Bulanan:** Cek laporan keuangan dan reconcile dengan bank
- **Triwulan:** Audit menyeluruh dan update system jika ada
- **Tahunan:** Archive data tahun sebelumnya

## Support

Jika mengalami kesulitan:

1. Baca dokumentasi lengkap di folder `/docs/`
2. Cek file `FAQ.md` untuk pertanyaan umum
3. Review kode contoh di `EXAMPLES.md`
4. Hubungi developer atau IT support Anda

---

**Selamat Menggunakan Sistem Informasi Pembukuan UMKM!**

Sistem ini dirancang untuk memudahkan pengelolaan keuangan UMKM Anda. Gunakan dengan bijak dan selalu backup data Anda secara berkala.
