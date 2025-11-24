# 🔄 QUY TRÌNH CẬP NHẬT PHIÊN BẢN MỚI

## 🎯 TÓM TẮT

App đang chạy trên: **https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html**

Khi cập nhật:
1. Sửa code local → Push lên GitHub
2. GitHub Pages tự động deploy (1-2 phút)
3. Cập nhật `version.json` trên Drive
4. User mở app → Thấy popup update → Reload → Done!

---

## BƯỚC 1: SỬA CODE LOCAL

1. Mở file cần sửa trong VS Code (vd: `app.js`, `drive_folder_to_pdf.html`)
2. Sửa code theo yêu cầu
3. **Tăng version trong 2 files:**

**File `app.js` (dòng ~16):**
```javascript
const CURRENT_VERSION = "1.2.0"; // Tăng từ 1.1.0 → 1.2.0
```

**File `sw.js` (dòng 2):**
```javascript
const CACHE_NAME = 'drive2pdf-v1.2.0'; // Tăng từ v1.1.0 → v1.2.0
```

---

## BƯỚC 2: PUSH LÊN GITHUB

### Cách A: Dùng Git (Khuyến nghị - Nhanh)

```powershell
cd "c:\Users\Lenovo\Downloads\Nopbai"
git add .
git commit -m "Update to v1.2.0 - Sửa bug XYZ"
git push
```

### Cách B: Dùng GitHub Web

1. Vào repo: https://github.com/trungdzid3/nopbai
2. Click file cần sửa (vd: `app.js`)
3. Click icon ✏️ "Edit this file"
4. Paste code mới
5. Commit message: `Update to v1.2.0`
6. Click **Commit changes**
7. Lặp lại với từng file khác

---

## BƯỚC 3: ĐỢI GITHUB PAGES DEPLOY

- Đợi **1-2 phút**
- Kiểm tra: Mở https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
- F12 → Console → Kiểm tra `CURRENT_VERSION` đã đổi chưa

---

## BƯỚC 4: CẬP NHẬT version.json

**Sửa file local `version.json`:**
```json
{
  "version": "1.2.0",
  "downloadUrl": "https://drive.google.com/uc?export=download&id=YOUR_ZIP_FILE_ID",
  "changelog": "- Sửa lỗi X\n- Thêm tính năng Y\n- Cải thiện Z",
  "releaseDate": "2025-11-25"
}
```

**Upload lên Drive (Replace file cũ):**
1. Mở Drive, tìm file `version.json` (ID: `1q7DggAUw1bLT6E4GHXPWgKklt0OUQtWV`)
2. Click chuột phải → **Manage versions** → **Upload new version**
3. Chọn file `version.json` mới
4. File ID giữ nguyên!

---

## BƯỚC 5: TEST

1. **Mở app với version cũ** (hoặc set `CURRENT_VERSION = "1.1.0"` tạm)
2. Refresh page
3. Sau 3 giây → **Phải thấy popup:**
   ```
   🎉 Có phiên bản mới: 1.2.0
   
   - Sửa lỗi X
   - Thêm tính năng Y
   - Cải thiện Z
   
   [OK]  [Hủy]
   ```
4. Click **OK** → Reload page
5. Kiểm tra tính năng mới hoạt động

---

## 📋 CHECKLIST CẬP NHẬT

- [ ] Sửa code trong VS Code
- [ ] Tăng `CURRENT_VERSION` trong `app.js`
- [ ] Tăng `CACHE_NAME` trong `sw.js`
- [ ] Commit & push lên GitHub (hoặc edit trên web)
- [ ] Đợi 1-2 phút GitHub Pages deploy
- [ ] Test: Mở app, kiểm tra code mới
- [ ] Sửa `version.json` với version, changelog, releaseDate
- [ ] Upload `version.json` lên Drive (replace file cũ)
- [ ] Test: User cũ mở app → Thấy popup update

---

## 🎨 VÍ DỤ CẬP NHẬT

**Tình huống:** Đổi màu nút "Đăng nhập" từ tím sang xanh

1. **Sửa code:**
   - Mở `drive_folder_to_pdf.html`
   - Tìm CSS của nút → Đổi `#8b5cf6` thành `#3b82f6`
   - Tăng version: `1.1.0` → `1.1.1`

2. **Push lên GitHub:**
   ```powershell
   git add .
   git commit -m "v1.1.1 - Đổi màu nút đăng nhập"
   git push
   ```

3. **Cập nhật version.json:**
   ```json
   {
     "version": "1.1.1",
     "changelog": "- Đổi màu nút đăng nhập sang xanh dương"
   }
   ```

4. **Upload lên Drive** → Done!

---

## 💡 SEMANTIC VERSIONING

- **1.0.0 → 1.0.1** = Patch (Bug fix nhỏ)
- **1.0.0 → 1.1.0** = Minor (Thêm tính năng, không breaking)
- **1.0.0 → 2.0.0** = Major (Thay đổi lớn, breaking changes)

---

## ⚠️ LƯU Ý QUAN TRỌNG

### ✅ KHÔNG cần cập nhật:
- OAuth redirect URIs (đã config)
- Google API credentials
- GitHub Pages settings

### ⚠️ CẦN cập nhật khi:
- Thay đổi code HTML/JS/CSS
- Thêm tính năng mới
- Sửa bug

### 🚀 Ưu điểm workflow này:
- ✅ User KHÔNG cần download ZIP thủ công
- ✅ Chỉ cần reload page là có version mới
- ✅ GitHub Pages tự động deploy
- ✅ Service Worker cache code mới
- ✅ Data không bị mất (lưu LocalStorage)

---

## 🔗 LINKS QUAN TRỌNG

- **App URL:** https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
- **GitHub Repo:** https://github.com/trungdzid3/nopbai
- **version.json Drive ID:** `1q7DggAUw1bLT6E4GHXPWgKklt0OUQtWV`

---

**🎉 Cập nhật nhanh, user không cần làm gì!**
