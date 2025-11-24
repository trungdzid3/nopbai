# 📊 MINH HỌA SHEET "CẤU HÌNH"

## 🎯 Cấu trúc hoàn chỉnh

### Layout tổng quát:

```
      A          B          C          D          E          F       [G]      H              I
┌───────────┬──────────┬──────────┬──────────┬──────────┬──────────┬────┬──────────────┬──────────────┐
│Tên bài tập│ Lịch học │Thời gian │ Deadline │Tự động   │Tên Sheet │    │ Tên lớp:     │               │
│           │          │   mở     │          │  dọn     │          │    │ Folder ID:   │               │
│Điểm danh  │T2-18:00  │          │          │    ☑     │Điểm danh │    │              │ 10A1          │
│Đại số     │T2-18:00  │T2-06:00  │T3-23:00  │    ☑     │Bảng (ĐS) │    │              │ 1a2b3c4d...   │
│Hình học   │T6-09:00  │T6-06:00  │T7-23:00  │    ☐     │Bảng (HH) │    │              │ 1x2y3z4w...   │
│           │          │          │          │          │          │    │              │user@gmail.com│
└───────────┴──────────┴──────────┴──────────┴──────────┴──────────┴────┴──────────────┴──────────────┘
   ↑                                                                          ↑              ↑
 Cột A-F: Bảng config bài tập                                        Cột H: Label   Cột I: Dữ liệu
```

### Phần 1: Bảng config bài tập (Cột A-F)

**Vị trí:** Từ cell A1

**Dòng 1 - Header:**
- **A1:** Tên bài tập
- **B1:** Lịch học  
- **C1:** Thời gian mở
- **D1:** Deadline
- **E1:** Tự động dọn
- **F1:** Tên Sheet

**Từ dòng 2 trở đi:** Dữ liệu các bài tập

### Phần 2: Thông tin lớp (Cột H-I)

**Vị trí:** Từ cell H1

**Cột H (Label):**
- **H1:** Tên lớp:
- **H2:** Folder ID:
- **H3:** (empty)
- **H4:** (empty)
- **H5:** (empty)
- **H6:** (empty)

**Cột I (Dữ liệu - Webapp tự điền):**
- **I1:** (empty) ← Webapp sẽ ghi tên lớp (ví dụ: 10A1)
- **I2:** (empty) ← Không dùng
- **I3:** (empty) ← Webapp ghi Folder ID (ví dụ: 1a2b3c4d5e6f...)
- **I4:** (empty) ← Webapp ghi Sheet ID (ví dụ: 1x2y3z4w5v6u...)
- **I5:** (empty) ← Webapp ghi Form ID (ví dụ: 1p9o8i7u6y5t...)
- **I6:** (empty) ← Webapp ghi Email quản lý (ví dụ: user@gmail.com)

---

### Chi tiết bảng config

```
┌──────────────────┬─────────────────┬────────────────┬────────────────┬──────────────┬─────────────────────────┐
│ A: Tên bài tập   │ B: Lịch học     │ C: Thời gian mở│ D: Deadline    │ E: Tự động dọn│ F: Tên Sheet           │
├──────────────────┼─────────────────┼────────────────┼────────────────┼──────────────┼─────────────────────────┤
│ Điểm danh        │ T2-18:00;T6-09:00│                │                │      ☑       │ Điểm danh               │
│ Đại số           │ T2-18:00        │ T2-06:00       │ T3-23:00       │      ☑       │ Bảng nhận xét (Đại số) │
│ Hình học         │ T6-09:00        │ T6-06:00       │ T7-23:00       │      ☐       │ Bảng nhận xét (Hình học)│
│ Vật lý           │ T3-14:00;T5-14:00│ T3-06:00       │ T5-23:00       │      ☑       │ Bảng nhận xét (Vật lý) │
│ Hóa học          │ T4-10:00        │ T4-06:00       │ T4-23:00       │      ☐       │ Bảng nhận xét (Hóa học)│
└──────────────────┴─────────────────┴────────────────┴────────────────┴──────────────┴─────────────────────────┘
```

