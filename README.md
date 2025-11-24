# 📦 Drive Folder to PDF - Desktop App

Ứng dụng Desktop (Electron) để quản lý Google Drive Folder to PDF.

## 🚀 Cách chạy (Dev mode)

### Bước 1: Cài đặt Node.js
1. Tải Node.js từ: https://nodejs.org/ (phiên bản LTS)
2. Cài đặt và restart máy tính

### Bước 2: Cài đặt dependencies
Mở PowerShell **với quyền Administrator** trong thư mục `electron-app`:

**Nếu gặp lỗi "running scripts is disabled":**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Nhấn `Y` để xác nhận.

Sau đó chạy:
```powershell
cd electron-app
npm install
```

### Bước 3: Chạy app
```powershell
npm start
```

---

## 📦 Build thành file .exe (Windows)

### Cách 1: Build đơn giản
```powershell
npm run build
```

File .exe sẽ nằm trong thư mục `dist/`

### Cách 2: Build với installer
Sau khi chạy `npm run build`, file installer sẽ có ở:
```
dist/Drive Folder to PDF Setup 1.0.0.exe
```

Gửi file này cho bạn bè, họ chỉ cần:
1. Chạy file Setup.exe
2. Cài đặt như app bình thường
3. Icon sẽ xuất hiện trên Desktop

---

## 📁 Cấu trúc thư mục

```
electron-app/
├── main.js          # Electron main process
├── index.html       # File HTML giao diện
├── app.js           # Logic JavaScript
├── package.json     # Config và dependencies
└── README.md        # File hướng dẫn này
```

---

## 🎨 Tùy chỉnh

### Đổi icon app
1. Tạo file `icon.ico` (256x256 hoặc 512x512)
2. Đặt vào thư mục `electron-app/`
3. Build lại

### Đổi tên app
Sửa trong `package.json`:
```json
"productName": "Tên app của bạn"
```

### Đổi kích thước cửa sổ
Sửa trong `main.js`:
```javascript
width: 1400,  // Rộng
height: 900,  // Cao
```

---

## 🐛 Troubleshooting

### Lỗi: "npm không được nhận dạng"
→ Cài lại Node.js và restart máy

### Lỗi: "running scripts is disabled"
→ Xem hướng dẫn ở Bước 2 phía trên

### Lỗi: "electron-builder không build được"
→ Chạy:
```powershell
npm install --save-dev electron-builder
npm run build
```

### App chạy nhưng trắng xóa
→ Kiểm tra file `index.html` và `app.js` có trong thư mục không

### Lỗi Google OAuth: "invalid_request" hoặc "storagerelay://file"
→ **Nguyên nhân:** Electron không hỗ trợ OAuth redirect với file://

**Giải pháp:**
1. **Dùng trình duyệt thay vì Electron** (Khuyến nghị):
   - Mở `drive_folder_to_pdf.html` bằng Chrome/Edge thông thường
   - Đăng nhập Google
   - LocalStorage sẽ lưu credential
   - Sau đó có thể dùng Electron app (credential được sync)

2. **HOẶC: Build app nhưng vẫn dùng browser để chạy:**
   - Đóng gói 2 files (`drive_folder_to_pdf.html` + `app.js`) vào ZIP
   - Gửi cho người khác
   - Họ mở file HTML bằng trình duyệt
   - Đơn giản hơn và không bị lỗi OAuth!

---

## 🔄 Hệ thống Auto-Update

App tự động kiểm tra phiên bản mới mỗi khi khởi động!

### Cách setup Auto-Update:

#### Bước 1: Tạo thư mục public trên Google Drive
1. Tạo thư mục mới trên Drive (ví dụ: "App Updates")
2. Click phải → **Chia sẻ** → Chọn "Bất kỳ ai có link đều xem được"
3. Copy ID thư mục từ URL: `https://drive.google.com/drive/folders/[ID_NÀY]`

#### Bước 2: Upload file version.json
1. Mở file `version.json` trong thư mục `electron-app`
2. Sửa thông tin phiên bản mới:
```json
{
  "version": "1.0.1",
  "downloadUrl": "https://drive.google.com/uc?export=download&id=FILE_EXE_ID",
  "changelog": "- Sửa lỗi A\n- Thêm tính năng B",
  "releaseDate": "2025-11-24"
}
```
3. Upload lên thư mục Drive vừa tạo
4. Click phải file → **Chia sẻ** → "Bất kỳ ai có link"
5. Copy ID file từ URL: `https://drive.google.com/file/d/[ID_NÀY]/view`

#### Bước 3: Cấu hình trong code
Mở file `update-checker.js`, sửa dòng:
```javascript
const VERSION_CHECK_URL = 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID';
```
Thay `YOUR_FILE_ID` bằng ID file `version.json` ở Bước 2.

#### Bước 4: Khi có phiên bản mới
1. Sửa số version trong `package.json`: `"version": "1.0.1"`
2. Build app: `npm run build`
3. Upload file .exe trong `dist/` lên Drive
4. Chia sẻ file .exe → Copy ID
5. Cập nhật `version.json`:
   - Tăng `version`
   - Sửa `downloadUrl` với ID file .exe mới
   - Ghi `changelog`
6. Upload `version.json` mới lên Drive (ghi đè file cũ)

#### Bước 5: User nhận update
- Khi user mở app → Tự động kiểm tra
- Hiện popup: "🎉 Có phiên bản mới: 1.0.1"
- User click "Tải về ngay" → Download file .exe
- Cài đè lên bản cũ → **Data giữ nguyên!**

### Lợi ích:
✅ Data người dùng **không bị mất** (lưu trong AppData)
✅ Tự động thông báo khi có update
✅ 1 click để tải về
✅ Changelog rõ ràng

---

## 💾 Data người dùng được lưu ở đâu?

Data (localStorage) được lưu tại:
```
C:\Users\[TÊN]\AppData\Roaming\drive-folder-to-pdf\Local Storage\
```

**Khi cài update mới → Thư mục này KHÔNG bị xóa!**

---

## 📤 Gửi cho người khác

### Cách 1: Gửi installer (Khuyến nghị)
1. Chạy `npm run build`
2. Tìm file trong `dist/Drive Folder to PDF Setup 1.0.0.exe`
3. Gửi file .exe này (khoảng 100-200MB)
4. Người nhận chỉ cần chạy và cài đặt

### Cách 2: Gửi portable (không cần cài)
1. Sau khi build, vào `dist/win-unpacked/`
2. Nén toàn bộ thư mục thành ZIP
3. Gửi file ZIP (khoảng 150-250MB)
4. Người nhận giải nén và chạy `Drive Folder to PDF.exe`

---

## 💡 Tips

- App sẽ lưu data vào LocalStorage của Electron (tương tự trình duyệt)
- Data không bị mất khi đóng app
- App có thể chạy offline (trừ phần Google Drive API)

---

**🎉 Hoàn thành! Giờ bạn có app Desktop chuyên nghiệp!**
