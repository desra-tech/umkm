# Sistem Informasi Pembukuan Keuangan UMKM
## Google Apps Script Edition

Sistem pembukuan keuangan sederhana berbasis Google Apps Script dan Google Sheets untuk UMKM dengan fitur lengkap dan keamanan yang baik.

---

## 🌟 Fitur Utama

### 1. **Input Transaksi**
- ✅ Penerimaan (uang masuk)
- ✅ Pengeluaran (uang keluar)
- ✅ Modal (penambahan/penarikan modal)

### 2. **Master Data**
- ✅ Daftar Akun (Chart of Accounts) - dengan akun standar UMKM
- ✅ Daftar Pelanggan
- ✅ Daftar Pemasok
- ✅ Daftar Barang/Jasa (dengan tracking stok)

### 3. **Laporan Keuangan**
- ✅ Laporan Laba Rugi (Income Statement)
- ✅ Laporan Posisi Keuangan/Neraca (Balance Sheet)
- ✅ Laporan Arus Kas (Cash Flow Statement)

### 4. **Pengelolaan Bisnis**
- ✅ Kasir/POS (Point of Sale)
- ✅ Manajemen Persediaan (Inventory Management)
- ✅ Piutang Usaha (Account Receivable)
- ✅ Utang Usaha (Account Payable)

### 5. **Sistem Keamanan**
- ✅ Authentication dengan username dan password
- ✅ Role-based access control (Admin & User)
- ✅ Session management
- ✅ Input validation dan sanitization

---

## 🔐 Level Akses Pengguna

### **Admin**
Dapat mengakses **SEMUA** menu:
- Input Transaksi (Penerimaan, Pengeluaran, Modal)
- Master Data (Akun, Pelanggan, Pemasok, Produk)
- Laporan (Laba Rugi, Neraca, Arus Kas)
- Pengelolaan Bisnis (POS, Inventory, Piutang, Utang)
- Manajemen User

### **User**
Dapat mengakses:
- Input Transaksi (Penerimaan & Pengeluaran saja)
- Laporan (semua)
- Pengelolaan Bisnis (POS, Inventory, Piutang, Utang)

**TIDAK** dapat mengakses:
- Master Data (hanya admin)
- Transaksi Modal (hanya admin)
- Manajemen User (hanya admin)

---

## 📦 Instalasi dan Setup

### **Langkah 1: Buat Google Spreadsheet Baru**

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Beri nama: **"UMKM Accounting System"** (atau nama lain sesuai keinginan)

### **Langkah 2: Buka Apps Script Editor**

1. Di Google Sheets, klik menu **Extensions** > **Apps Script**
2. Akan terbuka Google Apps Script editor

### **Langkah 3: Copy File Code.gs**

1. Hapus semua kode yang ada di editor (file `Code.gs` default)
2. Copy seluruh isi file **Code.gs** dari repository ini
3. Paste ke Apps Script editor
4. Simpan (Ctrl+S atau klik ikon Save)

### **Langkah 4: Buat File HTML**

1. Di Apps Script editor, klik **+** di sebelah Files
2. Pilih **HTML**
3. Beri nama: **index**
4. Copy seluruh isi file **index.html** (versi lengkap dengan semua fitur)
5. Paste ke file index.html
6. Simpan

### **Langkah 5: Inisialisasi Database**

1. Di Apps Script editor, pilih fungsi **initializeSpreadsheet** dari dropdown di toolbar
2. Klik **Run** (▶️)
3. Pertama kali akan muncul dialog izin:
   - Klik **Review Permissions**
   - Pilih akun Google Anda
   - Klik **Advanced** > **Go to [Project Name] (unsafe)**
   - Klik **Allow**
4. Tunggu hingga selesai (cek Execution log)
5. Kembali ke Google Sheets, Anda akan melihat sheets baru yang otomatis dibuat

### **Langkah 6: Deploy sebagai Web App**

1. Di Apps Script editor, klik **Deploy** > **New deployment**
2. Klik ikon **⚙️** (gear) di sebelah "Select type"
3. Pilih **Web app**
4. Isi konfigurasi:
   - **Description**: "UMKM Accounting System"
   - **Execute as**: Me
   - **Who has access**: Anyone (atau "Anyone with the link" untuk lebih aman)
5. Klik **Deploy**
6. Copy **Web app URL** yang diberikan
7. Buka URL tersebut di browser

### **Langkah 7: Login Pertama Kali**

**Default Accounts:**
- **Admin**
  - Username: `admin`
  - Password: `admin123`

- **User**
  - Username: `user`
  - Password: `user123`

**⚠️ PENTING**: Segera ganti password default setelah login pertama!

---

## 🗄️ Struktur Database (Google Sheets)

Sistem akan otomatis membuat sheets berikut:

