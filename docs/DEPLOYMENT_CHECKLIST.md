# Deployment Checklist - UMKM Financial System

Gunakan checklist ini untuk memastikan semua file telah diupload dengan benar ke Google Apps Script.

## Pre-Deployment

- [ ] Akun Google sudah siap
- [ ] Google Spreadsheet baru sudah dibuat
- [ ] Apps Script Editor sudah dibuka

## Backend Files (7 file .gs)

Upload file-file berikut dari folder `/backend/`:

- [ ] `Code.gs` - Main code dan configuration
- [ ] `Auth.gs` - Authentication functions
- [ ] `Security.gs` - Security functions
- [ ] `Transactions.gs` - Transaction handling
- [ ] `MasterData.gs` - Master data management
- [ ] `Reports.gs` - Report generation
- [ ] `Business.gs` - Business logic

**Total Backend: 7 files**

## Frontend Files (21 file .html)

Upload file-file berikut dari folder `/frontend/`:

### Core Files
- [ ] `Login.html` - Login page
- [ ] `Index.html` - Main application layout
- [ ] `Styles.html` - CSS styles
- [ ] `Scripts.html` - JavaScript code
- [ ] `Dashboard.html` - Dashboard page

### Transaction Pages
- [ ] `Penerimaan.html` - Income transactions
- [ ] `Pengeluaran.html` - Expense transactions
- [ ] `Modal.html` - Capital transactions ⚠️ **JANGAN LUPA!**

### Master Data Pages
- [ ] `Accounts.html` - Chart of accounts
- [ ] `Customers.html` - Customer management
- [ ] `Suppliers.html` - Supplier management
- [ ] `Products.html` - Product/service management

### Report Pages
- [ ] `ProfitLoss.html` - Profit & Loss report
- [ ] `BalanceSheet.html` - Balance Sheet report
- [ ] `CashFlow.html` - Cash Flow report

### Business Pages
- [ ] `POS.html` - Point of Sale
- [ ] `Inventory.html` - Inventory management
- [ ] `Receivables.html` - Accounts receivable
- [ ] `Payables.html` - Accounts payable

### Admin Pages
- [ ] `Users.html` - User management
- [ ] `Settings.html` - System settings

**Total Frontend: 21 files**

## Post-Upload Verification

- [ ] Total file di Apps Script = 28 files (7 .gs + 21 .html)
- [ ] Tidak ada error di Apps Script Editor
- [ ] Semua file bisa dibuka dan diedit

## Deployment Configuration

- [ ] Klik Deploy → New deployment
- [ ] Pilih type: Web app
- [ ] Execute as: Me
- [ ] Who has access: Anyone (atau sesuai kebutuhan)
- [ ] Salin Web App URL
- [ ] Klik Done

## Post-Deployment

- [ ] Jalankan fungsi `initializeDatabase` di Apps Script Editor
- [ ] Cek Google Sheets - harus ada 12 sheets baru
- [ ] Buka Web App URL
- [ ] Test login dengan admin/admin123
- [ ] Verifikasi semua menu bisa diakses tanpa error
- [ ] Ubah password default admin

## Common Errors to Check

| Error | Missing File | Solution |
|-------|--------------|----------|
| "No HTML file named Modal was found" | Modal.html | Upload Modal.html |
| "No HTML file named Products was found" | Products.html | Upload Products.html |
| "No HTML file named [Name] was found" | [Name].html | Upload file yang hilang |
| "include is not defined" | Code.gs | Upload Code.gs |

## Re-Deployment (jika ada update)

- [ ] Backup data dari Google Sheets
- [ ] Upload file yang diupdate
- [ ] Deploy → Manage deployments
- [ ] Edit deployment aktif
- [ ] Pilih "New version"
- [ ] Tambahkan description (misalnya: "Fix Modal.html error")
- [ ] Deploy
- [ ] Test semua fungsi

## Support

Jika masih ada error setelah mengikuti checklist ini:
1. Baca PANDUAN_INSTALASI.md section Troubleshooting
2. Cek apakah semua 28 files sudah terupload
3. Clear browser cache dan coba lagi
4. Review logs di Apps Script Editor (View → Logs)

---

**Tips:**
- Upload file satu per satu dengan hati-hati
- Pastikan nama file sesuai persis (case-sensitive)
- Jangan gunakan spasi atau karakter khusus dalam nama file
- Selalu test setelah deployment sebelum digunakan production
