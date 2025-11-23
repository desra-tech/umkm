# 🏪 Sistem Informasi Pembukuan Keuangan UMKM

Sistem informasi pembukuan keuangan sederhana untuk UMKM dengan basis data Google Sheets, dilengkapi dengan fitur keamanan yang robust dan interface yang user-friendly.

## 📋 Daftar Isi

- [Tentang Sistem](#tentang-sistem)
- [Fitur Utama](#fitur-utama)
- [Keunggulan](#keunggulan)
- [Teknologi](#teknologi)
- [Struktur Menu](#struktur-menu)
- [Keamanan](#keamanan)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [Role & Permission](#role--permission)
- [Screenshot](#screenshot)
- [Dokumentasi](#dokumentasi)
- [Lisensi](#lisensi)

## 🎯 Tentang Sistem

Sistem Informasi Pembukuan UMKM adalah solusi digital untuk pengelolaan keuangan usaha kecil dan menengah. Dibangun dengan Google Apps Script dan Google Sheets, sistem ini memberikan kemudahan akses dari mana saja dengan keamanan yang terjamin.

### Mengapa Sistem Ini?

- ✅ **Gratis** - Tidak ada biaya hosting atau database
- ✅ **Mudah Digunakan** - Interface intuitif untuk non-akuntan
- ✅ **Aman** - Enkripsi password, session management, dan access control
- ✅ **Realtime** - Data tersinkron otomatis via Google Sheets
- ✅ **Accessible** - Bisa diakses dari desktop, tablet, atau smartphone
- ✅ **No Installation** - Cukup browser dan akun Google
- ✅ **Automatic Backup** - Data tersimpan aman di Google Drive

## ⭐ Fitur Utama

### 1. Menu Input Transaksi

#### 📥 Penerimaan
- Mencatat semua uang yang masuk
- Pendapatan dari penjualan produk/jasa
- Otomatis update kas/bank dan akun pendapatan
- Double-entry bookkeeping otomatis

#### 📤 Pengeluaran
- Mencatat semua uang yang keluar
- Biaya operasional (gaji, sewa, utilitas, dll)
- Otomatis update kas/bank dan akun beban
- Tracking pengeluaran per kategori

#### 💼 Modal
- Pencatatan penambahan modal
- Pencatatan penarikan modal (prive)
- Otomatis update akun ekuitas

### 2. Menu Master Data

#### 📋 Daftar Akun
- Chart of Accounts lengkap
- 30+ akun siap pakai untuk UMKM:
  - Aset (Kas, Bank, Piutang, Persediaan, Aset Tetap)
  - Liabilitas (Utang Usaha, Utang Bank, dll)
  - Ekuitas (Modal, Prive, Laba Ditahan)
  - Pendapatan (Penjualan, Jasa, Lain-lain)
  - Beban (Operasional, Non-operasional)
- Dapat menambah akun custom sesuai kebutuhan
- Hierarki akun dengan parent-child relationship

#### 👥 Daftar Pelanggan
- Data lengkap pelanggan
- Contact person dan informasi kontak
- Credit limit management
- Histori transaksi per pelanggan

#### 🏢 Daftar Pemasok
- Database supplier/vendor
- Payment terms tracking
- Histori pembelian
- Evaluasi supplier

#### 📦 Daftar Barang/Jasa
- Katalog produk lengkap
- Harga beli dan harga jual
- Stock management
- Minimum stock alert
- Kategori produk

### 3. Menu Laporan

#### 📈 Laporan Laba Rugi (Income Statement)
- Pendapatan total per periode
- Harga Pokok Penjualan (COGS)
- Laba Kotor
- Beban Operasional detail
- Laba/Rugi Bersih
- Profit margin analysis
- Export ke CSV/PDF

#### 📊 Laporan Posisi Keuangan (Balance Sheet/Neraca)
- Aset (Lancar & Tetap)
- Liabilitas (Jangka Pendek & Panjang)
- Ekuitas
- Verification balance
- Snapshot posisi keuangan per tanggal

#### 💵 Laporan Arus Kas (Cash Flow Statement)
- Aktivitas Operasional
- Aktivitas Investasi
- Aktivitas Pendanaan
- Arus Kas Bersih
- Saldo Kas Awal dan Akhir
- Cash flow projection

### 4. Menu Pengelolaan Bisnis

#### 🛒 Kasir (Point of Sale)
- Interface kasir yang cepat dan mudah
- Barcode/SKU lookup
- Multiple payment methods (Cash, Bank Transfer, Credit)
- Automatic invoice generation
- Receipt printing ready
- Daily sales summary
- Otomatis update:
  - Inventory/stock
  - Pendapatan
  - Kas/Bank
  - Piutang (jika kredit)

#### 📦 Manajemen Persediaan
- Real-time stock tracking
- Stock in/out recording
- Stock opname
- Inventory movement history
- Low stock alerts
- FIFO/LIFO method support
- Inventory valuation
- Stock aging report

#### 📝 Manajemen Piutang
- Daftar piutang per pelanggan
- Aging analysis (0-30, 31-60, 61-90, >90 hari)
- Payment tracking
- Overdue alerts
- Payment reminder
- Partial payment support
- Write-off bad debt

#### 📄 Manajemen Utang
- Daftar utang per supplier
- Due date tracking
- Payment scheduling
- Aging analysis
- Payment history
- Interest calculation (if applicable)

## 🎨 Keunggulan

### 1. Keamanan Tingkat Enterprise

- **Password Hashing**: SHA-256 dengan salt unik per user
- **Session Management**: Timeout otomatis setelah 30 menit inaktif
- **CSRF Protection**: Token-based security
- **Role-Based Access Control**: Admin vs User permissions
- **Input Sanitization**: Mencegah XSS dan injection attacks
- **Audit Trail**: Log semua aktivitas penting
- **Rate Limiting**: Mencegah brute force attacks

### 2. User Experience

- **Responsive Design**: Desktop, tablet, dan mobile friendly
- **Intuitive Interface**: Mudah dipahami tanpa training khusus
- **Real-time Updates**: Data ter-update otomatis
- **Fast Loading**: Optimized performance
- **Search & Filter**: Cari data dengan cepat
- **Keyboard Shortcuts**: Produktivitas maksimal
- **Dark/Light Mode**: (Coming soon)

### 3. Data Integrity

- **Double-Entry Bookkeeping**: Sistem pembukuan ganda otomatis
- **Balance Verification**: Cek keseimbangan Debit-Credit
- **Transaction Validation**: Validasi data sebelum save
- **Referential Integrity**: Relasi data terjaga
- **Soft Delete**: Data tidak benar-benar terhapus
- **Version Control**: Track perubahan data

### 4. Reporting & Analytics

- **Real-time Dashboard**: KPI dan metrik penting
- **Financial Ratios**: Liquidity, profitability, efficiency
- **Trend Analysis**: Grafik performa dari waktu ke waktu
- **Custom Date Range**: Laporan periode flexible
- **Export Options**: CSV, Excel, PDF
- **Scheduled Reports**: (Coming soon)

## 🛠️ Teknologi

### Backend
- **Google Apps Script** (JavaScript runtime)
- **Google Sheets** (Database)
- **SHA-256 Encryption** (Password security)

### Frontend
- **HTML5** (Structure)
- **CSS3** (Styling with Flexbox/Grid)
- **Vanilla JavaScript** (No framework dependency)
- **Google Apps Script Client API**

### Infrastructure
- **Google Cloud Platform** (Hosting)
- **Google Drive** (Storage)
- **SSL/TLS** (Secure connection)

## 📁 Struktur Menu

```
🏪 UMKM Financial System
│
├── 📊 Dashboard
│   ├── Ringkasan Keuangan Bulan Ini
│   ├── Posisi Keuangan (Aset, Liabilitas, Ekuitas)
│   └── Notifikasi (Stok Rendah, Piutang/Utang Jatuh Tempo)
│
├── 💰 Transaksi
│   ├── Penerimaan (Income)
│   ├── Pengeluaran (Expense)
│   └── Modal (Capital) *Admin only
│
├── 📋 Master Data *Admin only
│   ├── Daftar Akun (Chart of Accounts)
│   ├── Pelanggan (Customers)
│   ├── Pemasok (Suppliers)
│   └── Barang/Jasa (Products/Services)
│
├── 📈 Laporan (Reports)
│   ├── Laba Rugi (Profit & Loss)
│   ├── Neraca (Balance Sheet)
│   └── Arus Kas (Cash Flow)
│
├── 🛒 Pengelolaan Bisnis
│   ├── Kasir / POS (Point of Sale)
│   ├── Persediaan (Inventory Management)
│   ├── Piutang (Accounts Receivable)
│   └── Utang (Accounts Payable)
│
└── ⚙️ Administrasi *Admin only
    ├── Kelola User
    └── Pengaturan Sistem
```

## 🔐 Keamanan

### Level Keamanan Implementasi:

1. **Authentication Layer**
   ```
   - Username/Password login
   - Password hashing (SHA-256 + Salt)
   - Session-based authentication
   - Auto logout setelah timeout
   ```

2. **Authorization Layer**
   ```
   - Role-based permissions (Admin/User)
   - Function-level access control
   - Menu visibility per role
   ```

3. **Data Protection**
   ```
   - Input sanitization
   - XSS prevention
   - SQL injection prevention (N/A for Sheets but implemented)
   - CSRF token validation
   ```

4. **Network Security**
   ```
   - HTTPS/SSL enforced
   - X-Frame-Options: DENY
   - Content Security Policy
   ```

5. **Audit & Monitoring**
   ```
   - Activity logging
   - Error tracking
   - Security event alerts
   ```

### Password Policy:
- Minimal 8 karakter
- Harus mengandung huruf dan angka
- Tidak boleh sama dengan username
- Hash dengan SHA-256 + unique salt

## 📥 Instalasi

### Quick Start (5 Menit)

1. **Buat Google Spreadsheet baru**
2. **Buka Apps Script Editor** (Extensions → Apps Script)
3. **Upload semua file backend (.gs)** dari folder `/backend/`
4. **Upload semua file frontend (.html)** dari folder `/frontend/`
5. **Deploy sebagai Web App**
6. **Jalankan `initializeDatabase()`**
7. **Buka URL Web App**
8. **Login dengan admin/admin123**

### Panduan Lengkap

Lihat [PANDUAN_INSTALASI.md](docs/PANDUAN_INSTALASI.md) untuk instruksi detail step-by-step.

## 🚀 Penggunaan

### Login Pertama Kali

```
Username: admin
Password: admin123
```

**⚠️ WAJIB GANTI PASSWORD SETELAH LOGIN PERTAMA!**

### Workflow Umum

1. **Setup Awal**
   - Login sebagai admin
   - Ganti password
   - Isi pengaturan perusahaan
   - Tambah user jika perlu

2. **Input Master Data**
   - Tambah pelanggan
   - Tambah supplier
   - Tambah produk dengan harga dan stock awal

3. **Mulai Transaksi**
   - Catat penjualan via POS
   - Catat pembelian
   - Catat pengeluaran operasional

4. **Monitor & Laporan**
   - Cek dashboard setiap hari
   - Review laporan setiap minggu
   - Analisis laporan keuangan setiap bulan

### Tips Penggunaan

- 💡 Catat transaksi sesegera mungkin (jangan ditunda)
- 💡 Backup data minimal seminggu sekali
- 💡 Rekonsiliasi dengan buku bank setiap bulan
- 💡 Set reminder untuk piutang/utang yang jatuh tempo
- 💡 Review stock secara berkala
- 💡 Gunakan deskripsi yang jelas untuk setiap transaksi

## 👥 Role & Permission

### Admin (Administrator)
**Akses Penuh:**
- ✅ Semua menu transaksi (Penerimaan, Pengeluaran, Modal)
- ✅ Semua master data (Akun, Pelanggan, Pemasok, Produk)
- ✅ Semua laporan
- ✅ Semua menu pengelolaan bisnis
- ✅ Kelola user (tambah, edit, hapus)
- ✅ Pengaturan sistem
- ✅ Backup dan restore data

**Tanggung Jawab:**
- Setup dan konfigurasi sistem
- Manajemen user dan permissions
- Monitoring keamanan
- Backup data berkala
- Verifikasi laporan keuangan

### User (Staff/Kasir)
**Akses Terbatas:**
- ✅ Transaksi Penerimaan dan Pengeluaran
- ✅ Semua laporan (view only)
- ✅ POS/Kasir
- ✅ View persediaan
- ✅ View piutang dan utang
- ❌ Tidak bisa akses Master Data
- ❌ Tidak bisa tambah/edit akun
- ❌ Tidak bisa transaksi modal
- ❌ Tidak bisa kelola user
- ❌ Tidak bisa ubah pengaturan

**Tanggung Jawab:**
- Input transaksi harian
- Operasional POS
- Monitoring stock
- Follow-up piutang/utang

## 📚 Dokumentasi

- [📖 Panduan Instalasi Lengkap](docs/PANDUAN_INSTALASI.md)
- [❓ FAQ - Pertanyaan Umum](docs/FAQ.md)
- [💻 Contoh Penggunaan](docs/EXAMPLES.md)
- [🔧 API Documentation](docs/API.md)
- [🐛 Troubleshooting](docs/TROUBLESHOOTING.md)
- [📝 Changelog](docs/CHANGELOG.md)

## 🗂️ Struktur Folder

```
umkm-financial-system/
│
├── backend/                 # Server-side scripts
│   ├── Code.gs             # Main application code
│   ├── Auth.gs             # Authentication & session
│   ├── Security.gs         # Security functions
│   ├── Transactions.gs     # Transaction management
│   ├── MasterData.gs       # Master data CRUD
│   ├── Reports.gs          # Financial reports
│   └── Business.gs         # POS, inventory, AR/AP
│
├── frontend/               # Client-side interface
│   ├── Login.html          # Login page
│   ├── Index.html          # Main application
│   ├── Styles.html         # CSS styles
│   ├── Scripts.html        # JavaScript functions
│   ├── Dashboard.html      # Dashboard section
│   ├── Penerimaan.html     # Income transaction form
│   ├── Pengeluaran.html    # Expense transaction form
│   ├── Modal.html          # Capital transaction form
│   ├── Accounts.html       # Chart of accounts
│   ├── Customers.html      # Customer management
│   ├── Suppliers.html      # Supplier management
│   ├── Products.html       # Product management
│   ├── ProfitLoss.html     # P&L report
│   ├── BalanceSheet.html   # Balance sheet
│   ├── CashFlow.html       # Cash flow report
│   ├── POS.html            # Point of Sale
│   ├── Inventory.html      # Inventory management
│   ├── Receivables.html    # Accounts receivable
│   ├── Payables.html       # Accounts payable
│   ├── Users.html          # User management
│   └── Settings.html       # System settings
│
├── config/                 # Configuration files
│   └── sheets-structure.json  # Database schema
│
├── docs/                   # Documentation
│   ├── PANDUAN_INSTALASI.md
│   ├── FAQ.md
│   ├── EXAMPLES.md
│   └── API.md
│
└── README.md              # This file
```

## 🤝 Contributing

Kontribusi sangat diterima! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Sistem ini dibuat untuk tujuan edukasi dan penggunaan internal UMKM. Silakan gunakan dan modifikasi sesuai kebutuhan Anda.

## 🙏 Acknowledgments

- Google Apps Script Team untuk platform yang powerful
- Komunitas UMKM Indonesia untuk inspirasi fitur
- Open source community untuk best practices

## 📞 Support

Jika Anda memerlukan bantuan:
- 📧 Email: support@example.com
- 📱 WhatsApp: +62xxx-xxxx-xxxx
- 💬 Telegram: @umkmfinancial

---

**Dibuat dengan ❤️ untuk UMKM Indonesia**

Version: 1.0.0
Last Updated: 2025
