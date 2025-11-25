# 📚 EduSubmit - Hệ Thống Quản Lý Lớp Học & Nộp Bài

Ứng dụng web quản lý Google Drive, Google Forms và Google Sheets để theo dõi bài tập học sinh.

## 🌐 Truy cập App

**URL:** https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html

**Cài đặt như PWA (Progressive Web App):**
1. Mở link trên Chrome/Edge
2. Click icon ➕ "Install" trên thanh địa chỉ
3. App sẽ cài đặt như ứng dụng Desktop
4. Mở từ Desktop icon → Hoạt động như app độc lập

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

Xem hướng dẫn chi tiết trong: `LIBRARY_SETUP_GUIDE.md` (local)

**Format thời gian:**
- `CN` = Chủ Nhật | `T2` = Thứ Hai | `T3` = Thứ Ba | ... | `T7` = Thứ Bảy

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
└── README.md                 # File này
```

### Deployment (GitHub Pages)

**App đang chạy tại:** https://trungdzid3.github.io/nopbai/

**Để update code:**
```powershell
git add .
git commit -m "Your update message"
git push origin master:main
```

Đợi 1-2 phút → GitHub Pages tự động deploy → User reload page (F5) để có code mới.

### OAuth Configuration

**Google Cloud Console:** https://console.cloud.google.com/apis/credentials

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

## 📚 Google Apps Scripts (Local Files)

### Library Script
- `LibraryFormScript.txt` - Script cho Google Forms
- `LibrarySheetScript.txt` - Script cho Google Sheets

### Wrapper Script
- `WrapperFormScript.txt` - Wrapper cho Form
- `WrapperSheetScript.txt` - Wrapper cho Sheet

**Hướng dẫn setup:** Xem `LIBRARY_SETUP_GUIDE.md`

### ⚠️ Quan Trọng: Template Form/Sheet

**Trước khi sử dụng tính năng tạo lớp tự động:**

1. **Form Template** phải đã được **Published**:
   - Mở Form template trong Google Forms editor
   - Click **Send** (góc trên bên phải)
   - Form sẽ tự động published
   - Hoặc check Settings → đảm bảo "Collect email addresses" đã bật

2. **Sheet Template** phải có:
   - Sheet "Cấu Hình" với header đúng format
   - Sheet "(Mẫu) Bảng nhận xét" để duplicate

**Lý do:** Form được copy từ template chưa published sẽ không hoạt động (Google yêu cầu publish form mới từ Dec 2024).

## 🔄 Update Workflow

1. Sửa code local
2. Test trên browser
3. Commit & push:
   ```powershell
   git add .
   git commit -m "Fix bug X"
   git push origin master:main
   ```
4. Đợi 1-2 phút
5. User reload page → Done!

**User không cần:**
- ❌ Download file mới
- ❌ Cài đặt lại
- ❌ Làm gì cả

**Chỉ cần:** Reload page (F5) hoặc PWA tự update.

## 🐛 Troubleshooting

### Lỗi: "redirect_uri_mismatch"
→ Thêm URIs vào Google Console (xem phần OAuth Configuration)

### Lỗi: "Popup bị chặn"
→ Cho phép popup:
- Click icon 🚫 trên thanh địa chỉ
- Chọn "Always allow popups from trungdzid3.github.io"

### Lỗi: "Failed to fetch"
→ Kiểm tra kết nối internet

### PWA không hiện nút Install
→ Chỉ hoạt động trên HTTPS (GitHub Pages đã có HTTPS)

## 💡 Tips

- **LocalStorage** - Data không mất khi reload
- **Service Worker** - Cache code, hoạt động offline
- **PWA** - Ghim vào Taskbar, mở như app thật
- **Google API** - Cần internet để sync Drive/Sheets

## 📞 Support

Gặp vấn đề? Liên hệ: trungdzid3@gmail.com

---

**🎉 Phát triển bởi trungdzid3**

