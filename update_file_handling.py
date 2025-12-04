#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Read the file
with open('ScriptsGoogleForm.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Old logic (lines 377-387) - "Kích cỡ khác → giữ cả 2"
old_block = """              } else {
                // Kích cỡ khác → giữ cả 2, di chuyển file mới vào folder
                file.moveTo(studentFolder);
                Logger.log(`[FILE HANDLING] ✓ Kích cỡ khác (${existingSize}B vs ${fileSize}B) → GIỮ cả 2 file. app.js sẽ sắp xếp theo thời gian: "${fileName}".`);
              }"""

# New logic with rename
new_block = """              }
              
              if (!shouldDelete) {
                // Nếu không phải duplicate, cần kiểm tra kích cỡ
                let isDifferentSize = false;
                for (const existingFile of existingFiles) {
                  const existingSize = existingFile.getSize();
                  const existingTime = existingFile.getLastUpdated().getTime();
                  
                  // CÙNG tên + CÙNG kích cỡ + KHÁC thời gian = giữ file MỚI HƠN, xóa file CỮ
                  if (fileSize === existingSize && fileTime !== existingTime) {
                    if (fileTime > existingTime) {
                      existingFile.setTrashed(true);
                      file.moveTo(studentFolder);
                      Logger.log(`[FILE HANDLING] ✓ CÙNG KÍCH CỠ, KHÁC THỜI GIAN: File mới MỚI hơn → XÓA file cũ, GIỮ file mới.`);
                    } else {
                      file.setTrashed(true);
                      Logger.log(`[FILE HANDLING] ✓ CÙNG KÍCH CỠ, KHÁC THỜI GIAN: File cũ MỚI hơn → XÓA file mới, GIỮ file cũ.`);
                    }
                    shouldDelete = true;
                    break;
                  }
                  
                  // CÙNG tên + KHÁC kích cỡ = cần rename file để phân biệt
                  if (fileSize !== existingSize) {
                    isDifferentSize = true;
                  }
                }
                
                // Nếu kích cỡ khác → rename file với suffix số để app.js phân biệt
                if (!shouldDelete && isDifferentSize) {
                  const nameParts = fileName.lastIndexOf('.') > -1 
                    ? [fileName.substring(0, fileName.lastIndexOf('.')), fileName.substring(fileName.lastIndexOf('.'))]
                    : [fileName, ''];
                  
                  const baseFileName = nameParts[0];
                  const fileExtension = nameParts[1];
                  
                  // Tìm suffix tiếp theo (tránh conflict)
                  let suffix = 1;
                  let newFileName = `${baseFileName}_${suffix}${fileExtension}`;
                  while (doesFileExistInFolder(studentFolder, newFileName)) {
                    suffix++;
                    newFileName = `${baseFileName}_${suffix}${fileExtension}`;
                  }
                  
                  // Rename file trước khi move
                  file.setName(newFileName);
                  file.moveTo(studentFolder);
                  Logger.log(`[FILE HANDLING] ✓ KÍCH CỠ KHÁC: Rename "${fileName}" → "${newFileName}" (để app.js sắp xếp PDF theo thứ tự).`);
                }
              }"""

# Replace old logic with new
if old_block in content:
    content = content.replace(old_block, new_block)
    print("✓ Đã cập nhật logic file handling với rename file!")
else:
    print("✗ Không tìm thấy old_block để thay thế")
    print("Trying to find nearby content...")
    # Try to find the exact location
    if "Kích cỡ khác → giữ cả 2" in content:
        print("✓ Tìm thấy chuỗi 'Kích cỡ khác → giữ cả 2'")
        idx = content.find("Kích cỡ khác → giữ cả 2")
        print(f"  Vị trí: {idx}")
        # Print context
        start = max(0, idx - 200)
        end = min(len(content), idx + 300)
        print(f"  Context:\n{repr(content[start:end])}")

# Write back
with open('ScriptsGoogleForm.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✓ Đã lưu lại file ScriptsGoogleForm.txt")
