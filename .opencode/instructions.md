# OpenCode System Instructions - GHobby Project

## Mandatory UI/UX Standard (UI/UX Pro Max Skill Integration)
Mọi công việc thiết kế, xây dựng mới hoặc chỉnh sửa giao diện (React, Next.js, Tailwind CSS) trong dự án GHobby BẮT BUỘC phải đọc và áp dụng các nguyên tắc thiết kế nằm trong thư mục:
`./.opencode/skills/ui-ux-pro-max/`

### Nguyên tắc cốt lõi:
1. **Layout & Spacing**: Áp dụng khoảng trắng (padding/margin) chuẩn hóa, layout thoáng đãng, phân cấp thị giác rõ ràng.
2. **Color Palette**: Tối ưu độ tương phản, phối màu hiện đại chuẩn E-commerce, hỗ trợ mượt mà trên cả Dark/Light mode.
3. **Micro-interactions**: Tất cả Button, Link, Card sản phẩm phải có hiệu ứng Hover, Focus, Active và Transition mượt mà (150ms - 300ms).
4. **Loading States**: Bắt buộc tạo Skeleton Loading (`loading.tsx`) cho mọi phân đoạn fetch dữ liệu để đảm bảo Instant Navigation (0ms cảm giác hoãn).
5. **Mobile First**: Giao diện phải phản hồi mượt mà trên thiết bị di động trước khi tối ưu Desktop.
