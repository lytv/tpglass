# Thiết kế Hệ thống Chọn Transcript (Stealth Selection Gutter)

Tài liệu này trình bày các vấn đề hiện tại với nút checkbox trong giao diện transcript và đề xuất giải pháp tối ưu hóa để cải thiện trải nghiệm người dùng (UX) và tính thẩm mỹ (UI).

## 1. Vấn đề hiện tại
Hiện tại, việc sử dụng checkbox hệ thống để chọn các dòng transcript gặp phải các vấn đề sau:
- **Gây xao nhãng (Visual Noise):** Checkbox xuất hiện đột ngột hoặc nằm đè lên văn bản khiến người dùng khó tập trung vào nội dung transcript.
- **Nhảy bố cục (Layout Shift):** Khi di chuột vào tin nhắn, việc checkbox xuất hiện làm đẩy văn bản sang bên hoặc thay đổi khoảng cách, gây cảm giác "giật" khó chịu.
- **Thẩm mỹ kém:** Checkbox mặc định của trình duyệt/hệ điều hành không ăn nhập với ngôn ngữ thiết kế cao cấp của TP Glass.

## 2. Giải pháp đề xuất: Stealth Selection Gutter
Thay vì dùng checkbox truyền thống, chúng tôi đề xuất một hệ thống "Máng chọn ẩn" (Stealth Gutter).

### Đặc điểm thiết kế:
- **Gutter cố định:** Thiết lập một vùng đệm (gutter) khoảng 24px-32px bên trái mỗi dòng transcript. Vùng này luôn tồn tại để văn bản không bao giờ bị nhảy khi trạng thái thay đổi.
- **Chỉ báo tùy chỉnh (Custom Indicators):**
    - **Trạng thái thường:** Gutter trống, không gây xao nhãng.
    - **Trạng thái Hover:** Xuất hiện một vòng tròn mờ (hollow ring) để báo hiệu dòng này có thể chọn.
    - **Trạng thái Selected:** Hiển thị một vòng tròn đặc với dấu tích (checkmark) màu Amber (vàng hổ phách) - đồng bộ với thương hiệu TP Glass.
- **Hiệu ứng chuyển cảnh (Transitions):** Sử dụng các hiệu ứng fade-in/fade-out mượt mà để tăng cảm giác cao cấp.

### Lợi ích mang lại:
1. **Sự tập trung:** Người dùng có thể đọc transcript mà không bị các yếu tố UI làm phiền.
2. **Sự ổn định:** Không còn tình trạng văn bản bị nhảy khi di chuột (Zero Layout Shift).
3. **Tính chuyên nghiệp:** Giao diện đồng nhất, mang lại cảm giác của một sản phẩm phần mềm hiện đại và đắt tiền.

## 3. Mockup minh họa
![UI Mockup](../brain/bcb2a5a0-9048-4cbc-8498-b3076ab7b0c3/ui_selection_mockup_1773328081454.png)

---
*Tài liệu này được soạn thảo để hướng dẫn triển khai cho giai đoạn tối ưu hóa UI/UX của TP Glass.*
