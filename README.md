# Huyền Học Ba Hệ Thống (Mobile-first PWA)
### Kỳ Môn Độn Giáp • Tử Vi Đẩu Số • Bát Tự (Tứ Trụ)

Ứng dụng Web App cá nhân (tối ưu trải nghiệm điện thoại - Mobile-first PWA) dùng để xem huyền học hàng ngày cho bản thân và bạn bè, kết hợp giữa **thuật toán an sao tính toán xác thực 100% (Deterministic Engine)** và **Trí tuệ nhân tạo (AI Master Interpretation)** theo tiêu chuẩn thuật số Á Đông.

---

## 1. Nguồn Dữ Liệu Chân Lý (Single Source of Truth)
Ứng dụng sử dụng mã nguồn và tài liệu tham chiếu từ `./vendor/Numerologist_skills` làm nguồn chuẩn mực duy nhất:
1. **Kỳ Môn Độn Giáp:**
   - Script tính toán: `vendor/Numerologist_skills/qimen-dunjia/scripts/qimen_cli.py`
   - Quy tắc & Prompt: `SKILL.md` và `references/` (`ruleset-mainline.md`, `interview.md`, `yongshen.md`, `geju.md`).
   - Cửu Cung Lạc Thư 3x3, Thập Can, Bát Môn, Cửu Tinh, Bát Thần, Tuần Không, Dịch Mã, Môn bức, Phản ngâm.
2. **Tử Vi Đẩu Số:**
   - Script tính toán: `vendor/Numerologist_skills/ziwei-doushu/scripts/ziwei_cli.py`
   - Quy tắc & Prompt: `SKILL.md` và `references/` (`calculation.md`, `stars.md`, `sihua.md`, `patterns.md`).
   - 12 Cung số, 14 Chính tinh (kèm Miếu/Vượng/Đắc/Lợi/Bình/Hãm), Tam phương tứ chính, Tứ Hóa 3 tầng (Bản mệnh, Đại hạn, Lưu niên), tự kiểm tra lá số (`self_check`).
3. **Bát Tự (Tứ Trụ):**
   - Script tính toán: `backend/services/bazi_calc.py` (xây dựng bằng thư viện `lunar_python`).
   - Đổi năm theo **Lập Xuân**, đổi tháng theo **12 Tiết khí**, mặc định giờ Dạ Tý `same_day` 23:00–00:00 thuộc ngày cũ, tính chính xác chiều thuận/nghịch Đại vận, tuổi khởi vận và ngày khởi vận dương lịch.
   - Phát hiện Lục xung, Lục hợp, Tam hợp, Tam hình, Tự hình theo `references/tiangan-dizhi.md`.
   - Nút **Đối chiếu chéo (Cross-check)** đối soát sự hội tụ và bổ khuyết giữa Bát Tự và Tử Vi.

---

## 2. Kiến Trúc Kỹ Thuật

```
Numerology/
├── vendor/Numerologist_skills/   # Repo nguồn chuẩn mực (Submodule/Clone)
├── backend/
│   ├── main.py                   # FastAPI REST API & Static PWA Server
│   ├── config.py                 # Quản lý cấu hình & biến môi trường
│   ├── models/                   # Pydantic Schemas (Profile, Qimen, Ziwei, Bazi)
│   ├── services/
│   │   ├── bazi_calc.py          # Thuật toán tính Tứ Trụ chuẩn xác (lunar_python)
│   │   ├── qimen_service.py      # Bọc qimen_cli.py
│   │   ├── ziwei_service.py      # Bọc ziwei_cli.py
│   │   ├── storage.py            # SQLite lưu trữ Hồ sơ & Lịch sử xem
│   │   └── ai_interpreter.py     # Nạp SKILL.md làm System Prompt, gọi LLM tiếng Việt
│   └── tests/                    # Unit tests & Integration tests
├── frontend/                     # Mobile-first PWA (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/           # QimenTab, ZiweiTab, BaziTab, ProfileModal, v.v.
│   │   ├── utils/                # api.js, vietnamese_terms.js
│   │   └── App.jsx
│   └── public/manifest.json      # Hỗ trợ Add to Home Screen trên iOS & Android
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml
├── .env.example
└── requirements.txt
```

---

## 3. Cài Đặt & Cấu Hình

### Bước 1: Chuẩn bị môi trường
Yêu cầu:
- Python 3.11+
- Node.js 18+ (nếu muốn chạy dev frontend)

Tạo môi trường ảo Python và cài đặt thư viện:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Bước 2: Cấu hình API Key (.env)
Sao chép file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

