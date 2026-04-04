# Portfolio - Full Stack Web Application

Portfolio cá nhân với **React + Vite** (Frontend) và **Django REST Framework** (Backend).

## Cấu trúc dự án

```
Portfolio/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   └── components/
│   │   │       ├── hero-section.tsx
│   │   │       ├── experience-section.tsx   # Fetch từ Django API
│   │   │       ├── project-gallery.tsx      # Fetch từ Django API
│   │   │       ├── contact-section.tsx      # POST đến Django API
│   │   │       ├── floating-nav.tsx
│   │   │       └── interactive-particles.tsx
│   │   └── styles/
│   └── .env           # VITE_API_URL=http://localhost:8000
│
└── backend/           # Django 6 + DRF
    ├── api/
    │   ├── models.py      # Project, Experience, ContactMessage
    │   ├── serializers.py
    │   ├── views.py
    │   ├── admin.py       # Quản lý qua Admin panel
    │   └── urls.py
    ├── portfolio_backend/ # Django settings, urls, wsgi
    ├── manage.py
    └── requirements.txt
```

## Chạy dự án (Development)

### 1. Backend (Django)
```bash
cd backend
.\venv\Scripts\python manage.py runserver 8000
```
Admin panel: http://localhost:8000/admin  
**Username:** `admin` | **Password:** `admin1234`  
*(Nhớ đổi mật khẩu khi deploy!)*

### 2. Frontend (Vite)
```bash
cd frontend
npm run dev -- --port 3000
```
Trang web: http://localhost:3000

## Quản lý nội dung qua Admin

1. Vào http://localhost:8000/admin, đăng nhập bằng `admin` / `admin1234`
2. **Projects** - Thêm/sửa/xóa dự án. Frontend tự động tải về khi reload.
3. **Experiences** - Thêm kinh nghiệm làm việc.
4. **Contact Messages** - Xem tin nhắn từ form liên hệ.

> Nếu Django API chưa chạy, frontend vẫn hiển thị dữ liệu mẫu (fallback data).

## API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/projects/` | Danh sách dự án |
| GET | `/api/experiences/` | Danh sách kinh nghiệm |
| POST | `/api/contact/` | Gửi tin nhắn liên hệ |
