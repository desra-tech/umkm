# FAQ - Pertanyaan yang Sering Diajukan

## Umum

### Q: Apa itu Sistem Informasi Pembukuan UMKM?
**A:** Sistem ini adalah aplikasi web berbasis Google Apps Script yang membantu UMKM mengelola keuangan mereka. Data disimpan di Google Sheets, sehingga tidak perlu server atau database khusus.

### Q: Apakah sistem ini gratis?
**A:** Ya, sistem ini gratis untuk digunakan. Anda hanya perlu akun Google (yang juga gratis) untuk menjalankannya.

### Q: Apakah saya perlu keahlian programming?
**A:** Tidak. Sistem sudah siap pakai. Anda hanya perlu copy-paste kode dan deploy sesuai panduan instalasi.

### Q: Apakah sistem ini aman?
**A:** Ya, sangat aman. Sistem menggunakan:
- Enkripsi password dengan SHA-256
- Session management dengan timeout
- Role-based access control
- Input sanitization
- CSRF protection
- Data tersimpan di Google Drive yang sudah ter-enkripsi

### Q: Berapa kapasitas maksimal data yang bisa ditampung?
**A:** Google Sheets dapat menampung hingga 5 juta sel. Untuk UMKM dengan transaksi 100-200 per hari, sistem ini bisa digunakan untuk 5-10 tahun tanpa masalah.

## Instalasi & Setup

### Q: Berapa lama waktu instalasi?
**A:** Dengan mengikuti panduan, instalasi bisa selesai dalam 15-30 menit.

### Q: Apakah saya bisa menggunakan akun Google gratis?
**A:** Ya, akun Google gratis sudah cukup untuk menjalankan sistem ini.

### Q: Bagaimana jika saya salah upload file?
**A:** Anda bisa hapus file yang salah di Apps Script Editor dan upload ulang yang benar.

### Q: Apakah bisa diakses dari HP?
**A:** Ya, sistem ini responsive dan bisa diakses dari desktop, tablet, maupun smartphone.

### Q: Bagaimana cara mengganti URL deployment?
**A:** Anda bisa deploy ulang dengan version baru. URL lama tetap bisa digunakan atau bisa di-archive.

## Keamanan & Access

### Q: Bagaimana cara mengganti password default?
**A:**
1. Login dengan admin/admin123
2. Klik menu Administrasi → Kelola User
3. Pilih user admin
4. Klik Ubah Password
5. Masukkan password lama dan password baru
6. Simpan

### Q: Lupa password, bagaimana?
**A:**
Admin bisa reset password:
1. Buka Apps Script Editor
2. Tambah fungsi reset:
```javascript
function resetPassword() {
  const salt = generateSalt();
  const newPassword = 'newpass123';
  const hash = hashPassword(newPassword, salt);

  // Update manually di sheet Users
  // Atau jalankan fungsi createDefaultAdmin() untuk recreate admin
}
```
3. Run fungsi tersebut
4. Login dengan password baru

### Q: Berapa lama session timeout?
**A:** Default 30 menit. Bisa diubah di Settings dengan key "session_timeout".

### Q: Bisa tambah lebih dari 2 role?
**A:** Saat ini hanya ada Admin dan User. Untuk custom role, perlu modifikasi kode di Auth.gs.

### Q: Apakah user bisa melihat data user lain?
**A:** User bisa melihat transaksi yang dibuat user lain, tapi tidak bisa edit. Hanya Admin yang bisa kelola user.

## Penggunaan

### Q: Bagaimana cara input transaksi?
**A:**
1. Klik menu Transaksi → Penerimaan/Pengeluaran
2. Isi form yang tersedia
3. Klik Simpan
4. Transaksi akan otomatis tercatat dalam sistem double-entry

### Q: Apakah harus selalu online?
**A:** Ya, karena sistem berbasis web dan data di cloud, koneksi internet diperlukan.