Mở file `.env` và điền khóa API của bạn:
```ini
# Google Gemini (Khuyên dùng - nhanh, chuẩn tiếng Việt và có hạn mức miễn phí cao)
# Lấy API Key tại: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Hoặc OpenAI-compatible (DeepSeek, Groq, OpenRouter, OpenAI)
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```
*(Lưu ý: Nếu chưa nhập API Key, ứng dụng vẫn tính toán lập bàn đầy đủ 100% và hiển thị bài tóm tắt quy chuẩn mà không bị lỗi).*

---

## 4. Hướng Dẫn Chạy Ứng Dụng

### Cách 1: Chạy trọn gói nhanh nhất (Backend phục vụ cả Frontend)
Frontend đã được biên dịch sẵn vào thư mục `frontend/dist`. Bạn chỉ cần khởi động backend:

```bash
# Kích hoạt venv
source venv/bin/activate

# Chạy server
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Truy cập trên trình duyệt máy tính: `http://localhost:8000`.

### Cách 2: Chạy chế độ Phát triển (Development Mode)
Mở 2 cửa sổ terminal:

**Terminal 1 (Backend FastAPI):**
```bash
source venv/bin/activate
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend Vite React):**
```bash
cd frontend
npm run dev -- --host
```
Truy cập tại `http://localhost:5173`.

---

## 5. Hướng Dẫn Mở Trên Điện Thoại (Cài đặt PWA App)

Để mở ứng dụng trên điện thoại của bạn và bạn bè trong cùng mạng Wi-Fi:

1. **Tìm địa chỉ IP nội bộ của máy tính:**
   - Trên macOS: Vào `Cài đặt hệ thống` > `Wi-Fi` > Bấm `Chi tiết...` (hoặc chạy lệnh `ipconfig getifaddr en0`). Ví dụ IP là: `192.168.1.15`.
2. **Mở trình duyệt trên điện thoại:**
   - Đảm bảo điện thoại kết nối chung Wi-Fi với máy tính.
   - Nhập vào trình duyệt điện thoại: `http://192.168.1.15:8000` (hoặc cổng `5173` nếu chạy Vite dev).
3. **Cài đặt vào Màn hình chính (Add to Home Screen):**
   - **Trên iPhone (Safari):** Bấm nút **Chia sẻ (Share)** ở thanh dưới > Chọn **"Thêm vào MH chính" (Add to Home Screen)**.
   - **Trên Android (Chrome):** Bấm menu 3 chấm > Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.
   - Ứng dụng sẽ hiển thị như một App nguyên bản (Native App) với icon Thái Cực Bát Quái thanh lịch, chạy toàn màn hình không có thanh URL.

---

## 6. Chạy Bằng Docker & Docker Compose

Nếu bạn muốn deploy lên máy chủ gia đình, VPS hoặc chạy một lệnh duy nhất:

```bash
docker compose up -d --build
```
Dịch vụ sẽ tự động build frontend, cài đặt backend và lắng nghe tại cổng `http://localhost:8000`. Dữ liệu hồ sơ và lịch sử sẽ được bảo lưu bền vững trong thư mục `./backend/data`.

Dừng container:
```bash
docker compose down
```

---

## 7. Chạy Kiểm Thử Tự Động (Tests)

Toàn bộ thuật toán và API đều có bộ test tự động (12 tests):
```bash
PYTHONPATH=. pytest backend/tests -v
```

Kết quả:
- `test_qimen_calculation_success`: Kiểm tra bàn Kỳ Môn, Trực Phù, Trực Sử, Cửu Cung.
- `test_ziwei_calculation_success`: Kiểm tra 12 cung Tử Vi, an sao, Tứ Hóa, `self_check`.
- `test_bazi_calculation_success`: Kiểm tra Lập Xuân, Tiết khí, Đại vận, Nhật chủ.
- `test_bazi_late_zi_rule`: Kiểm tra đổi ngày giờ Dạ Tý (23:00 - 00:00).
- `test_profile_crud` & `test_history_crud`: Kiểm tra lưu trữ SQLite.
- `test_api_interpret_endpoints`: Kiểm tra quy trình luận giải.

---

## 8. Ràng Buộc & Tiêu Chuẩn Đạo Đức Thuật Số
- **Không ảo giác thuật toán:** Mọi vị trí sao, can chi, cung vị được cố định bằng code, AI không được phép tính nhẩm.
- **Ngôn từ nhân văn, khai sáng:** Chuyển hóa sát khí thành thách thức và cơ hội rèn luyện, tuyệt đối không dùng ngôn từ hù dọa (tuyệt mệnh, ly tán, đoản thọ).
- **Khối miễn trừ trách nhiệm:** Ghim thông báo chuẩn mực ở cuối mọi bài luận, hướng đương số đến tư duy lý tính và hành động thực tế.