### 1. **Users**
| Column | Type | Description |
|--------|------|-------------|
| UserID | String | ID unik user |
| Username | String | Username untuk login |
| Password | String | Password (❗️ Production: gunakan hash) |
| FullName | String | Nama lengkap |
| Role | String | admin atau user |
| Active | Boolean | Status aktif/nonaktif |
| CreatedDate | Date | Tanggal pembuatan |

### 2. **Accounts** (Chart of Accounts)
| Column | Type | Description |
|--------|------|-------------|
| AccountCode | String | Kode akun (misal: 1-1001) |
| AccountName | String | Nama akun (misal: Kas) |
| AccountType | String | Asset, Liability, Equity, Revenue, Expense |
| Category | String | Kategori detail |
| ParentAccount | String | Akun parent (jika ada) |
| Balance | Number | Saldo akun |
| Active | Boolean | Status aktif |

**Akun Default yang dibuat:**

**ASET (1-xxxx)**
- 1-1001: Kas
- 1-1002: Bank
- 1-1003: Piutang Usaha
- 1-1004: Persediaan Barang
- 1-2001: Peralatan
- 1-2002: Kendaraan
- 1-2003: Bangunan

**KEWAJIBAN (2-xxxx)**
- 2-1001: Utang Usaha
- 2-1002: Utang Bank

**EKUITAS (3-xxxx)**
- 3-1001: Modal Pemilik
- 3-2001: Laba Ditahan

**PENDAPATAN (4-xxxx)**
- 4-1001: Pendapatan Penjualan
- 4-1002: Pendapatan Jasa
- 4-2001: Pendapatan Lain-lain

**BEBAN (5-xxxx, 6-xxxx)**
- 5-1001: Beban Gaji
- 5-1002: Beban Sewa
- 5-1003: Beban Listrik & Air
- 5-1004: Beban Telepon & Internet
- 5-1005: Beban Perlengkapan
- 5-1006: Beban Transportasi
- 6-1001: Harga Pokok Penjualan
- 6-2001: Beban Administrasi
- 6-2002: Beban Pemasaran

### 3. **Customers**
| Column | Type | Description |
|--------|------|-------------|
| CustomerID | String | ID pelanggan |
| CustomerName | String | Nama pelanggan |
| Address | String | Alamat |
| Phone | String | Nomor telepon |
| Email | String | Email |
| Active | Boolean | Status aktif |
| CreatedDate | Date | Tanggal input |

### 4. **Suppliers**
| Column | Type | Description |
|--------|------|-------------|
| SupplierID | String | ID pemasok |
| SupplierName | String | Nama pemasok |
| Address | String | Alamat |
| Phone | String | Nomor telepon |
| Email | String | Email |
| Active | Boolean | Status aktif |
| CreatedDate | Date | Tanggal input |

### 5. **Products**
| Column | Type | Description |
|--------|------|-------------|
| ProductID | String | ID produk |
| ProductCode | String | Kode produk |
| ProductName | String | Nama produk |
| Category | String | Kategori |
| Unit | String | Satuan (pcs, kg, dll) |
| PurchasePrice | Number | Harga beli |
| SellingPrice | Number | Harga jual |
| Stock | Number | Stok saat ini |
| MinStock | Number | Stok minimal |
| Active | Boolean | Status aktif |

### 6. **Transactions**
| Column | Type | Description |
|--------|------|-------------|
| TransactionID | String | ID transaksi |
| TransactionDate | Date | Tanggal transaksi |
| TransactionType | String | Penerimaan, Pengeluaran, Modal |
| AccountCode | String | Kode akun terkait |
| Description | String | Keterangan |
| Amount | Number | Jumlah |
| ReferenceNo | String | Nomor referensi |
| CustomerID | String | ID pelanggan (opsional) |
| SupplierID | String | ID pemasok (opsional) |
| UserID | String | ID user yang input |
| CreatedDate | Date | Tanggal input |

### 7. **Inventory**
| Column | Type | Description |
|--------|------|-------------|
| InventoryID | String | ID transaksi inventory |
| TransactionDate | Date | Tanggal |
| ProductID | String | ID produk |
| TransactionType | String | Masuk / Keluar |
| Quantity | Number | Jumlah |
| UnitPrice | Number | Harga satuan |
| TotalPrice | Number | Total harga |
| ReferenceNo | String | Nomor referensi |
| Notes | String | Catatan |
| UserID | String | ID user |
| CreatedDate | Date | Tanggal input |

### 8. **AccountReceivable** (Piutang)
| Column | Type | Description |
|--------|------|-------------|
| ARID | String | ID piutang |
| InvoiceNo | String | Nomor invoice |
| InvoiceDate | Date | Tanggal invoice |
| CustomerID | String | ID pelanggan |
| TotalAmount | Number | Total piutang |
| PaidAmount | Number | Jumlah terbayar |
| RemainingAmount | Number | Sisa piutang |
| DueDate | Date | Jatuh tempo |
| Status | String | Belum Bayar, Cicilan, Lunas |
| Notes | String | Catatan |
| CreatedDate | Date | Tanggal input |