### Q: Bagaimana jika transaksi salah input?
**A:**
- Admin bisa delete/edit transaksi
- User tidak bisa delete, hanya bisa membuat transaksi koreksi
- Best practice: buat transaksi reversal/koreksi

### Q: Apakah bisa import data dari Excel?
**A:** Saat ini belum ada fitur import otomatis. Anda bisa:
1. Copy data ke Google Sheets secara manual
2. Atau develop fungsi import custom di Code.gs

### Q: Apakah bisa export laporan?
**A:** Ya, semua laporan bisa di-export ke:
- CSV (built-in)
- PDF (via print browser)
- Excel (copy dari Google Sheets)

### Q: Bagaimana cara backup data?
**A:**
1. Automatic: Gunakan fitur backup di menu Admin
2. Manual: File → Make a copy di Google Sheets
3. Scheduled: Setup trigger otomatis di Apps Script

## Master Data

### Q: Apakah akun bisa dihapus?
**A:** Tidak recommended menghapus akun yang sudah digunakan. Lebih baik ubah status menjadi "Inactive".

### Q: Bagaimana cara menambah akun custom?
**A:**
1. Login sebagai Admin
2. Menu Master Data → Daftar Akun
3. Klik Tambah Akun
4. Isi kode akun (format: X-XXXX)
5. Isi detail lainnya
6. Simpan

### Q: Apakah kode akun bisa diubah?
**A:** Tidak recommended karena akan affect historical data. Lebih baik buat akun baru.

### Q: Berapa maksimal produk yang bisa ditambahkan?
**A:** Tidak ada limit hard. Tergantung performa Google Sheets (recommended max 10,000 produk).

## Laporan

### Q: Kapan laporan ter-update?
**A:** Real-time. Setiap transaksi baru langsung muncul di laporan.

### Q: Kenapa angka di laporan tidak balance?
**A:**
- Cek apakah ada transaksi yang single-entry (harusnya double-entry)
- Jalankan fungsi verifikasi balance
- Review transaksi terakhir yang di-input

### Q: Bagaimana cara melihat laporan periode tertentu?
**A:** Semua laporan punya filter tanggal. Pilih tanggal mulai dan tanggal akhir yang diinginkan.

### Q: Apakah bisa print laporan?
**A:** Ya, gunakan browser print (Ctrl+P) atau fungsi print yang tersedia.

### Q: Format mata uang bisa diubah?
**A:** Ya, di menu Pengaturan ubah setting "currency" (default: IDR).

## POS/Kasir

### Q: Apakah bisa scan barcode?
**A:** Fitur scan barcode belum tersedia. Saat ini hanya bisa input manual atau pilih dari dropdown.

### Q: Bagaimana jika stok tidak cukup?
**A:** Sistem akan menampilkan error "Stok tidak mencukupi" dan transaksi tidak bisa di-save.

### Q: Apakah bisa partial payment?
**A:** Ya, sistem mendukung partial payment. Sisa akan tercatat sebagai piutang.

### Q: Bagaimana cara void transaksi penjualan?
**A:** Admin bisa delete transaksi. Stock akan otomatis ter-restore.

## Inventory

### Q: Metode stock apa yang digunakan?
**A:** Sistem menggunakan moving average. FIFO/LIFO perlu custom development.

### Q: Bagaimana cara stock opname?
**A:**
1. Menu Persediaan → Stock Opname
2. Input stock fisik
3. Sistem akan otomatis buat adjustment
4. Selisih akan tercatat sebagai stock adjustment

### Q: Apakah ada alert stock minimum?
**A:** Ya, di dashboard akan muncul notifikasi jika ada produk dengan stock <= minimum stock.

## Piutang & Utang

### Q: Bagaimana cara input piutang manual?
**A:**
1. Buat transaksi penjualan dengan payment method "Credit"
2. Atau di menu Piutang → Tambah Piutang Manual

### Q: Apakah ada reminder piutang jatuh tempo?
**A:** Ya, di dashboard muncul list piutang yang jatuh tempo.

