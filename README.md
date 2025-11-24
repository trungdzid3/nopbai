<<<<<<< HEAD
# 📚 EduSubmit - Hệ Thống Quản Lý Lớp Học & Nộp Bài

Ứng dụng web quản lý Google Drive, Google Forms và Google Sheets để theo dõi bài tập học sinh.

## 🌐 Truy cập App

**URL:** https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html

**Cài đặt như PWA (Progressive Web App):**
1. Mở link trên Chrome/Edge
2. Click icon ➕ "Install" trên thanh địa chỉ
3. App sẽ cài đặt như ứng dụng Desktop
4. Mở từ Desktop icon → Không cần browser

## ✨ Tính Năng

- ✅ **Quản lý lớp học** - Tạo/sửa/xóa thông tin lớp
- ✅ **Tích hợp Google Drive** - Tự động tạo folder và sheet
- ✅ **Google Forms** - Liên kết form nộp bài với sheet
- ✅ **Export PDF** - Xuất danh sách học sinh và nhận xét
- ✅ **Tự động hóa** - Dọn dẹp, điền "Chưa nộp", lịch trình
- ✅ **PWA Support** - Cài đặt như app, hoạt động offline
- ✅ **Responsive** - Hoạt động trên mọi thiết bị

## 🚀 Hướng Dẫn Sử Dụng

### 1. Đăng nhập
- Mở app → Click **Đăng nhập**
- Cho phép popup nếu browser hỏi
- Chọn tài khoản Google
- Cấp quyền Drive & Sheets

### 2. Tạo lớp học
- Click **Tạo lớp mới**
- Điền thông tin lớp
- Thêm loại bài tập (Điểm danh, Bài tập 1, 2...)
- Click **Lưu lớp**

### 3. Export PDF
- Chọn lớp từ dropdown
- Chọn loại bài tập
- Click **Export PDF**
- PDF sẽ tự động download

## 📋 Cấu Hình Bảng Tự Động (Google Sheets)

Xem hướng dẫn chi tiết trong file: `LIBRARY_SETUP_GUIDE.md`

**Format thời gian:**
- `CN` = Chủ Nhật
- `T2` = Thứ Hai
- `T3` = Thứ Ba
- ...
- `T7` = Thứ Bảy

**Ví dụ:** `CN-18:00` (Chủ Nhật 6h chiều)

## 🔧 Development

### Cấu trúc dự án

```
nopbai/
├── drive_folder_to_pdf.html  # Giao diện chính
├── app.js                    # Logic JavaScript
├── manifest.json             # PWA manifest
├── sw.js                     # Service Worker
├── icon.png                  # App icon (512x512)
├── LibraryFormScript.txt     # Google Apps Script (Form)
├── LibrarySheetScript.txt    # Google Apps Script (Sheet)
├── WrapperFormScript.txt     # Wrapper Script (Form)
├── WrapperSheetScript.txt    # Wrapper Script (Sheet)
└── README.md                 # File này
```

### Deployment (GitHub Pages)

**Đã deploy tại:** https://trungdzid3.github.io/nopbai/

**Để update:**
```powershell
git add .
git commit -m "Your update message"
git push origin master:main
```

Đợi 1-2 phút → GitHub Pages tự động deploy.

### OAuth Configuration

**Authorized JavaScript origins:**
```
https://trungdzid3.github.io
```

**Authorized redirect URIs:**
```
https://trungdzid3.github.io
https://trungdzid3.github.io/
https://trungdzid3.github.io/nopbai
https://trungdzid3.github.io/nopbai/
https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
```

## 📚 Google Apps Scripts

### Library Script (Dùng chung)

**LibraryFormScript.txt** và **LibrarySheetScript.txt**:
- Upload lên Google Apps Script
- Deploy as Library
- Copy Script ID

### Wrapper Script (Cho từng Form/Sheet)

**WrapperFormScript.txt** và **WrapperSheetScript.txt**:
- Paste vào Google Forms/Sheets Script Editor
- Thay `YOUR_LIBRARY_SCRIPT_ID` bằng ID thật
- Deploy triggers

Chi tiết xem: `LIBRARY_SETUP_GUIDE.md`

## 🔄 Update Workflow

1. Sửa code local (`app.js`, `drive_folder_to_pdf.html`, etc.)
2. Test trên browser
3. Commit & push lên GitHub:
   ```powershell
   git add .
   git commit -m "Update feature X"
   git push origin master:main
   ```
4. Đợi 1-2 phút
5. Refresh app trên browser → Có code mới

**Không cần:**
- ❌ Tạo ZIP
- ❌ Upload lên Drive
- ❌ User download lại

**User chỉ cần:**
- ✅ Reload page (F5)
- ✅ Hoặc PWA tự update

## 📄 Tài Liệu

- **LIBRARY_SETUP_GUIDE.md** - Hướng dẫn setup Google Apps Script
- **DEPLOY_UPDATE.md** - Quy trình cập nhật phiên bản mới

## 🐛 Troubleshooting

### Lỗi: "redirect_uri_mismatch"
→ Kiểm tra OAuth redirect URIs trong Google Console

### Lỗi: "Popup bị chặn"
→ Cho phép popup cho `trungdzid3.github.io`:
- Click icon 🚫 trên thanh địa chỉ
- Chọn "Always allow popups"

### Lỗi: "Failed to fetch"
→ Kiểm tra internet connection

### PWA không hiện nút Install
→ Chỉ hoạt động trên HTTPS (GitHub Pages OK)

## 💡 Tips

- **LocalStorage** lưu data (không mất khi reload)
- **Service Worker** cache code (hoạt động offline sau lần đầu)
- **PWA** có thể ghim vào Taskbar như app thật
- **Google API** cần internet để sync Drive/Sheets

## 📞 Support

Gặp vấn đề? Liên hệ: trungdzid3@gmail.com

---

**🎉 Phát triển bởi trungdzid3**
=======
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
>>>>>>> 12e5fa7693101c82cf260c9df7d63685633d9c6f