---

## 📝 CHI TIẾT TỪNG CỘT

### Cột A: Tên bài tập
- **Kiểu:** Text
- **Ví dụ:** `Đại số`, `Hình học`, `Vật lý`
- **Lưu ý:** 
  - Phải duy nhất (không trùng lặp)
  - Dòng đầu tiên thường là "Điểm danh" (đặc biệt)

### Cột B: Lịch học
- **Kiểu:** Text
- **Format:** `T{1-7}-HH:MM`
- **Ví dụ:**
  ```
  T2-18:00           ← Thứ 2, 18:00
  T6-09:00           ← Thứ 6, 09:00
  T2-18:00;T6-09:00  ← Nhiều lịch (cách nhau bằng ; hoặc ,)
  ```
- **Mapping ngày:**
  - `CN` = Chủ Nhật (Sunday)
  - `T2` = Thứ Hai (Monday)
  - `T3` = Thứ Ba (Tuesday)
  - `T4` = Thứ Tư (Wednesday)
  - `T5` = Thứ Năm (Thursday)
  - `T6` = Thứ Sáu (Friday)
  - `T7` = Thứ Bảy (Saturday)

### Cột C: Thời gian mở
- **Kiểu:** Text
- **Format:** `T{1-7}-HH:MM`
- **Ví dụ:** `T2-06:00` (Form mở nhận bài vào 6h sáng Thứ 2)
- **Mục đích:** Form tự động mở để nhận bài nộp

### Cột D: Deadline
- **Kiểu:** Text
- **Format:** `T{1-7}-HH:MM`
- **Ví dụ:** `T3-23:00` (Hết hạn 11h đêm Thứ 3)
- **Mục đích:** 
  - Sau deadline, điền "Chưa nộp" vào Sheet
  - Cảnh báo nộp muộn

### Cột E: Tự động dọn
- **Kiểu:** Checkbox ☑ hoặc ☐
- **Ví dụ:** 
  - ☑ = Bật (TRUE)
  - ☐ = Tắt (FALSE)
- **Mục đích:** Bật/tắt tính năng tự động dọn dẹp trước giờ học (30-60 phút)

### Cột F: Tên Sheet
- **Kiểu:** Text
- **Ví dụ:** `Bảng nhận xét (Đại số)`, `Điểm danh`
- **Mục đích:** Tên tab trong workbook để ghi nhận xét

---

## ⚙️ TÙY CHỌN TỰ ĐỘNG DỌN DẸP

**Cấu hình qua Menu:** Extensions → Apps Script → SheetLib → showCleanupDialog()

Hoặc thêm vào menu custom:
```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Quản lý')
    .addItem('🧹 Cấu hình tự động dọn dẹp', 'SheetLib.showCleanupDialog')
    .addToUi();
}
```

**Dialog có 3 tùy chọn:**
1. **Xóa Email thông báo** → Cột B (email báo lỗi)
2. **Xóa Điểm số** → Cột C (câu trả lời Form)
3. **Xóa Nhận xét** → Cột D, E, G (ưu điểm, nhược điểm, checkbox)

**Lưu ý:** 
- Cấu hình được lưu vào **Script Properties** (không xuất hiện trong Sheet)
- Áp dụng cho **TẤT CẢ** bài tập khi tự động dọn dẹp (cột E = ☑)
- Có thể thay đổi bất cứ lúc nào qua dialog

---

## 🎨 MINH HỌA GOOGLE SHEET THỰC TẾ

### Screenshot mẫu:

