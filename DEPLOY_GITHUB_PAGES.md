# 🚀 HƯỚNG DẪN UPLOAD & DEPLOY GITHUB PAGES (Chi Tiết)

## BƯỚC 1: TẠO REPOSITORY

1. Mở trình duyệt, vào: **https://github.com/new**

2. Điền thông tin:
   - **Repository name:** `edusubmit-app` (hoặc tên bạn thích)
   - **Description:** (Tùy chọn) "Ứng dụng quản lý lớp học"
   - **Public** ← Chọn cái này (bắt buộc)
   - **KHÔNG TICK** "Add a README", "Add .gitignore", "Choose a license"

3. Click nút xanh **Create repository**

---

## BƯỚC 2: UPLOAD FILES

Sau khi tạo repo, bạn sẽ thấy màn hình trống.

1. **Tìm dòng chữ màu xanh:** "uploading an existing file"
   ```
   Quick setup — if you've done this kind of thing before
   
   ...create a new repository on the command line
   ...push an existing repository from the command line
   
   or create a new file  uploading an existing file  ← CLICK ĐÂY
   ```

2. Click vào **"uploading an existing file"**

3. **Màn hình upload hiện ra:**
   ```
   Drag files here to add them to your repository
   or choose your files
   ```

4. **Mở File Explorer** → Đến `c:\Users\Lenovo\Downloads\Nopbai\`

5. **Chọn 5 files:**
   - `drive_folder_to_pdf.html`
   - `app.js`
   - `manifest.json`
   - `sw.js`
   - `icon.png` (nếu có)

6. **Kéo files** vào khung "Drag files here"

7. Đợi upload xong (thanh xanh 100%)

8. **Xuống dưới** → Click nút xanh **Commit changes**

---

## BƯỚC 3: BẬT GITHUB PAGES

1. **Vào tab Settings** (góc trên bên phải repo)
   ```
   Code  Issues  Pull requests  Actions  Projects  [Settings] ← CLICK
   ```

2. **Sidebar bên trái** → Cuộn xuống → Click **Pages**
   ```
   General
   Access
   Collaborators
   ...
   Code and automation
     Pages  ← CLICK ĐÂY
   ```

3. **Tại mục "Build and deployment":**
   - **Source:** `Deploy from a branch`
   - **Branch:** Chọn `main`
   - **Folder:** Chọn `/ (root)`
   - Click **Save**

4. **Đợi 1-2 phút** → **Refresh page** (F5)

5. **Sẽ thấy box màu xanh:**
   ```
   ✅ Your site is live at https://username.github.io/edusubmit-app/
   ```

---

## BƯỚC 4: CẬP NHẬT OAUTH REDIRECT URI

1. Vào: **https://console.cloud.google.com/apis/credentials**

2. Click vào **OAuth 2.0 Client ID** đang dùng

3. **Authorized redirect URIs** → Click **+ ADD URI**

4. Thêm 2 URIs (thay `username` bằng username GitHub):
   ```
   https://username.github.io
   https://username.github.io/edusubmit-app/drive_folder_to_pdf.html
   ```

5. Click **SAVE**

---

## BƯỚC 5: TEST

**Mở link app:**
```
https://username.github.io/edusubmit-app/drive_folder_to_pdf.html
```

- ✅ Thấy giao diện webapp
- ✅ Đăng nhập Google hoạt động
- ✅ Chrome/Edge hiện icon ➕ "Install app"

---

## 📦 CẬP NHẬT SAU NÀY

**Khi có code mới:**

1. Vào repo → Click file cần sửa (vd: `app.js`)
2. Click icon ✏️ (Edit this file)
3. Sửa code
4. Xuống dưới → Click **Commit changes**
5. Đợi 1-2 phút → App tự động cập nhật

**Hoặc upload file mới:**

1. Vào repo → Click **Add file** → **Upload files**
2. Kéo file mới vào
3. Commit changes

---

## ⚠️ LƯU Ý

- ✅ Repo phải **Public** (Private cần GitHub Pro)
- ✅ File `icon.png` (512x512) cần có để PWA install hoạt động
- ✅ Nếu lỗi 404 → Đợi thêm 2-3 phút, clear cache browser
- ✅ Auto-update vẫn hoạt động (fetch `version.json` từ Drive)

---

**🎉 Xong! Giờ chỉ cần chia sẻ link cho user!**
