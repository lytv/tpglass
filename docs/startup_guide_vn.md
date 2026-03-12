# Hướng dẫn khởi chạy TPGlass từ nguồn (Source Code)

Tài liệu này hướng dẫn bạn cách cài đặt, chạy và thiết lập hệ thống TPGlass lần đầu tiên.

## 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 20.x.x (Khuyên dùng v20.18.0)
- **Python**: Đã được cài đặt và có trong PATH.
- **Hệ điều hành**: macOS (M1/M2/M3 hoặc Intel).

## 2. Các bước cài đặt từ đầu
Nếu bạn vừa tải mã nguồn về, hãy chạy lệnh sau trong Terminal tại thư mục `tpglass`:

```bash
npm run setup
```

**Lệnh này sẽ tự động:**
1. Cài đặt các thư viện cần thiết (`npm install`).
2. Xây dựng phần giao diện web (`pickleglass_web`).
3. Khởi chạy ứng dụng lần đầu.

## 3. Giao diện lần đầu (First Run)
Khi ứng dụng khởi chạy lần đầu, bạn sẽ thấy một **thanh ngang nhỏ (Header)** nằm ở phía trên màn hình. Đây là nơi bạn cấu hình bộ não (AI) cho hệ thống.

![Header Window](https://raw.githubusercontent.com/pickle-com/glass/main/public/assets/02.gif)

### Bước A: Nhập API Key hoặc Đăng nhập
Hệ thống cần AI để hoạt động. Bạn có hai lựa chọn:
1. **Dùng Key cá nhân**: Nhập OpenAI API Key hoặc Gemini API Key trực tiếp vào ô trống trên thanh Header.
2. **Đăng nhập (Khuyên dùng)**: Nhấp vào biểu tượng tài khoản để đăng nhập. Sau khi đăng nhập thành công qua trình duyệt, hệ thống sẽ tự động nhận một "Virtual Key" miễn phí từ Pickle.

### Bước B: Cấp quyền (Permissions)
Sau khi có API Key, hệ thống sẽ yêu cầu các quyền:
- **Screen Recording**: Để Glass có thể "thấy" màn hình của bạn.
- **Microphone**: Để Glass có thể "nghe" âm thanh.
- **Accessibility**: Để hỗ trợ các phím tắt.

## 4. Các phím tắt quan trọng
Để bắt đầu sử dụng và chụp ảnh hướng dẫn, bạn hãy nhớ các phím này:
- `Cmd + \` : Hiện/Ẩn thanh Header.
- `Cmd + L` : Bật/Tắt chế độ "Nghe" (Listen) để ghi lại cuộc họp hoặc âm thanh.
- `Cmd + Enter` : Mở cửa sổ "Hỏi" (Ask) để tương tác với AI về nội dung trên màn hình.

## 5. Mẹo chụp ảnh hướng dẫn
1. **Chụp thanh Header**: Nhấn `Cmd + \` để hiện thanh bar ở giữa màn hình. Đây là linh hồn của ứng dụng.
2. **Chụp cửa sổ Ask**: Nhấn `Cmd + Enter` để hiện cửa sổ chat AI.
3. **Chụp cửa sổ Settings**: Nhấp vào biểu tượng bánh răng trên thanh Header.

## 6. Cách quay lại màn hình thiết lập API (Re-open API Key Screen)
Nếu bạn muốn quay lại màn hình thiết lập API ban đầu (để chụp ảnh hoặc nhập Key mới), hãy thực hiện:
1. Di chuột vào biểu tượng ba dấu chấm (Settings) trên thanh Header.
2. Nếu bạn đang đăng nhập: Hãy nhấn nút **Logout** màu đỏ ở dưới cùng.
3. Nếu bạn đã nhập Key thủ công: Hãy nhấn nút **Clear** bên cạnh ô nhập API Key của OpenAI hoặc Gemini.
4. **Sau khi tất cả Key được xóa hoặc bạn Logout**, hệ thống sẽ tự động hiển thị lại màn hình "Welcome" ban đầu.
