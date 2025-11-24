# UMKM Accounting System - Google Apps Script

Sistem Informasi Pembukuan Keuangan UMKM yang lengkap dengan fitur keamanan tingkat tinggi, berbasis Google Sheets dan Google Apps Script.

## 📋 Fitur Utama

### 1. **Menu Input Transaksi**
- ✅ **Penerimaan**: Mencatat pendapatan dari penjualan
- ✅ **Pengeluaran**: Mencatat biaya operasional
- ✅ **Modal**: Mencatat transaksi modal pemilik

### 2. **Menu Master Data**
- ✅ **Daftar Akun**: Chart of Accounts lengkap untuk UMKM
- ✅ **Daftar Pelanggan**: Data pelanggan dengan limit kredit
- ✅ **Daftar Pemasok**: Data supplier dengan payment terms
- ✅ **Daftar Barang/Jasa**: Produk dengan harga beli dan jual

### 3. **Menu Laporan**
- ✅ **Laporan Laba Rugi**: Income Statement otomatis
- ✅ **Laporan Neraca**: Balance Sheet dengan aset, kewajiban, dan ekuitas
- ✅ **Laporan Arus Kas**: Cash Flow dari operasi, investasi, dan pendanaan

### 4. **Menu Pengelolaan Bisnis**
- ✅ **Kasir (POS)**: Point of Sale untuk transaksi penjualan
- ✅ **Manajemen Persediaan**: Tracking stok barang masuk/keluar
- ✅ **Utang & Piutang**: Monitor dan catat pembayaran

### 5. **Sistem Keamanan**
- ✅ **Autentikasi**: Login dengan username dan password ter-hash (SHA-256)
- ✅ **Session Management**: Token-based dengan timeout otomatis
- ✅ **Role-Based Access Control**: Admin dan User dengan permission berbeda
- ✅ **Brute Force Protection**: Lockout setelah 5 kali gagal login
- ✅ **Input Sanitization**: Mencegah injection attacks
- ✅ **Password Policy**: Minimum 8 karakter

## 🔐 Level Akses

### Admin
Dapat mengakses **SEMUA MENU**:
- Dashboard
- Master Data (Akun, Pelanggan, Pemasok, Produk)
- Input Transaksi
- Laporan Keuangan
- Pengelolaan Bisnis

### User
Hanya dapat mengakses:
- Dashboard
- Input Transaksi (Penerimaan & Pengeluaran)
- Laporan Keuangan (Semua)
- Pengelolaan Bisnis (POS, Persediaan, Piutang, Utang)

## 🚀 Cara Setup

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **+ Blank** untuk membuat spreadsheet baru
3. Beri nama: **"UMKM Accounting System"**

### Langkah 2: Buka Apps Script Editor
1. Di Google Sheets, klik menu **Extensions** → **Apps Script**
2. Hapus semua kode default yang ada

### Langkah 3: Copy File-File Script

#### File 1: Code.gs
1. Buat file baru bernama `Code.gs`
2. Copy seluruh isi dari file `gas/Code.gs`
3. Paste ke Apps Script Editor

#### File 2: DatabaseService.gs
1. Klik tombol **+** di sebelah Files
2. Pilih **Script**
3. Beri nama `DatabaseService`
4. Copy seluruh isi dari file `gas/DatabaseService.gs`
5. Paste ke file tersebut

#### File 3: TransactionService.gs
1. Buat file script baru bernama `TransactionService`
2. Copy seluruh isi dari file `gas/TransactionService.gs`
3. Paste ke file tersebut

#### File 4: ReportService.gs
1. Buat file script baru bernama `ReportService`
2. Copy seluruh isi dari file `gas/ReportService.gs`
3. Paste ke file tersebut

#### File 5: Index.html
1. Klik tombol **+** di sebelah Files
2. Pilih **HTML**
3. Beri nama `Index`
4. Copy seluruh isi dari file `gas/Index.html`
5. Paste ke file tersebut