```
   A               B              C             D            E          F         G      H              I
┌──────────────┬─────────────┬────────────┬───────────┬─────────┬──────────────┬────┬──────────────┬─────────────────┐
│ Tên bài tập  │ Lịch học    │Thời gian mở│ Deadline  │Tự động  │ Tên Sheet    │    │ Tên lớp:     │                 │
├──────────────┼─────────────┼────────────┼───────────┼─────────┼──────────────┼────┼──────────────┼─────────────────┤
│ Điểm danh    │T2-18:00;... │            │           │    ☑    │ Điểm danh    │    │ Folder ID:   │ 10A1            │
├──────────────┼─────────────┼────────────┼───────────┼─────────┼──────────────┼────┼──────────────┼─────────────────┤
│ Đại số       │ T2-18:00    │ T2-06:00   │ T3-23:00  │    ☑    │ Bảng (Đại số)│    │              │ 1AbC2DeF3GhI... │
├──────────────┼─────────────┼────────────┼───────────┼─────────┼──────────────┼────┼──────────────┼─────────────────┤
│ Hình học     │ T6-09:00    │ T6-06:00   │ T7-23:00  │    ☐    │ Bảng (Hình h)│    │              │ 1XyZ9WvU8TsR... │
├──────────────┼─────────────┼────────────┼───────────┼─────────┼──────────────┼────┼──────────────┼─────────────────┤
│ Vật lý       │T3-14:00;... │ T3-06:00   │ T5-23:00  │    ☑    │ Bảng (Vật lý)│    │              │ 1Qw2Er3Ty4Ui... │
├──────────────┼─────────────┼────────────┼───────────┼─────────┼──────────────┼────┼──────────────┼─────────────────┤
│              │             │            │           │         │              │    │              │user@gmail.com   │
└──────────────┴─────────────┴────────────┴───────────┴─────────┴──────────────┴────┴──────────────┴─────────────────┘
                                                                                     ↑              ↑
                                                                                  Label         Dữ liệu
```

---

## 🔍 CÁC TRƯỜNG HỢP ĐẶC BIỆT

### 1. Dòng "Điểm danh" (Dòng đầu tiên)
```
│ Điểm danh  │ T2-18:00;T6-09:00 │  │  │ ☑ │ Điểm danh │
```
- **Đặc điểm:**
  - Không có Form riêng
  - Không có thời gian mở, deadline
  - Chỉ có cleanup (dọn dẹp tự động)
  - Dùng để điểm danh thủ công trong Sheet

### 2. Nhiều lịch học (Multi-schedule)
```
│ Vật lý  │ T3-14:00;T5-14:00 │ T3-06:00 │ T5-23:00 │ ☑ │ Bảng nhận xét (Vật lý) │
```
- **Giải thích:**
  - Học 2 buổi: Thứ 4 14h và Thứ 6 14h
  - Form mở: Thứ 4 6h sáng
  - Deadline: Thứ 6 11h đêm
  - Cleanup: Trước cả 2 buổi học (T3 13:30 và T5 13:30)

### 3. Không tự động dọn
```
│ Hình học  │ T6-09:00 │ T6-06:00 │ T7-23:00 │ ☐ │ Bảng nhận xét (Hình học) │
```
- **Giải thích:**
  - Checkbox tắt → Không tự động xóa điểm/ghi chú
  - Giáo viên sẽ dọn thủ công qua menu

---

## 📱 CÁCH TẠO SHEET "CẤU HÌNH" MỚI

> **💡 Lưu ý quan trọng:** Ngoài sheet "Cấu Hình", bạn cần tạo thêm sheet **(Mẫu) Bảng nhận xét** (tên chính xác như vậy). Sheet này là template trống - bạn tự thiết kế cấu trúc cột theo ý muốn. Webapp sẽ tự động duplicate sheet này cho mỗi loại bài tập khi tạo lớp.

### Bước 1: Tạo sheet "Cấu Hình"
1. Trong Google Sheet, click **+** (dưới cùng)
2. Đặt tên: **`Cấu Hình`** (có dấu!)

### Bước 2: Tạo sheet "(Mẫu) Bảng nhận xét"
1. Click **+** tạo sheet thứ 2
2. Đặt tên: **`(Mẫu) Bảng nhận xét`** (đúng chính xác, có dấu ngoặc!)
3. Thiết kế cấu trúc cột theo ý bạn (ví dụ: Họ tên, Email, Điểm, Nhận xét, v.v.)
4. Sheet này sẽ được duplicate tự động cho mỗi bài tập

