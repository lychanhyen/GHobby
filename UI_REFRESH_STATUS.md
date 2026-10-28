# GHOBBY UI REFRESH — LOOP STATUS

Trạng thái: ĐANG CHẠY
Mục tiêu: Loại bỏ cảm giác "giao diện AI", áp dụng chuẩn UI/UX Pro Max

## Đã hoàn thành (nền tảng)
- `.opencode/instructions.md` — quy tắc thiết kế bắt buộc
- Design tokens: paper / ink / accent, font Work Sans tự host
- globals.css: container-page, eyebrow, btn-*, input, card, skeleton
- Header mới: announcement bar, nav gọn, dropdown tài khoản thống nhất
- Footer mới: bỏ emoji, bố cục 4 cột, thông tin giao hàng thực tế
- ProductCard mới: ảnh 1:1, badge tối giản, hover lift nhẹ
- Trang chủ mới: hero editorial, service strip, danh mục, sản phẩm, pre-order, khối cửa hàng
- Admin shell mới: sidebar nhóm menu, mobile nav, header dropdown
- Skeleton: `src/app/loading.tsx`, `san-pham/[slug]/loading.tsx`, `admin/(dashboard)/loading.tsx`

## Đang thực hiện
- [PUBLIC] Đồng bộ các trang còn lại (sản phẩm, giỏ hàng, thanh toán, danh mục, tài khoản, tra cứu, đơn hàng)
- [ADMIN] Đồng bộ toàn bộ trang quản trị theo token mới

## Tiêu chí review
- Không còn emoji làm icon
- Không gradient rực rỡ, không font-black tràn lan
- Card bo góc 8px, viền 1px, bóng rất nhẹ
- Nút có hover/active/focus, transition 150–300ms
- Bảng, form, modal đồng nhất
- Mobile first, không tràn ngang
- `npx tsc --noEmit` = 0 lỗi