#### File 6: AppScript.html
1. Buat file HTML baru bernama `AppScript`
2. Copy seluruh isi dari file `gas/AppScript.html`
3. Paste ke file tersebut

#### File 7: AppScript2.html
1. Buat file HTML baru bernama `AppScript2`
2. Copy seluruh isi dari file `gas/AppScript2.html`
3. Paste ke file tersebut

### Langkah 4: Update Index.html
Tambahkan include script di bagian bawah `Index.html` (sebelum `</body>`):

```html
<?!= include('AppScript'); ?>
<?!= include('AppScript2'); ?>
```

### Langkah 5: Setup Database
1. Di Apps Script Editor, pilih fungsi `setupDatabase` dari dropdown
2. Klik tombol **Run** (▶️)
3. Saat pertama kali run, Google akan meminta permission:
   - Klik **Review permissions**
   - Pilih akun Google Anda
   - Klik **Advanced** → **Go to UMKM Accounting System (unsafe)**
   - Klik **Allow**
4. Tunggu hingga selesai (akan muncul alert di spreadsheet)
5. Spreadsheet akan otomatis membuat sheet-sheet berikut:
   - Users
   - Accounts
   - Customers
   - Suppliers
   - Products
   - Transactions
   - TransactionDetails
   - Inventory
   - Receivables
   - Payables
   - Settings

### Langkah 6: Deploy Web App
1. Klik tombol **Deploy** → **New deployment**
2. Klik ⚙️ (gear icon) di sebelah "Select type"
3. Pilih **Web app**
4. Isi konfigurasi:
   - **Description**: v1.0 - Initial Release
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone (jika ingin publik) atau Anyone with Google account
5. Klik **Deploy**
6. Copy **Web app URL** yang diberikan
7. Klik **Done**

### Langkah 7: Akses Aplikasi
1. Buka Web app URL di browser
2. Login dengan kredensial default:

**Admin Account:**
- Username: `admin`
- Password: `Admin123!`

**User Account:**
- Username: `user`
- Password: `User123!`

⚠️ **PENTING**: Segera ganti password default setelah login pertama kali!

## 📊 Chart of Accounts Default

Sistem sudah dilengkapi dengan daftar akun standar untuk UMKM:

### ASET (1-xxx)
- **Aset Lancar**
  - Kas
  - Bank
  - Piutang Usaha
  - Persediaan Barang
  - Uang Muka

- **Aset Tetap**
  - Peralatan
  - Kendaraan
  - Bangunan
  - Akumulasi Penyusutan

### KEWAJIBAN (2-xxx)
- **Kewajiban Lancar**
  - Utang Usaha
  - Utang Bank
  - Utang Lain-lain

- **Kewajiban Jangka Panjang**
  - Utang Bank Jangka Panjang

### MODAL (3-xxx)
- Modal Pemilik
- Prive
- Laba Ditahan

### PENDAPATAN (4-xxx)
- Pendapatan Penjualan
- Pendapatan Jasa
- Pendapatan Lain-lain

### HARGA POKOK PENJUALAN (5-xxx)
- Pembelian Barang
- Ongkos Kirim Pembelian

### BEBAN OPERASIONAL (6-xxx)
- Beban Gaji
- Beban Sewa
- Beban Listrik
- Beban Air
- Beban Telepon & Internet
- Beban Transportasi
- Beban Perlengkapan
- Beban Pemeliharaan
- Beban Penyusutan
- Beban Pemasaran
- Beban Administrasi
- Beban Lain-lain

## 🔒 Fitur Keamanan

### 1. Password Hashing
- Menggunakan SHA-256 dengan salt unik
- Password tidak pernah disimpan dalam bentuk plain text

### 2. Session Management
- Token-based authentication
- Session timeout otomatis (1 jam)
- Secure session storage menggunakan CacheService

### 3. Brute Force Protection
- Maksimal 5 kali percobaan login gagal
- Lockout otomatis selama 15 menit
- Counter reset setelah login berhasil

### 4. Input Sanitization
- Semua input di-sanitize untuk mencegah XSS
- Validasi tipe data
- Prevention terhadap injection attacks

