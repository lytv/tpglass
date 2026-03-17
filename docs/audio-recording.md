# Audio Recording for Listen Feature

Tài liệu này mô tả tính năng ghi âm tự động khi sử dụng chức năng "Listen" (Nghe) trong hệ thống TPGlass.

## 1. Tổng quan (Overview)

Tính năng này cho phép hệ thống tự động ghi lại âm thanh (âm thanh hệ thống và micro) khi người dùng nhấn nút **Listen**. Khi người dùng nhấn nút **Stop**, hệ thống sẽ tự động lưu bản ghi dưới dạng tệp MP3 vào cùng thư mục với tệp transcript (văn bản được chuyển đổi từ giọng nói).

## 2. Mục tiêu (Objectives)

- **Ghi âm thời gian thực**: Bắt đầu ghi âm ngay khi phiên làm việc "Listen" bắt đầu.
- **Chuyển đổi sang MP3**: Sử dụng công cụ `lame` để mã hóa dữ liệu PCM thô sang định dạng MP3 tiết kiệm dung lượng.
- **Lưu trữ đồng bộ**: Đảm bảo tệp âm thanh (.mp3) và tệp văn bản (.txt) có tên giống nhau và nằm chung một đường dẫn.

## 3. Kiến trúc kỹ thuật (Technical Architecture)

Hệ thống được chia thành các thành phần chính sau:

### 3.1. RecordingService (Main Process)
- Quản lý tiến trình con (child process) chạy công cụ `lame`.
- Nhận dữ liệu âm thanh thô (PCM) từ Renderer thông qua IPC.
- Ghi dữ liệu vào một tệp tạm thời trong quá trình người dùng đang nói.
- Đóng tệp và trả về đường dẫn tệp MP3 hoàn chỉnh khi kết thúc.

### 3.2. ListenCapture (Renderer Process)
- Sử dụng `Web Audio API` để thu thập dữ liệu từ Micro và Hệ thống.
- Chuyển đổi dữ liệu sang dạng mono PCM (24kHz).
- Gửi các "chunk" âm thanh qua `ipcRenderer` đến Main Process.

### 3.3. FeatureBridge
- Xử lý các yêu cầu lưu tệp.
- Điều phối việc đặt tên tệp dựa trên timestamp hoặc tên người dùng chọn.
- Di chuyển tệp MP3 từ thư mục tạm đến thư mục lưu trữ cuối cùng của transcript.

## 4. Luồng xử lý (Workflow)

1. **Start**: Người dùng nhấn "Listen" -> `listenService` khởi tạo `recordingService`.
2. **Record**: `listenCapture` gửi dữ liệu PCM liên tục -> `recordingService` đẩy vào `lame` encoder.
3. **Save**: Người dùng nhấn "Stop" -> `listenService` kết thúc phiên.
4. **Finalize**: 
   - Hệ thống lưu transcript (.txt).
   - `recordingService` hoàn tất tệp MP3.
   - `featureBridge` di chuyển tệp MP3 đến vị trí của transcript.

## 5. Yêu cầu hệ thống (System Requirements)

- Công cụ **lame** phải được cài đặt trên hệ thống (thường có sẵn trong `/opt/homebrew/bin/lame` trên macOS).
