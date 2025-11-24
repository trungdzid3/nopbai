# 🚀 HƯỚNG DẪN NHANH - MULTI-USER SUPPORT

## 📧 Email tự động theo người dùng

Webapp đã được cập nhật để **tự động lấy email người đăng nhập** thay vì dùng email cố định!

### ✨ Cách hoạt động:

1. **Đăng nhập webapp** → Hệ thống lưu email của bạn
2. **Tạo lớp mới** → Email tự động ghi vào Sheet Config (cell B6)
3. **Form submit** → Thông báo lỗi gửi về email đã lưu

---

## 🔧 SETUP MỚI (Cho người dùng mới)

### Bước 1: Tạo 2 Libraries (1 lần duy nhất)

1. Vào https://script.google.com
2. Tạo project mới: `FormLib - Automation System`
3. Paste code từ **LibraryFormScript.txt**
4. **Deploy → Library** → Copy Script ID
5. Lặp lại cho `SheetLib - Automation System` với **LibrarySheetScript.txt**

### Bước 2: Setup Form Template

1. Mở Form mẫu → Script editor
2. Paste code từ **WrapperFormScript.txt**
3. Add library FormLib (paste Script ID)
4. **QUAN TRỌNG:** Form → Responses → Link với Sheet mẫu
5. Chạy function `setupTriggers`

### Bước 3: Setup Sheet Template

1. Mở Sheet mẫu → Script editor
2. Paste code từ **WrapperSheetScript.txt**
3. Add library SheetLib (paste Script ID)
4. Reload Sheet → Menu "Tiện ích Lớp Học" → "Cài đặt Lịch trình"

### Bước 4: Thử nghiệm

1. Đăng nhập webapp
2. Tạo lớp test → Check cell B6 có email không
3. Submit form test → Check log có lấy email thành công không

---

## 👥 SỬ DỤNG CHUNG (Nhiều người)

### Kịch bản: Bạn và bạn bè cùng dùng webapp

**User A tạo lớp 10A1:**
- Đăng nhập: `userA@gmail.com`
- Tạo lớp → Email lưu vào Sheet Config
- Lỗi form → Email gửi tới `userA@gmail.com`

**User B tạo lớp 10A2:**
- Đăng nhập: `userB@gmail.com`
- Tạo lớp → Email lưu vào Sheet Config
- Lỗi form → Email gửi tới `userB@gmail.com`

**Kết quả:** Mỗi người chỉ nhận email của lớp mình quản lý! 🎉

---

## 🔄 CHUYỂN ĐỔI EMAIL (Nếu cần)

### Cách 1: Sửa trực tiếp trong Sheet
1. Mở Sheet của lớp
2. Sheet "Cấu Hình" → Cell B6
3. Sửa thành email mới

### Cách 2: Override bằng Script Properties
1. Form Script Editor
2. Project Settings → Script Properties
3. Add: `RECIPIENT_EMAIL` = `email-moi@gmail.com`

---

## ⚠️ LƯU Ý QUAN TRỌNG

### ✅ Form PHẢI link với Sheet:
- Form → Tab **Responses**
- Click icon **Sheets** → **Select existing spreadsheet**
- Nếu không link → Script không đọc được email!

### ✅ Webapp phải đăng nhập:
- Góc trên webapp phải hiện email
- Nếu không → Click "Đăng nhập Google"

### ✅ Template đã setup library:
- Form template đã add FormLib
- Sheet template đã add SheetLib
- Khi webapp copy → Library theo luôn

---

## 🧪 KIỂM TRA EMAIL HOẠT ĐỘNG

### Test 1: Check email đã ghi vào Sheet
1. Tạo lớp mới từ webapp
2. Mở Sheet → "Cấu Hình" → Cell B6
3. **Mong đợi:** Email của bạn hiện ở đó

### Test 2: Form script đọc được email
1. Mở Form → Script editor
2. Chạy function: `getEmailFromSheetConfig`
3. View → Logs (Ctrl+Enter)
4. **Mong đợi:** "✅ Đã lấy email từ Sheet Config: xxx@gmail.com"

### Test 3: Submit form thử
1. Submit form với file lỗi (hoặc sai định dạng)
2. Check email (có thể vào Spam)
3. **Mong đợi:** Nhận email thông báo lỗi

---

## 🐛 TROUBLESHOOTING NHANH

**❌ "RECIPIENT_EMAIL chưa được cài đặt"**
→ Form chưa link với Sheet. Vào Form → Responses → Link Sheet

**❌ "Không tìm thấy sheet Cấu Hình"**
→ Sheet bị đổi tên hoặc xóa. Check lại tên sheet

**❌ "Cell B6 không chứa email hợp lệ"**
→ Webapp chưa ghi được. Ghi thủ công vào B6

**❌ Không nhận email**
→ Check Spam, check email trong B6 đúng chưa

---

## 📚 TÀI LIỆU CHI TIẾT

Xem **LIBRARY_SETUP_GUIDE.md** để biết:
- Hướng dẫn đầy đủ từng bước
- Troubleshooting chi tiết
- Best practices
- Cấu trúc Config sheet

---

## 💡 MẸO HAY

### Cùng dùng webapp nhưng khác quyền:
- Mỗi người đăng nhập bằng tài khoản riêng
- Tạo lớp → Email tự động theo người tạo
- Không sợ nhầm lẫn thông báo

### Chia sẻ quyền quản lý:
- Muốn 2 người cùng nhận email của 1 lớp?
- Mở Sheet → Cell B6
- Ghi: `email1@gmail.com, email2@gmail.com`
- (Cần sửa code Form script để split multiple emails)

### Backup email cũ:
- Trước khi migrate, export danh sách lớp
- Lưu lại mapping: Lớp nào → Email nào
- Có thể restore bằng cách ghi lại vào B6

---

**🎉 CHÚC BẠN VÀ BẠN BÈ SỬ DỤNG VUI VẺ!**

*Có thắc mắc? Tham khảo LIBRARY_SETUP_GUIDE.md hoặc check Execution log trong Script Editor.*