### Q: Bagaimana cara catat pembayaran piutang?
**A:**
1. Menu Piutang
2. Klik tombol "Bayar" pada item piutang
3. Input jumlah pembayaran
4. Simpan

### Q: Apakah bisa cicilan?
**A:** Ya, bisa partial payment. Catat pembayaran bertahap sampai lunas.

## Performance

### Q: Kenapa loading lama?
**A:**
- Google Sheets punya delay response (2-5 detik normal)
- Jika data sudah banyak (>10k rows), pertimbangkan archive data lama
- Clear cache browser
- Gunakan filter tanggal untuk load data lebih sedikit

### Q: Apakah ada batasan user concurrent?
**A:** Google Apps Script bisa handle ~30 user concurrent. Lebih dari itu mungkin ada delay.

### Q: Bagaimana cara optimasi performa?
**A:**
1. Archive data lama ke sheet terpisah
2. Gunakan index/key untuk lookup cepat
3. Batasi range data yang di-load
4. Implementasi pagination untuk tabel besar

## Troubleshooting

### Q: Error "Authorization required"
**A:**
1. Buka Apps Script Editor
2. Run fungsi testSetup
3. Authorize akses
4. Refresh browser

### Q: Error "Cannot read property"
**A:**
1. Cek semua file sudah ter-upload
2. Cek nama file case-sensitive
3. Re-deploy dengan version baru

### Q: Data hilang/corrupt
**A:**
1. Jangan panik
2. Cek di Google Drive → Trash (data bisa di-restore)
3. Restore dari backup
4. Contact support jika perlu bantuan

### Q: Login tidak bisa
**A:**
1. Cek username dan password
2. Cek capslock
3. Clear cache dan cookies browser
4. Reset password jika perlu

## Customization

### Q: Bisa custom design/tampilan?
**A:** Ya, edit file Styles.html untuk mengubah CSS.

### Q: Bisa tambah fitur baru?
**A:** Ya, sistem open source. Anda bisa develop fitur tambahan di file .gs atau .html.

### Q: Bisa integr asi dengan aplikasi lain?
**A:** Ya, bisa via Google Apps Script API atau Zapier/IFTTT.

### Q: Bisa multi-currency?
**A:** Belum built-in. Perlu custom development untuk tracking exchange rate.

### Q: Bisa multi-company/branch?
**A:** Tidak built-in. Bisa buat separate deployment per company/branch.

## Compliance & Accounting

### Q: Apakah sesuai standar akuntansi Indonesia?
**A:** Ya, sistem menggunakan double-entry bookkeeping sesuai standar akuntansi.

### Q: Apakah bisa untuk pelaporan pajak?
**A:** Data dari sistem ini bisa digunakan sebagai dasar pelaporan pajak. Export laporan lalu sesuaikan dengan format e-SPT.

### Q: Apakah perlu software accounting lain?
**A:** Untuk UMKM kecil-menengah, sistem ini sudah cukup. Untuk enterprise dengan kompleksitas tinggi, mungkin perlu software ERP.

### Q: Bisa generate faktur pajak?
**A:** Saat ini belum ada fitur generate faktur pajak. Perlu integrasi dengan e-Faktur.

## Support

### Q: Dimana bisa dapat bantuan?
**A:**
1. Baca dokumentasi lengkap di folder /docs/
2. Cek file TROUBLESHOOTING.md
3. Contact support via email/WhatsApp/Telegram

### Q: Apakah ada training?
**A:** Training bisa diatur sesuai kebutuhan. Contact kami untuk jadwal training.

### Q: Apakah ada garansi?
**A:** Sistem ini provided "as-is" tanpa garansi. Namun kami commit untuk maintain dan update secara berkala.

### Q: Bagaimana cara request fitur baru?
**A:** Submit feature request via GitHub Issues atau contact kami langsung.

---

**Tidak menemukan jawaban yang Anda cari?**

Hubungi kami:
- 📧 Email: support@example.com
- 💬 Telegram: @umkmfinancial
- 📱 WhatsApp: +62xxx-xxxx-xxxx