### 9. **AccountPayable** (Utang)
| Column | Type | Description |
|--------|------|-------------|
| APID | String | ID utang |
| InvoiceNo | String | Nomor invoice |
| InvoiceDate | Date | Tanggal invoice |
| SupplierID | String | ID pemasok |
| TotalAmount | Number | Total utang |
| PaidAmount | Number | Jumlah terbayar |
| RemainingAmount | Number | Sisa utang |
| DueDate | Date | Jatuh tempo |
| Status | String | Belum Bayar, Cicilan, Lunas |
| Notes | String | Catatan |
| CreatedDate | Date | Tanggal input |

### 10. **POS_Transactions**
| Column | Type | Description |
|--------|------|-------------|
| POSID | String | ID transaksi POS |
| TransactionDate | Date | Tanggal |
| InvoiceNo | String | Nomor invoice |
| CustomerID | String | ID pelanggan (opsional) |
| Items | JSON String | Array item yang dibeli |
| Subtotal | Number | Subtotal |
| Tax | Number | Pajak |
| Discount | Number | Diskon |
| Total | Number | Total |
| PaymentMethod | String | Metode pembayaran |
| UserID | String | ID kasir |
| CreatedDate | Date | Tanggal input |

---

## 🔒 Fitur Keamanan

### 1. **Authentication**
- Login dengan username dan password
- Session management menggunakan PropertiesService
- Auto-logout saat session expired

### 2. **Authorization (Role-based Access Control)**
- Setiap fungsi backend memeriksa role user
- Fungsi `checkAccess()` memastikan user memiliki izin yang sesuai
- Admin bypass: Admin memiliki akses penuh ke semua fitur

### 3. **Input Validation**
- Semua input divalidasi sebelum disimpan
- Required field checking
- Data type validation
- Sanitization untuk mencegah injection

### 4. **Best Practices**
- Session stored di UserProperties (tidak di ScriptProperties)
- Password stored in plain text (⚠️ **Production**: gunakan hashing seperti SHA-256)
- Script properties untuk konfigurasi sensitif

### 📌 **Security Recommendations untuk Production:**

```javascript
// Gunakan library untuk password hashing
function hashPassword(password) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + SALT
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

// Tambahkan rate limiting untuk login
function checkRateLimit(username) {
  // Implementasi rate limiting
}

// Tambahkan 2FA (Two-Factor Authentication)
// Gunakan Google Authenticator atau SMS OTP
```

---

## 📊 Cara Penggunaan

### **Dashboard**
Menampilkan ringkasan:
- Total penerimaan dan pengeluaran bulan ini
- Laba bersih
- Saldo kas
- Posisi keuangan (Aset, Kewajiban, Ekuitas)
- Alert stok menipis, piutang dan utang tertunda

### **Input Transaksi**
1. Pilih menu Penerimaan/Pengeluaran/Modal
2. Klik "Tambah Transaksi"
3. Isi form:
   - Tanggal
   - Akun (pilih dari dropdown)
   - Jumlah
   - Keterangan
   - Referensi (opsional)
   - Pelanggan/Pemasok (opsional)
4. Klik Simpan
5. Transaksi otomatis mempengaruhi saldo akun terkait

### **Master Data**
- **Akun**: Tambah, edit, hapus akun keuangan
- **Pelanggan**: Kelola data pelanggan
- **Pemasok**: Kelola data pemasok
- **Produk**: Kelola produk dengan tracking harga beli, jual, dan stok

### **Laporan**
1. **Laba Rugi**:
   - Pilih periode (dari tanggal - sampai tanggal)
   - Klik "Tampilkan Laporan"
   - Sistem menghitung pendapatan, beban, dan laba/rugi bersih

2. **Neraca**:
   - Pilih tanggal per (as of date)
   - Sistem menampilkan posisi Aset, Kewajiban, dan Ekuitas

3. **Arus Kas**:
   - Pilih periode
   - Sistem menghitung arus kas dari:
     - Aktivitas Operasi
     - Aktivitas Investasi
     - Aktivitas Pendanaan

### **POS (Kasir)**
1. Pilih produk dari grid
2. Produk masuk ke keranjang
3. Atur quantity dengan tombol +/-
4. Klik Checkout
5. Sistem otomatis:
   - Mencatat transaksi penjualan
   - Mengurangi stok
   - Membuat jurnal penerimaan

### **Inventory**
1. **Barang Masuk**: Tambah stok (misal: pembelian)
2. **Barang Keluar**: Kurangi stok (misal: retur)
3. Sistem tracking:
   - Quantity
   - Harga satuan
   - Riwayat transaksi
   - Stok real-time

