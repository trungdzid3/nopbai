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
