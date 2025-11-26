# 🔄 HƯỚNG DẪN DEPLOY GITHUB PAGES

## 🎯 SETUP LẦN ĐẦU (Sau khi xóa deployment cũ)

### Bước 1: Bật GitHub Pages

1. Vào repo: https://github.com/trungdzid3/nopbai
2. Click **Settings** (tab trên cùng)
3. Sidebar bên trái → Click **Pages**
4. Tại mục **Source:**
   - Chọn: `Deploy from a branch`
5. Tại mục **Branch:**
   - Branch: `main`
   - Folder: `/ (root)`
   - Click **Save**
6. Đợi 1-2 phút
7. Refresh page → Thấy thông báo xanh:
   ```
   ✅ Your site is live at https://trungdzid3.github.io/nopbai/
   ```

### Bước 2: Test App

**URL App:** https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html

- Mở link → Phải load được giao diện
- F12 → Console → Không có lỗi đỏ
- Test đăng nhập Google OAuth

---

## 📝 QUY TRÌNH CẬP NHẬT SAU NÀY

App đang chạy trên: **https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html**

Khi cập nhật code:
1. Sửa file local → Push lên GitHub
2. GitHub Pages tự động deploy (1-2 phút)
3. User mở app → Refresh là thấy code mới

---

## 🔧 CẬP NHẬT CODE

### Bước 1: Sửa code local

- Mở file cần sửa trong VS Code (vd: `app.js`, `drive_folder_to_pdf.html`)
- Sửa code theo yêu cầu
- Không cần tăng version number

### Bước 2: Push lên GitHub

```powershell
cd "c:\Users\Lenovo\Downloads\Nopbai"
git add -A
git commit -m "fix: Mô tả thay đổi"
git push origin main
```

### Cách B: Dùng GitHub Web

1. Vào repo: https://github.com/trungdzid3/nopbai
2. Click file cần sửa (vd: `app.js`)
3. Click icon ✏️ "Edit this file"
4. Paste code mới
5. Commit message: `fix: Mô tả thay đổi`
6. Click **Commit changes**
7. Lặp lại với từng file khác

---

## BƯỚC 3: ĐỢI GITHUB PAGES DEPLOY

- Đợi **1-2 phút** (GitHub Actions tự động build)
- Kiểm tra: Actions tab → Xem workflow "pages build and deployment"
- ✅ Xanh = Thành công
- ❌ Đỏ = Lỗi (kiểm tra logs)

---

## BƯỚC 4: TEST TRÊN USER

1. **Mở app:** https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
2. **Hard refresh:** `Ctrl + Shift + R` hoặc `Ctrl + F5`
3. **Kiểm tra:** F12 → Console → Xem có lỗi không
4. **Test tính năng mới**

**Lưu ý:** 
- Do có cache busting headers, user chỉ cần refresh bình thường
- Nếu vẫn thấy code cũ → Hard refresh (`Ctrl + F5`)

---

## 📋 CHECKLIST CẬP NHẬT

- [ ] Sửa code trong VS Code
- [ ] Test local (nếu có thể)
- [ ] Commit & push lên GitHub
- [ ] Đợi 1-2 phút GitHub Pages deploy
- [ ] Kiểm tra Actions tab (xanh = OK)
- [ ] Mở app, hard refresh (`Ctrl + F5`)
- [ ] Test tính năng mới hoạt động
- [ ] Thông báo user nếu cần

---

## 🎨 VÍ DỤ CẬP NHẬT

**Tình huống:** Đổi màu nút "Đồng bộ" từ đỏ sang cam

1. **Sửa code:**
   - Mở `drive_folder_to_pdf.html`
   - Tìm CSS của nút sync → Đổi màu
   - Không cần tăng version

2. **Push lên GitHub:**
   ```powershell
   git add -A
   git commit -m "fix: Đổi màu nút đồng bộ sang cam"
   git push origin main
   ```

3. **Đợi deploy:**
   - Vào https://github.com/trungdzid3/nopbai/actions
   - Đợi workflow "pages build and deployment" xanh

4. **Test:**
   - Mở app
   - `Ctrl + F5` để hard refresh
   - Thấy nút cam → OK!

---

## ⚠️ KHẮC PHỤC SỰ CỐ

### ❌ User vẫn thấy code cũ sau khi deploy

**Nguyên nhân:** Browser cache quá mạnh

**Giải pháp:**
1. Hướng dẫn user: `Ctrl + Shift + R` (Chrome) hoặc `Ctrl + F5`
2. Hoặc: Clear browser cache
3. Hoặc: Mở Incognito/Private mode

### ❌ GitHub Actions báo đỏ

**Nguyên nhân:** Lỗi syntax HTML/JS hoặc file quá lớn

**Giải pháp:**
1. Click vào workflow bị lỗi → Xem logs
2. Sửa lỗi theo logs
3. Commit lại

### ❌ App không load được

**Nguyên nhân:** GitHub Pages bị tắt hoặc repo private

**Giải pháp:**
1. Repo Settings → Pages
2. Kiểm tra:
   - Source: `Deploy from a branch`
   - Branch: `main` / `root`
   - Status: ✅ "Your site is live at..."

---

## 💡 CACHE BUSTING ĐÃ CÀI

File `drive_folder_to_pdf.html` đã có:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

→ User chỉ cần refresh bình thường (không bắt buộc hard refresh)

---

## 🚀 ƯU ĐIỂM WORKFLOW NÀY

- ✅ Deploy tự động qua GitHub Actions
- ✅ Không cần quản lý version number thủ công
- ✅ User chỉ cần refresh page
- ✅ Miễn phí hoàn toàn (GitHub Pages)
- ✅ HTTPS mặc định
- ✅ CDN toàn cầu (nhanh)
- ✅ Có cache busting headers

---

## 🔗 LINKS QUAN TRỌNG

- **App URL:** https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
- **GitHub Repo:** https://github.com/trungdzid3/nopbai
- **GitHub Actions:** https://github.com/trungdzid3/nopbai/actions
- **Repo Settings:** https://github.com/trungdzid3/nopbai/settings/pages

---

## 📱 COMMIT MESSAGE CONVENTION

```
fix: Sửa lỗi hiển thị
feat: Thêm tính năng mới
style: Đổi màu sắc UI
refactor: Tối ưu code
docs: Cập nhật tài liệu
```

---

**🎉 Deploy nhanh, user tự động cập nhật!**