### Bước 3: Tạo header bảng config trong sheet "Cấu Hình" (Dòng 1, cột A-F)
```
Click cell A1 → Nhập: Tên bài tập
Click cell B1 → Nhập: Lịch học
Click cell C1 → Nhập: Thời gian mở
Click cell D1 → Nhập: Deadline
Click cell E1 → Nhập: Tự động dọn
Click cell F1 → Nhập: Tên Sheet
```

### Bước 4: Tạo phần thông tin lớp (Cột H-I)
```
Click cell H1 → Nhập: Tên lớp:
Click cell H2 → Nhập: Folder ID:
Click cell I1 → Để trống (webapp tự điền tên lớp)
Click cell I2 → Để trống
Click cell I3 → Để trống (webapp tự điền Folder ID)
Click cell I4 → Để trống (webapp tự điền Sheet ID)
Click cell I5 → Để trống (webapp tự điền Form ID)
Click cell I6 → Để trống (webapp tự điền Email)
```

### Bước 5: Format header
1. Select range **A1:F1**
2. **Format → Text wrapping → Wrap**
3. **Format → Align → Center**
4. **Format → Text → Bold**
5. Background color: Xanh nhạt (#D9EAD3)

### Bước 6: Thêm dữ liệu mẫu
```
Dòng 2 (Bài tập 1):
A2: Điểm danh
B2: T2-18:00;T6-09:00
C2: (để trống)
D2: (để trống)
E2: ☑ (Insert → Checkbox)
F2: Điểm danh

Dòng 3 (Bài tập 2):
A3: Đại số
B3: T2-18:00
C3: T2-06:00
D3: T3-23:00
E3: ☑
F3: Bảng nhận xét (Đại số)
```

### Bước 7: Copy-Paste nhanh (Khuyến nghị)

**Cách nhanh nhất:**

1. **Select cell A1**, paste đoạn này (Tab-separated):
```
Tên bài tập	Lịch học	Thời gian mở	Deadline	Tự động dọn	Tên Sheet
Điểm danh	T2-18:00;T6-09:00			TRUE	Điểm danh
Đại số	T2-18:00	T2-06:00	T3-23:00	TRUE	Bảng nhận xét (Đại số)
Hình học	T6-09:00	T6-06:00	T7-23:00	FALSE	Bảng nhận xét (Hình học)
```

2. **Select cell H1** (chú ý: cột H ở bên phải ngoài bảng config), paste đoạn này:
```
Tên lớp:
Folder ID:
10A1
1a2b3c4d5e6f7g8h9i
1x2y3z4w5v6u7t8s9r
user@gmail.com
```

3. **Convert checkbox:** Chọn cột E từ E2 xuống → Insert → Checkbox

---

## ✅ CHECKLIST KIỂM TRA

**Bảng config (A-F):**
- [ ] Sheet tên **"Cấu Hình"** (đúng chính xác, có dấu)
- [ ] Header dòng 1: A1-F1 có đầy đủ tiêu đề
- [ ] A1: "Tên bài tập"
- [ ] B1: "Lịch học"
- [ ] C1: "Thời gian mở"
- [ ] D1: "Deadline"
- [ ] E1: "Tự động dọn"
- [ ] F1: "Tên Sheet"
- [ ] Dữ liệu từ dòng 2 trở đi (A2, B2, C2...)
- [ ] Cột B: Format đúng `T2-18:00`
- [ ] Cột E: Dùng checkbox thật (Insert → Checkbox), không phải text
- [ ] Không có dòng trống giữa các config

**Thông tin lớp (Cột H-I):**
- [ ] Cell H1: "Tên lớp:"
- [ ] Cell H2: "Folder ID:"
- [ ] Cell I1-I6: Để trống (webapp tự điền)
- [ ] Không điền tay vào cột I (chỉ webapp mới ghi)

---

## 🎯 EXAMPLES THEO TRƯỜNG HỢP

### Trường hợp 1: Lớp học online (nhiều môn)
```
│ Điểm danh    │ T2-19:00;T4-19:00;T6-19:00 │     │          │ ☑ │ Điểm danh              │
│ Toán         │ T2-19:00                   │ T2-06:00 │ T3-23:59 │ ☑ │ Bảng nhận xét (Toán)   │
│ Lý           │ T4-19:00                   │ T4-06:00 │ T5-23:59 │ ☑ │ Bảng nhận xét (Lý)     │
│ Hóa          │ T6-19:00                   │ T6-06:00 │ T7-23:59 │ ☑ │ Bảng nhận xét (Hóa)    │
```

### Trường hợp 2: Lớp luyện thi (1 môn, nhiều buổi)
```
│ Điểm danh    │ T3-18:00;T5-18:00;T7-14:00 │     │          │ ☑ │ Điểm danh              │
│ Đề tuần 1    │ T3-18:00                   │ T3-06:00 │ T4-23:59 │ ☑ │ Tuần 1                 │
│ Đề tuần 2    │ T3-18:00                   │ T3-06:00 │ T4-23:59 │ ☑ │ Tuần 2                 │
│ Đề tuần 3    │ T3-18:00                   │ T3-06:00 │ T4-23:59 │ ☑ │ Tuần 3                 │
```

### Trường hợp 3: Không dùng tự động (thủ công)
```
│ Bài tập 1    │                │          │          │ ☐ │ Bài tập 1              │
│ Bài tập 2    │                │          │          │ ☐ │ Bài tập 2              │
```
*(Không có lịch học → Không có trigger tự động)*

---

## 🚨 LỖI THƯỜNG GẶP

### ❌ Lỗi 1: Tên sheet sai
```
Sheet tên: "Cấu hình" hoặc "cau hinh" hoặc "Config"
→ SAI! Phải là: "Cấu Hình" (chữ C và H viết hoa, có dấu)
```

### ❌ Lỗi 2: Format thời gian sai
```
B2: "Thứ 2 - 18:00"     ← SAI
B2: "2-18:00"           ← SAI
B2: "T2-18h00"          ← SAI
B2: "T2-18:00"          ← ĐÚNG ✓
```

### ❌ Lỗi 3: Cell H6 không phải email
```
H6: "Nguyễn Văn A"      ← SAI (không phải email)
H6: "user"              ← SAI (thiếu @)
H6: "user@gmail.com"    ← ĐÚNG ✓
```

### ❌ Lỗi 4A: Thông tin lớp sai vị trí
```
Đặt ở cột B (B1-B6)     ← SAI (đè lên cột Lịch học)
Đặt ở cột H (H1-H6)     ← ĐÚNG ✓
```

### ❌ Lỗi 4: Checkbox dùng text thay vì checkbox
```
E2: "TRUE"              ← SAI (text)
E2: "☑"                 ← SAI (ký tự text)
E2: ☑                   ← ĐÚNG (checkbox thật)
```

**Cách tạo checkbox đúng:**
1. Click cell E2
2. **Insert → Checkbox**
3. Tick để bật

---

## 💡 TIPS & TRICKS

### Tip 1: Copy nhanh format thời gian
1. Gõ `T2-18:00` vào 1 cell
2. Copy cell đó
3. Paste vào cells khác
4. Sửa số ngày và giờ

### Tip 2: Điền nhanh checkbox
1. Chọn toàn bộ cột E (từ E2 trở xuống)
2. **Insert → Checkbox**
3. Tick từng ô cần bật

### Tip 3: Protect thông tin quan trọng
1. Select range **H3:H6** (thông tin webapp tự ghi)
2. **Data → Protected sheets and ranges**
3. Set permissions: "Show a warning"
4. Tránh vô tình xóa

### Tip 4: Conditional formatting
1. Select cột E
2. **Format → Conditional formatting**
3. Rule: `=E2=TRUE` → Background: Green
4. Rule: `=E2=FALSE` → Background: Gray

---

**🎉 XONG! Bạn đã có sheet Cấu Hình hoàn chỉnh!**

*Lưu file này để tham khảo khi tạo lớp mới.*
