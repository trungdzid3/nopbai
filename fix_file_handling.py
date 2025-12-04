#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Read the file
with open('ScriptsGoogleForm.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and replace the problematic section (starting from "// Kiểm tra xem file cùng tên")
result = []
i = 0
while i < len(lines):
    if "// Kiểm tra xem file cùng tên đã có trong folder không" in lines[i]:
        # Found the start - now replace the entire block until "} else {"
        print(f"Found at line {i}")
        
        # Add lines until we find the logic to replace
        result.append(lines[i])  # Add the comment line
        i += 1
        
        # Copy lines until we reach "const existingFilesIter"
        while i < len(lines) and "const existingFilesIter" not in lines[i]:
            result.append(lines[i])
            i += 1
        
        # Now we need to replace the entire if-else block
        # First, add the new code that uses getAllFilesWithSameName instead
        new_code = '''            // Lấy tất cả file cùng tên (có thể có nhiều)
            const allFilesWithSameName = studentFolder.getFilesByName(fileName);
            const existingFiles = [];
            while (allFilesWithSameName.hasNext()) {
              existingFiles.push(allFilesWithSameName.next());
            }
            
            if (existingFiles.length > 0) {
              // Có file cùng tên tồn tại
              Logger.log(`[FILE HANDLING] Tìm thấy ${existingFiles.length} file(s) cùng tên "${fileName}" trong folder`);
              
              let shouldDelete = false;
              
              // So sánh từng file cùng tên
              for (const existingFile of existingFiles) {
                const existingSize = existingFile.getSize();
                const existingTime = existingFile.getLastUpdated().getTime();
                
                Logger.log(`[FILE HANDLING] So sánh: Existing ${existingSize}B (${new Date(existingTime).toLocaleString('vi-VN')}) vs New ${fileSize}B (${new Date(fileTime).toLocaleString('vi-VN')})`);
                
                // Kiểm tra: CÙNG tên + CÙNG kích cỡ + CÙNG thời gian = XÓA file mới (duplicate hoàn toàn)
                if (fileSize === existingSize && fileTime === existingTime) {
                  file.setTrashed(true);
                  Logger.log(`[FILE HANDLING] ✓ DUPLICATE HOÀN TOÀN (cùng tên, kích cỡ, thời gian) → XÓA file mới.`);
                  shouldDelete = true;
                  break;
                }
              }
              
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
              }
            } else {
              // File không tồn tại → di chuyển vào folder
              file.moveTo(studentFolder);
              Logger.log(`[FILE HANDLING] ✓ FILE MỚI (không tồn tại) → DI CHUYỂN vào folder: "${fileName}".`);
            }
'''
        result.append(new_code)
        
        # Skip all the old code until we find "} else {"
        # First skip to the end of the old if block
        depth = 0
        while i < len(lines):
            if "const existingFilesIter" in lines[i]:
                i += 1
                break
            i += 1
        
        # Skip old logic lines until we reach "} else {" at the proper level
        skipped_lines = 0
        while i < len(lines):
            line = lines[i]
            # Skip until we find the comment about file not existing
            if "// File không tồn tại trong folder" in line:
                # We've gone too far - back up
                break
            if "} else {" in line and skipped_lines > 5:
                # Skip this else block
                i += 1
                # Skip until next closing brace at proper level
                while i < len(lines) and "}" not in lines[i]:
                    i += 1
                i += 1  # Skip the closing brace
                break
            i += 1
            skipped_lines += 1
        
        # Continue from after the replaced section
        continue
    else:
        result.append(lines[i])
        i += 1

# Write back
with open('ScriptsGoogleForm.txt', 'w', encoding='utf-8') as f:
    f.writelines(result)

print("✓ Đã cập nhật file handling logic")
