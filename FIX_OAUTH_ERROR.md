# 🔧 SỬA LỖI: redirect_uri_mismatch

## Nguyên nhân
Google OAuth không nhận diện URL `https://trungdzid3.github.io/nopbai/` vì chưa được thêm vào danh sách redirect URIs.

## CÁCH SỬA (5 phút)

### Bước 1: Vào Google Cloud Console
1. Mở: **https://console.cloud.google.com/apis/credentials**
2. Đăng nhập bằng `trungdzid3@gmail.com`

### Bước 2: Tìm OAuth 2.0 Client ID
1. Trong mục **OAuth 2.0 Client IDs**, tìm client đang dùng
2. Click vào tên client (vd: "Web client 1" hoặc "Drive PDF App")

### Bước 3: Thêm Redirect URIs
1. Tìm phần **Authorized redirect URIs**
2. Click **+ ADD URI**
3. Thêm **4 URIs sau** (copy từng dòng):

```
https://trungdzid3.github.io
```

```
https://trungdzid3.github.io/nopbai
```

```
https://trungdzid3.github.io/nopbai/
```

```
https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
```

4. Click **SAVE** (nút xanh ở dưới)

### Bước 4: Đợi 1-2 phút
Google cần thời gian cập nhật cấu hình.

### Bước 5: Test lại
1. Mở **https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html**
2. **Refresh page** (Ctrl+Shift+R để hard refresh)
3. Click **Đăng nhập**
4. Sẽ thấy màn hình chọn tài khoản Google thay vì lỗi

---

## ✅ Checklist

- [ ] Vào https://console.cloud.google.com/apis/credentials
- [ ] Click vào OAuth 2.0 Client ID
- [ ] Thêm 4 redirect URIs (bao gồm cả có/không có `/` cuối)
- [ ] Click SAVE
- [ ] Đợi 1-2 phút
- [ ] Hard refresh app (Ctrl+Shift+R)
- [ ] Thử đăng nhập lại

---

## 💡 Lưu ý

- ✅ Phải thêm **đầy đủ 4 URIs** (Google kiểm tra chính xác)
- ✅ Có thể thêm cả `http://localhost:8000` nếu test local
- ✅ Không cần thay đổi code, chỉ config trên Google Console

---

**🎯 Sau khi sửa xong, app sẽ đăng nhập bình thường!**
