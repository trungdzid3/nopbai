# DEBUG OAUTH REDIRECT URI

## Bước 1: Kiểm tra URI thực tế

1. Mở app: https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
2. F12 → Console
3. Chạy lệnh:
```javascript
console.log('Origin:', window.location.origin);
console.log('Full URL:', window.location.href);
```
4. Copy kết quả cho tôi

## Bước 2: Xem lỗi chi tiết

Khi click "xem thông tin chi tiết về lỗi" trên màn hình Google, sẽ thấy:
```
redirect_uri mismatch
Request details:
redirect_uri=XXXXX  ← Copy cái này
```

## Bước 3: Config Google Console

Vào: https://console.cloud.google.com/apis/credentials

### Authorized JavaScript origins:
```
https://trungdzid3.github.io
```

### Authorized redirect URIs:
```
https://trungdzid3.github.io
https://trungdzid3.github.io/nopbai
https://trungdzid3.github.io/nopbai/
https://trungdzid3.github.io/nopbai/drive_folder_to_pdf.html
storagerelay://https/trungdzid3.github.io
storagerelay://https/trungdzid3.github.io/nopbai
```

(storagerelay là protocol đặc biệt của Google Identity Services)

## Bước 4: Screenshot

Nếu vẫn lỗi, chụp màn hình:
1. Trang lỗi Google (có dòng redirect_uri=...)
2. Google Console → OAuth Client → Authorized URIs

---

Gửi cho tôi kết quả console.log để tôi biết chính xác URI nào cần thêm!
