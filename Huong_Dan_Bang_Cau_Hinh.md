# 📋 HƯỚNG DẪN BẢNG CẤU HÌNH

## 📊 CẤU TRÚC BẢNG

| Cột | Tên | Mô tả | Ví dụ |
|-----|-----|-------|-------|
| **A** | Tên bài tập | Loại bài tập/môn học | Đại số, Điểm danh |
| **B** | Lịch học | Thời gian học (nhiều buổi dùng `;`) | CN-18:00;T6-09:00 |
| **C** | Thời gian mở | Form mở nhận bài | T2-06:00 |
| **D** | Deadline | Hạn nộp bài | T3-23:00 |
| **E** | Tự động dọn | Tick ✓ để tự động xóa dữ liệu trước giờ học | ☑ hoặc ☐ |
| **F** | Tên Sheet | Tên sheet chứa danh sách | Bảng nhận xét (Đại số) |

---

## ⏰ FORMAT THỜI GIAN

**Cú pháp:** `[Ngày]-[Giờ]:[Phút]`

- `CN` = Chủ Nhật | `T2` = Thứ Hai | `T3` = Thứ Ba | `T4` = Thứ Tư
- `T5` = Thứ Năm | `T6` = Thứ Sáu | `T7` = Thứ Bảy

**Ví dụ:** `CN-18:00` (Chủ Nhật 6h chiều), `T2-09:00` (Thứ Hai 9h sáng)

**Nhiều buổi:** `CN-18:00;T6-09:00` (dùng `;` hoặc `,`)

---

## 📝 VÍ DỤ ĐIỀN

### **Dòng 1: Điểm danh**
```
A2: Điểm danh
B2: CN-18:00;T6-09:00    (Tất cả lịch học)
C2: (để trống)
D2: (để trống)
E2: ☑                    (Tick để tự động dọn)
F2: Điểm danh
```

### **Dòng 2+: Bài tập**
```
A3: Đại số
B3: T2-18:00
C3: T2-06:00
D3: T3-23:00
E3: ☑
F3: Bảng nhận xét (Đại số)
```

---

## ⚙️ TỰ ĐỘNG HÓA

### 🧹 **Tự động dọn dẹp** (Cột E = ☑)
- **Khi:** Trước giờ học **45 phút**
- **Xóa:** Cột B (Email), C (Điểm), D+E+G (Nhận xét)

### 📝 **Tự động điền "Chưa nộp"** (Cột D có deadline)
- **Khi:** Sau deadline **30 phút**
- **Điều kiện:** Cột F trống + Cột G không tick

---

## 🎬 KÍCH HOẠT

1. Điền đầy đủ bảng cấu hình
2. Menu **"Tiện ích Lớp Học"** → **"⚙️ Cài đặt Toàn bộ Lịch trình"**
3. Cấp quyền (lần đầu)
4. Kiểm tra: Menu → **"📊 Xem cấu hình hiện tại"**

---

## ✅ CHECKLIST

- [ ] Lịch học đúng format: `CN-18:00` hoặc `T2-18:00`
- [ ] Tên Sheet (Cột F) khớp với sheet thật
- [ ] Checkbox (Cột E) dùng Insert → Checkbox (không gõ text)
- [ ] Mỗi lần sửa → Chạy lại "Cài đặt Toàn bộ Lịch trình"

---

## ❌ LỖI THƯỜNG GẶP

**Format sai:**
```
❌ "Thứ 2 - 18:00", "T2-18h00"
✅ "T2-18:00"
```

**Tên sheet không khớp:**
```
Cột F: "Bảng nhận xét (Đại số)"
Sheet thật: "Bang nhan xet (Dai so)"  ← SAI!
```

---

## 💡 TIPS

- **Tùy chỉnh dọn dẹp:** Menu → "🧹 Chạy thủ công: Dọn dẹp (Tùy chọn)"
- **Test thử:** Menu → "📝 Chạy thủ công: Điền 'Chưa nộp'"
- **Xem log:** Tools → Script editor → View → Logs

---

**🎉 Chúc bạn sử dụng thành công!**