### **Piutang (AR)**
1. Tambah piutang baru (invoice pelanggan)
2. Catat pembayaran saat pelanggan bayar
3. Sistem tracking:
   - Total piutang
   - Jumlah terbayar
   - Sisa piutang
   - Status (Belum Bayar, Cicilan, Lunas)
4. Otomatis membuat jurnal penerimaan saat pembayaran

### **Utang (AP)**
1. Tambah utang baru (invoice dari supplier)
2. Catat pembayaran saat bayar utang
3. Sistem tracking:
   - Total utang
   - Jumlah terbayar
   - Sisa utang
   - Status
4. Otomatis membuat jurnal pengeluaran saat pembayaran

---

## 🔄 Alur Data & Integrasi

### **Contoh: Transaksi Penjualan via POS**

1. User input penjualan di POS
2. Sistem mencatat di `POS_Transactions`
3. Sistem mengurangi stok di `Products`
4. Sistem mencatat transaksi inventory di `Inventory` (barang keluar)
5. Sistem mencatat jurnal di `Transactions`:
   - Debit: Kas (1-1001)
   - Credit: Pendapatan Penjualan (4-1001)
6. Saldo Kas bertambah
7. Dashboard ter-update otomatis

### **Contoh: Pembayaran Piutang**

1. User catat pembayaran piutang
2. Sistem update `AccountReceivable`:
   - PaidAmount bertambah
   - RemainingAmount berkurang
   - Status berubah (jika lunas)
3. Sistem mencatat jurnal di `Transactions`:
   - Debit: Kas (1-1001)
   - Credit: Piutang Usaha (1-1003)
4. Saldo Kas dan Piutang ter-update

---

## 🛠️ Customization

### **Menambah Akun Baru**
1. Login sebagai Admin
2. Buka Master Data > Daftar Akun
3. Tambah akun dengan format:
   - **Aset**: 1-xxxx
   - **Kewajiban**: 2-xxxx
   - **Ekuitas**: 3-xxxx
   - **Pendapatan**: 4-xxxx
   - **Beban**: 5-xxxx atau 6-xxxx

### **Menambah User Baru**
1. Login sebagai Admin
2. Buka Manajemen User
3. Klik Tambah User
4. Isi username, password, nama lengkap, dan role
5. Simpan

### **Mengubah Tampilan**
Edit file `index.html`:
- CSS di bagian `<style>`
- Layout di bagian `<body>`
- Warna, font, spacing sesuai keinginan

### **Menambah Fitur Baru**
1. Tambahkan fungsi di `Code.gs`
2. Tambahkan UI di `index.html`
3. Integrasikan dengan `google.script.run`

---

## 📱 Responsive Design

Sistem sudah responsive dan dapat diakses via:
- 💻 Desktop/Laptop
- 📱 Tablet
- 📲 Mobile Phone

---

## 🐛 Troubleshooting

### **Error: "Session tidak ditemukan"**
- **Solusi**: Login ulang

### **Error: "Akses ditolak"**
- **Solusi**: Pastikan role user sesuai dengan akses yang dibutuhkan

### **Data tidak muncul**
- **Solusi**:
  1. Pastikan sudah run `initializeSpreadsheet()`
  2. Cek apakah ada error di Apps Script Execution log
  3. Refresh halaman

### **Gagal deploy**
- **Solusi**:
  1. Pastikan sudah memberikan izin akses
  2. Coba deploy ulang dengan versi baru
  3. Cek error message di deployment

---

## 📞 Support & Kontribusi

Untuk bug report atau feature request, silakan buka issue di repository ini.

---

## 📄 License

MIT License - Silakan digunakan dan dimodifikasi sesuai kebutuhan.

---

## ⚡ Performance Tips

1. **Limit Data**: Untuk performa optimal, batasi data yang ditampilkan (misal: 6 bulan terakhir)
2. **Archiving**: Archive data lama ke sheet terpisah
3. **Indexing**: Gunakan ID yang unik dan terstruktur
4. **Caching**: Simpan data yang sering diakses di cache

---

## 🎯 Roadmap

- [ ] Export laporan ke PDF
- [ ] Integration dengan email (notifikasi)
- [ ] Backup otomatis
- [ ] Multi-currency support
- [ ] Chart dan grafik visualisasi
- [ ] Mobile app (PWA)
- [ ] Barcode scanner untuk POS
- [ ] Integration dengan e-commerce

---

## 🙏 Credits

Dibuat dengan ❤️ untuk membantu UMKM Indonesia mengelola keuangan dengan lebih baik.

**Teknologi yang digunakan:**
- Google Apps Script
- Google Sheets
- HTML/CSS/JavaScript
- Bootstrap-inspired design

---

**Happy Accounting! 📊💰**
