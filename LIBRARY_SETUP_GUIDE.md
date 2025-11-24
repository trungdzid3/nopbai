# 📚 HƯỚNG DẪN SETUP LIBRARY CHO HỆ THỐNG QUẢN LÝ LỚP HỌC

## 🎯 Tổng quan

Hệ thống sử dụng **Library Architecture** để quản lý tập trung:
- ✅ Cập nhật 1 lần → Tất cả lớp tự động dùng code mới
- ✅ Không cần sửa từng Form/Sheet riêng lẻ
- ✅ Version control rõ ràng
- ✅ Dễ rollback khi có lỗi

---

## 📂 Cấu trúc Files

```
LibraryFormScript.txt       → Library chính cho Form automation
LibrarySheetScript.txt      → Library chính cho Sheet automation
WrapperFormScript.txt       → Script mỏng trong Form template (gọi library)
WrapperSheetScript.txt      → Script mỏng trong Sheet template (gọi library)
```

---

## 🚀 PHẦN 1: SETUP LIBRARIES (1 LẦN DUY NHẤT)

### Step 1.1: Tạo Form Library

1. Vào [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Đặt tên: `FormLib - Automation System`
4. Delete code mặc định, paste toàn bộ nội dung từ `LibraryFormScript.txt`
5. **File → Save** (Ctrl+S)
6. **Deploy → New deployment**
   - Chọn type: **Library**
   - Description: `Initial version`
   - Click **Deploy**
7. **SAO CHÉP Script ID** (dạng: `1a2b3c4d5e6f7g8h9i0j...`)
8. **SAO CHÉP Deployment ID** (tùy chọn, để tracking version)

> ⚠️ **LƯU Ý:** Script ID này sẽ dùng cho tất cả các Form!

### Step 1.2: Tạo Sheet Library

1. Vào [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Đặt tên: `SheetLib - Automation System`
4. Delete code mặc định, paste toàn bộ nội dung từ `LibrarySheetScript.txt`
5. **File → Save** (Ctrl+S)
6. **Deploy → New deployment**
   - Chọn type: **Library**
   - Description: `Initial version`
   - Click **Deploy**
7. **SAO CHÉP Script ID** (dạng: `9z8y7x6w5v4u3t2s1r0q...`)

> ⚠️ **LƯU Ý:** Script ID này sẽ dùng cho tất cả các Sheet!

---

## 🔧 PHẦN 2: SETUP FORM TEMPLATE

### Step 2.1: Mở Form Template Script

1. Mở Google Form mẫu (template Form)
2. Click **⋮** (góc trên phải) → **Script editor**
3. Delete code hiện tại, paste toàn bộ nội dung từ `WrapperFormScript.txt`
4. **File → Save** (Ctrl+S)

### Step 2.2: Add Form Library

1. Trong Script Editor, click **Editor** (sidebar trái)
2. Click **Libraries +** (icon sách bên cạnh Services)
3. Paste **Script ID của FormLib** (từ Step 1.1) vào ô
4. Click **Look up**
5. Chọn **Version: Latest** (hoặc version cụ thể)
6. **QUAN TRỌNG:** Identifier phải là: `FormLib` (đúng như trong code)
7. Click **Add**

### Step 2.3: Link Form với Sheet (QUAN TRỌNG!)

1. Mở Form template trong browser
2. Click tab **Responses** (Câu trả lời)
3. Click icon **Google Sheets** (màu xanh lá)
4. Chọn **Select existing spreadsheet**
5. Chọn Sheet template đã tạo → Click **Select**
6. Form sẽ tạo tab mới tên "Form Responses 1" trong Sheet

> ⚠️ **BẮT BUỘC:** Form phải link với Sheet thì script mới đọc được email!

### Step 2.4: Set Script Properties (TÙY CHỌN)

**Webapp tự động ghi email người tạo lớp vào Sheet Config.**  
Nếu muốn dùng email khác:

1. **Project Settings** (icon bánh răng bên trái)
2. Scroll xuống **Script Properties**
3. Click **Add script property**
   - Property: `RECIPIENT_EMAIL`
   - Value: `email-khac@example.com`
4. Click **Save script properties**

### Step 2.5: Setup Triggers

1. Trong Script Editor, chọn function: `setupTriggers` (dropdown)
2. Click **Run** (▶️)
3. **Authorization required** → Click **Review permissions**
4. Chọn tài khoản Google → **Allow**
5. Kiểm tra Log: Phải thấy "✅ Đã cài đặt triggers cơ bản"

### Step 2.6: Setup Scheduled Cleanup (sau khi có Config)

1. Đảm bảo Sheet đã có sheet "Cấu Hình" với dữ liệu
2. Chọn function: `setupScheduledCleanup`
3. Click **Run** (▶️)
4. Kiểm tra Log: Phải thấy "✅ Đã tạo X cleanup triggers"

> ✅ **XONG!** Form template giờ đã sẵn sàng để webapp copy!

---

## 📊 PHẦN 3: SETUP SHEET TEMPLATE

### Step 3.1: Mở Sheet Template Script

1. Mở Google Sheet mẫu (template Sheet)
2. **Tools → Script editor** (hoặc Extensions → Apps Script)
3. Delete code hiện tại, paste toàn bộ nội dung từ `WrapperSheetScript.txt`
4. **File → Save** (Ctrl+S)

### Step 3.2: Add Sheet Library

1. Trong Script Editor, click **Editor** (sidebar trái)
2. Click **Libraries +** (icon sách bên cạnh Services)
3. Paste **Script ID của SheetLib** (từ Step 1.2) vào ô
4. Click **Look up**
5. Chọn **Version: Latest** (hoặc version cụ thể)
6. **QUAN TRỌNG:** Identifier phải là: `SheetLib` (đúng như trong code)
7. Click **Add**

### Step 3.3: Reload Sheet

1. Quay lại Sheet (tab Google Sheet)
2. **Refresh page** (F5 hoặc Ctrl+R)
3. Đợi vài giây → Menu "**Tiện ích Lớp Học**" sẽ xuất hiện

### Step 3.4: Setup Triggers

1. Trong Sheet, click menu "**Tiện ích Lớp Học**"
2. Chọn "**⚙️ Cài đặt Toàn bộ Lịch trình**"
3. Nếu yêu cầu permission → Click **Continue** → **Allow**
4. Sẽ thấy popup "Thành công!" với danh sách triggers

> ✅ **XONG!** Sheet template giờ đã sẵn sàng để webapp copy!

---

## 🔄 PHẦN 4: CẬP NHẬT LIBRARY (KHI SỬA CODE)

### Khi cần fix bug hoặc thêm feature:

#### Cập nhật Form Library:

1. Mở project `FormLib - Automation System` trên [script.google.com](https://script.google.com)
2. Sửa code trong `LibraryFormScript.txt`
3. Copy code đã sửa vào Script Editor
4. **File → Save** (Ctrl+S)
5. **Deploy → Manage deployments**
6. Click **Edit** (icon bút chì) ở deployment hiện tại
7. Chọn **New version**
8. Description: Mô tả thay đổi (VD: "Fix Levenshtein threshold bug")
9. Click **Deploy**

> 🎉 **TẤT CẢ FORM TỰ ĐỘNG DÙNG CODE MỚI!**

#### Cập nhật Sheet Library:

1. Mở project `SheetLib - Automation System` trên [script.google.com](https://script.google.com)
2. Sửa code trong `LibrarySheetScript.txt`
3. Copy code đã sửa vào Script Editor
4. **File → Save** (Ctrl+S)
5. **Deploy → Manage deployments**
6. Click **Edit** (icon bút chì) ở deployment hiện tại
7. Chọn **New version**
8. Description: Mô tả thay đổi
9. Click **Deploy**

> 🎉 **TẤT CẢ SHEET TỰ ĐỘNG DÙNG CODE MỚI!**

---

## 🧪 PHẦN 5: TESTING & VALIDATION

### Test Form Automation:

1. Mở Form template
2. Gửi 1 test submission với file đính kèm
3. Kiểm tra:
   - ✅ File được upload vào Drive folder
   - ✅ Checkbox được đánh dấu trong Sheet
   - ✅ Email thông báo được gửi (nếu có lỗi)
   - ✅ Log không có error (Tools → Script editor → Execution log)

### Test Sheet Automation:

1. Mở Sheet template
2. Edit cell ở cột C (điểm số) → Nhập `4.5` → Phải tự động thành "Chưa đạt"
3. Edit cell ở cột D/E → Nhập `test` → Phải tự động thành `- Test.`
4. Edit cell ở cột F (ghi chú) → Nhập `Không nộp` → Hàng phải đổi màu cam
5. Menu "Tiện ích Lớp Học" → "📊 Xem cấu hình hiện tại" → Phải hiển thị config

### Test Wrapper Scripts:

1. Mở Script Editor của Form/Sheet bất kỳ
2. Chạy function `showCurrentConfig` (hoặc `testConfigLoading` cho Sheet)
3. Kiểm tra Log → Phải thấy config được load thành công

---

## 📋 PHẦN 6: MIGRATION CHO CÁC LỚP ĐÃ TỒN TẠI

### Nếu đã có lớp 10A1, 10A2... dùng code cũ:

#### Option 1: Manual Migration (Recommended - Chắc chắn)

Cho mỗi Form hiện tại:
1. Mở Form → Script editor
2. Delete toàn bộ code cũ
3. Paste nội dung từ `WrapperFormScript.txt`
4. Add library FormLib (Step 2.2)
5. Set RECIPIENT_EMAIL (Step 2.3)
6. Run `setupTriggers()` và `setupScheduledCleanup()`

Cho mỗi Sheet hiện tại:
1. Mở Sheet → Script editor
2. Delete toàn bộ code cũ
3. Paste nội dung từ `WrapperSheetScript.txt`
4. Add library SheetLib (Step 3.2)
5. Reload Sheet → Chạy "Cài đặt Toàn bộ Lịch trình"

#### Option 2: Gradual Migration (Dần dần)

- Để các lớp cũ chạy code cũ (standalone)
- Từ giờ, lớp mới dùng library
- Khi có thời gian, migrate từng lớp

---

## ⚠️ TROUBLESHOOTING

### ❌ "FormLib is not defined" hoặc "SheetLib is not defined"

**Nguyên nhân:** Library chưa được add hoặc Identifier sai

**Giải pháp:**
1. Kiểm tra Libraries trong Script Editor
2. Đảm bảo Identifier chính xác: `FormLib` hoặc `SheetLib`
3. Đảm bảo đã chọn version (không để `None`)
4. Save và reload trang

### ❌ "RECIPIENT_EMAIL chưa được cài đặt" hoặc không nhận email

**Nguyên nhân:** Email chưa được cấu hình hoặc Form chưa link với Sheet

**Giải pháp:**

**Cách 1: Tự động (Khuyến nghị)**
1. Đảm bảo webapp đã đăng nhập (email hiện ở góc trên)
2. Tạo lớp mới → Webapp tự động ghi email vào Sheet Config cell B6
3. Mở Form → Responses tab → Link với Sheet (nếu chưa link)
4. Test: Submit form → Kiểm tra Log có dòng "✅ Đã lấy email từ Sheet Config"

**Cách 2: Thủ công (Nếu cần email khác)**
1. Mở Sheet → Sheet "Cấu Hình" → Cell B6
2. Nhập email người nhận: `user@example.com`
3. Hoặc: Form Script Editor → Project Settings → Script Properties
4. Add: `RECIPIENT_EMAIL` = `email@example.com`

**Kiểm tra Form đã link Sheet chưa:**
1. Mở Form trong browser
2. Tab **Responses** → Phải thấy "View responses in Sheets"
3. Nếu chưa: Click icon Sheets → Select existing spreadsheet → Chọn Sheet của lớp

### ❌ Form script không đọc được email từ Sheet

**Nguyên nhân:** Form chưa được link với Sheet

**Giải pháp:**
1. Mở Form (tab Responses)
2. Click icon **Google Sheets** (màu xanh lá)
3. Chọn **Select existing spreadsheet**
4. Chọn đúng Sheet của lớp → Click **Select**
5. Test: Run function `getEmailFromSheetConfig` trong Script Editor
6. Kiểm tra Log: Phải thấy "✅ Đã lấy email từ Sheet Config: xxx@gmail.com"

### ❌ Triggers không chạy

**Nguyên nhân:** Triggers chưa được tạo hoặc bị lỗi permission

**Giải pháp:**
1. Script Editor → Triggers (icon đồng hồ)
2. Kiểm tra danh sách triggers
3. Nếu không có → Chạy lại `setupTriggers()` (Form) hoặc menu setup (Sheet)
4. Kiểm tra Execution log (View → Executions) xem có lỗi không

### ❌ Menu "Tiện ích Lớp Học" không xuất hiện

**Nguyên nhân:** Sheet chưa reload sau khi add library

**Giải pháp:**
1. Refresh trang Sheet (F5)
2. Đợi 5-10 giây
3. Nếu vẫn không có → Kiểm tra library đã add đúng chưa
4. Kiểm tra function `onOpen()` có trong wrapper script không

### ❌ Config sheet không đọc được

**Nguyên nhân:** Sheet "Cấu Hình" không tồn tại hoặc format sai

**Giải pháp:**
1. Kiểm tra tên sheet: Phải chính xác là "**Cấu Hình**" (có dấu)
2. Kiểm tra cột:
   - A: Tên bài tập
   - B: Lịch học (format: T2-18:00)
   - C: Thời gian mở (format: T2-06:00)
   - D: Deadline (format: T3-23:00)
   - E: Checkbox tự động dọn
   - F: Tên sheet tương ứng
3. Phải có ít nhất 1 dòng dữ liệu (dòng 2 trở đi)

---

## 🎓 BEST PRACTICES

### ✅ Version Control cho Libraries

- Mỗi lần deploy library, ghi rõ description
- VD: "v1.0: Initial release"
- VD: "v1.1: Fix email correction link bug"
- VD: "v2.0: Add multi-schedule support"

### ✅ Testing trước khi Deploy

- Test code trong 1 Form/Sheet riêng trước
- Đảm bảo không có lỗi trong Execution log
- Deploy library version mới
- Test lại trong 1-2 lớp thử nghiệm
- Nếu OK → Rollout cho tất cả lớp

### ✅ Backup trước khi Migration

- Copy toàn bộ code cũ ra file .txt
- Lưu lại Config sheet hiện tại (export ra CSV)
- Screenshot danh sách triggers cũ
- Chỉ migrate 1 lớp test trước, không migrate hết ngay

### ✅ Monitoring

- Định kỳ kiểm tra Execution log (1 tuần 1 lần)
- Setup email notification cho execution failures:
  - Script Editor → Project Settings → Notifications
  - Enable "Notify me when this script has failures"
- Kiểm tra quota usage: [Apps Script Dashboard](https://script.google.com/home/executions)

---

## 📊 APPENDIX: CẤU TRÚC SHEET "CẤU HÌNH"

### Cấu trúc chính:

| Cell | Nội dung | Ví dụ | Mục đích |
|------|----------|-------|----------|
| B1 | Label | `Tên lớp:` | Header |
| B2 | Label | `Folder ID:` | Header |
| B3 | Tên lớp | `10A1` | Tự động điền bởi webapp |
| B4 | Folder ID | `1a2b3c...` | Tự động điền bởi webapp |
| B5 | Form ID | `1x2y3z...` | Tự động điền bởi webapp |
| **B6** | **Email người quản lý** | **`user@gmail.com`** | **Tự động điền bởi webapp** |

### Bảng config bài tập (từ A2 trở đi):

| Cột | Tên cột | Format | Ví dụ | Ghi chú |
|-----|---------|--------|-------|---------|
| A | Tên bài tập | Text | `Đại số` | Tên duy nhất |
| B | Lịch học | T{1-7}-HH:MM | `T2-18:00;T6-09:00` | Nhiều lịch cách nhau bằng `;` hoặc `,` |
| C | Thời gian mở | T{1-7}-HH:MM | `T2-06:00` | Form mở nhận bài |
| D | Deadline | T{1-7}-HH:MM | `T3-23:00` | Hết hạn nộp |
| E | Tự động dọn | Checkbox | ☑ hoặc ☐ | Dọn trước giờ học |
| F | Tên Sheet | Text | `Đại số` | Sheet tương ứng trong workbook |

**Dòng đặc biệt:**
- Dòng đầu tiên (thường là "Điểm danh"): Cleanup-only, không có Form integration

**Email thông báo:**
- Webapp tự động ghi email người tạo lớp vào **B6**
- Form script đọc email từ đây để gửi thông báo lỗi
- Có thể sửa thủ công nếu muốn đổi người nhận

**Time Format:**
- `CN` = Chủ Nhật (Sunday)
- `T2` = Thứ Hai (Monday)
- `T3` = Thứ Ba (Tuesday)
- `T4` = Thứ Tư (Wednesday)
- `T5` = Thứ Năm (Thursday)
- `T6` = Thứ Sáu (Friday)
- `T7` = Thứ Bảy (Saturday)

---

## 🔗 USEFUL LINKS

- [Google Apps Script Library Guide](https://developers.google.com/apps-script/guides/libraries)
- [Apps Script Dashboard](https://script.google.com/home)
- [Apps Script Quotas & Limits](https://developers.google.com/apps-script/guides/services/quotas)
- [Form Service Documentation](https://developers.google.com/apps-script/reference/forms)
- [Spreadsheet Service Documentation](https://developers.google.com/apps-script/reference/spreadsheet)

---

## 📞 SUPPORT

Nếu gặp vấn đề không giải quyết được:

1. Kiểm tra Execution log: Script Editor → View → Executions
2. Kiểm tra Log output: Script Editor → View → Logs (Ctrl+Enter sau khi run function)
3. Kiểm tra lại từng bước trong hướng dẫn
4. Tham khảo section Troubleshooting ở trên
5. Kiểm tra code comments trong các file library/wrapper

---

**📝 LƯU Ý CUỐI CÙNG:**

- Library là **immutable per version** → Cần deploy version mới để thay đổi
- Wrapper scripts trong Form/Sheet **không cần sửa** sau khi setup
- Config sheet là nơi duy nhất user cần thao tác thường xuyên
- Tất cả logic nằm trong libraries → Easy to maintain!

✨ **CHÚC BẠN SETUP THÀNH CÔNG!** ✨