### 5. Role-Based Access Control (RBAC)
- Pemisahan hak akses Admin dan User
- Validasi permission di setiap request
- Action logging untuk audit trail

### 6. XFrame Protection
- X-Frame-Options: DENY untuk mencegah clickjacking
- CSP headers untuk additional security

## 📱 Cara Penggunaan

### Input Transaksi
1. Login ke sistem
2. Klik menu **Transaksi**
3. Klik tombol **+ Tambah Transaksi**
4. Pilih tipe (Penerimaan/Pengeluaran/Modal)
5. Isi detail transaksi
6. Klik **Simpan**

### Menggunakan POS (Kasir)
1. Klik menu **Kasir**
2. Klik produk yang ingin dijual
3. Atur jumlah di keranjang
4. Klik **Checkout**
5. Pilih metode pembayaran
6. Klik **Proses Pembayaran**

### Melihat Laporan
1. Klik menu laporan yang diinginkan
2. Atur periode tanggal
3. Klik **Generate**
4. Laporan akan ditampilkan secara otomatis

### Mengelola Master Data
1. Klik menu master data (Akun/Pelanggan/Pemasok/Produk)
2. Klik **+ Tambah** untuk menambah data baru
3. Atau klik **Edit** untuk mengubah data existing
4. Klik **Hapus** untuk menghapus data

### Mencatat Pembayaran Piutang/Utang
1. Klik menu **Piutang** atau **Utang**
2. Cari record yang ingin dibayar
3. Klik tombol **Bayar**
4. Isi jumlah pembayaran
5. Klik **Simpan Pembayaran**

## 🔄 Update Aplikasi

Jika ada perubahan kode:
1. Edit file di Apps Script Editor
2. Klik **Save**
3. Klik **Deploy** → **Manage deployments**
4. Klik ✏️ (edit icon) di deployment yang aktif
5. Pilih **New version**
6. Klik **Deploy**

## 🆘 Troubleshooting

### Error: "Session expired"
- Login ulang ke aplikasi
- Pastikan koneksi internet stabil

### Error: "Permission denied"
- Jalankan ulang fungsi `setupDatabase`
- Berikan permission yang diminta

### Data tidak muncul
- Cek apakah `setupDatabase` sudah dijalankan
- Pastikan sheet-sheet sudah terbuat
- Cek browser console untuk error messages

### Login gagal terus
- Tunggu 15 menit jika terkena lockout
- Pastikan username dan password benar
- Cek caps lock

## 📞 Support

Jika mengalami masalah:
1. Cek log di Apps Script: View → Logs
2. Cek browser console (F12) untuk error messages
3. Pastikan semua file sudah ter-copy dengan benar

## 📝 Best Practices

1. **Backup Rutin**: Buat copy spreadsheet secara berkala
2. **Ganti Password**: Ganti password default setelah setup
3. **Limit Akses**: Berikan akses hanya kepada yang memerlukan
4. **Regular Audit**: Cek log transaksi secara rutin
5. **Update Data**: Selalu update data master sebelum mulai transaksi

## ⚡ Tips Penggunaan

1. Gunakan **Kode Akun** yang konsisten
2. Isi data **Pelanggan** dan **Pemasok** terlebih dahulu
3. Update **Stok Produk** secara berkala
4. Generate **Laporan** setiap akhir bulan
5. Backup spreadsheet ke Google Drive

## 📊 Roadmap

- [ ] Export laporan ke PDF
- [ ] Import data dari Excel
- [ ] Multi-currency support
- [ ] Dashboard dengan charts
- [ ] Email notification
- [ ] Mobile responsive optimization
- [ ] Inventory forecasting
- [ ] Budgeting module

## 📄 License

Open source untuk penggunaan UMKM di Indonesia.

---

**Dibuat dengan ❤️ untuk UMKM Indonesia**

Sistem ini dirancang khusus untuk membantu UMKM mengelola keuangan dengan mudah, aman, dan profesional.
