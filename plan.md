# KẾ HOẠCH TRIỂN KHAI HỆ THỐNG GHOBBY (BẢN V2)
*Website bán mô hình Gundam/Figure & Quản lý xuất nhập kho chuẩn SEO*
*Nền tảng: Next.js (App Router, SSR/SSG) + Node.js + Prisma ORM + Supabase Storage*

---

## 1. KIẾN TRÚC VÀ CÔNG NGHỆ

### 1.1. Nền tảng cốt lõi
- **Framework toàn dự án**: **Next.js (App Router)** chạy trên **Node.js**.
  - **Trang khách hàng (Public SEO)**: Sử dụng **React Server Components (SSR / SSG)**. Toàn bộ mã HTML được kết xuất hoàn chỉnh trên máy chủ trước khi gửi về trình duyệt. Bot tìm kiếm Google nhận được 100% nội dung (tiêu đề, thẻ H1, giá bán VND, tình trạng kho, ảnh và khối JSON-LD) ngay trong lần nạp đầu tiên mà không phụ thuộc vào JavaScript của trình duyệt.
  - **Trang quản trị (`/admin`)**: Sử dụng Client Components cho giao diện tương tác nhanh, được đánh dấu `noindex, nofollow` và chặn hoàn toàn trong `robots.txt`.
- **API & Nghiệp vụ kho**: Sử dụng **Next.js Route Handlers (`app/api/...`)** chạy trên môi trường Node.js.
  - Xử lý xác thực, kiểm tra quyền, tải ảnh lên Supabase, và thực thi các giao dịch kho an toàn.
- **Giao diện**: **Tailwind CSS** được biên dịch thành file CSS tĩnh khi build dự án (Build-time PostCSS/Tailwind), **tuyệt đối không dùng CDN**, đảm bảo tải cực nhanh và hoạt động offline ổn định.
- **ORM**: **Prisma ORM** quản lý toàn bộ cấu trúc cơ sở dữ liệu, quan hệ bảng và file migration (`prisma/schema.prisma`).

### 1.2. So sánh 2 phương án Cơ sở dữ liệu (Để bạn chọn)
| Tiêu chí | Phương án A: PostgreSQL trên Cloud (Supabase) | Phương án B: PostgreSQL chạy cục bộ (Local) |
| :--- | :--- | :--- |
| **Cài đặt** | **Rất dễ**: Chỉ cần đăng ký tài khoản miễn phí trên supabase.com, tạo dự án và lấy chuỗi kết nối dán vào file `.env`. Không phải cài phần mềm nặng máy. | **Phức tạp hơn**: Phải cài đặt PostgreSQL Server trên Windows hoặc cài qua Docker. Cần cấu hình service nền. |
| **Hệ sinh thái** | Đi chung một tài khoản với **Supabase Storage** (quản lý cả Database lẫn Ảnh trong 1 dashboard duy nhất). | Tách biệt: Database nằm ở máy tính cá nhân, còn Ảnh vẫn phải lưu trên Cloud (Supabase Storage). |
| **Khả năng làm việc** | Cần kết nối Internet để kết nối DB khi phát triển. | Chạy hoàn toàn offline trên máy tính, không cần mạng. |
| **Chi phí** | Miễn phí (Gói Free tier của Supabase dư sức chứa hàng chục nghìn sản phẩm & đơn hàng). | Miễn phí hoàn toàn. |
| **Đưa lên thật (Production)** | **Sẵn sàng ngay**: Không cần chuyển đổi dữ liệu khi bàn giao website. | Phải xuất dữ liệu (dump) từ máy cá nhân lên máy chủ đám mây khi triển khai thật. |
| **Đề xuất** | **(Khuyên dùng)**: Tiện lợi, đồng bộ với nơi lưu ảnh, không làm nặng máy tính của bạn. | Phù hợp nếu bạn thường xuyên làm việc ở nơi không có Internet. |

---

## 2. QUẢN LÝ ẢNH SẢN PHẨM (SUPABASE STORAGE)

### 2.1. Kiến trúc lưu trữ và bảo mật
- **Bucket**: Tạo một bucket chế độ **Public** mang tên `ghobby-products` trên Supabase Storage để ảnh hiển thị công khai trên website.
- **Cơ sở dữ liệu**: Bảng `Product` chỉ lưu URL công khai dạng chuỗi (`https://...supabase.co/storage/v1/object/public/ghobby-products/uuid.webp`).
- **Luồng tải ảnh lên an toàn (Bắt buộc qua Server Node.js)**:
  ```
  Trình duyệt (Admin) --> Gửi FormData chứa File ảnh --> Server Route Handler (/api/admin/upload)
  Server kiểm tra định dạng thật & dung lượng --> Đổi tên UUID --> Dùng Service Role Key đẩy lên Supabase
  --> Supabase trả về Public URL --> Server lưu URL vào DB --> Trả kết quả cho Admin
  ```
  - **Kiểm tra loại file thật**: Đọc mã nhận diện nhị phân (Magic Bytes / Buffer header), chỉ cho phép `image/jpeg`, `image/png`, `image/webp`. Chặn hoàn toàn việc đổi đuôi file giả mạo (ví dụ: file exe/php đổi đuôi thành .jpg).
  - **Giới hạn dung lượng**: Tối đa 5MB mỗi ảnh.
  - **Đổi tên file**: Sử dụng chuỗi định danh ngẫu nhiên không trùng lặp `uuidv4() + .webp` (ví dụ: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.webp`) để tránh xung đột tên tiếng Việt có dấu hoặc ký tự đặc biệt.
- **Bảo mật khoá API**:
  - `SUPABASE_SERVICE_ROLE_KEY`: Khoá có toàn quyền quản trị, **chỉ nằm trong file `.env` ở máy chủ** và chỉ được gọi trong các file Server Route Handlers. Tuyệt đối không bao giờ xuất hiện ở mã nguồn gửi về trình duyệt khách hàng (không có tiền tố `NEXT_PUBLIC_`).

### 2.2. Hướng dẫn từng bước bạn tự tạo Supabase Bucket & Lấy khoá (Mất 3 phút)
1. **Tạo tài khoản & Dự án**:
   - Truy cập [supabase.com](https://supabase.com) $\rightarrow$ Đăng ký / Đăng nhập $\rightarrow$ Bấm **New Project**.
   - Đặt tên dự án (ví dụ: `GHobby`), chọn mật khẩu Database (lưu lại mật khẩu này), chọn khu vực Singapore (`ap-southeast-1` để tải nhanh nhất về Việt Nam) $\rightarrow$ Bấm **Create new project**.
2. **Tạo Bucket lưu ảnh**:
   - Ở thanh menu bên trái, chọn **Storage** $\rightarrow$ Bấm **New bucket**.
   - Đặt tên bucket: `ghobby-products`.
   - Bật công tắc **Public bucket** sang màu xanh (để khách xem được ảnh) $\rightarrow$ Bấm **Save**.
3. **Lấy thông tin điền vào file `.env`**:
   - Vào mục **Project Settings** (biểu tượng bánh răng góc dưới bên trái) $\rightarrow$ Chọn **API**.
   - Copy **Project URL** $\rightarrow$ dán vào `SUPABASE_URL` trong `.env`.
   - Ở mục **Project API keys**, tìm dòng **`service_role` (secret)** $\rightarrow$ Bấm *Reveal* để copy $\rightarrow$ dán vào `SUPABASE_SERVICE_ROLE_KEY` trong `.env`.
   - Nếu bạn chọn dùng PostgreSQL Supabase: Vào **Project Settings** $\rightarrow$ **Database** $\rightarrow$ mục **Connection string** $\rightarrow$ chọn tab **URI** $\rightarrow$ Copy chuỗi kết nối dán vào `DATABASE_URL` trong `.env`.

---

## 3. NGHIỆP VỤ KHO & ĐƠN HÀNG CHI TIẾT

### 3.1. Quy tắc đơn hàng & Huỷ đơn tự động sau 24 giờ
- **Thời hạn thanh toán cọc**: Khách đặt hàng có **24 giờ** để chuyển khoản cọc 10%.
- **Cơ chế tự động huỷ**: 
  - Một tác vụ định kỳ (Cron job hoặc tác vụ kiểm tra tự động chạy trên Server) quét các đơn hàng có trạng thái `PENDING_DEPOSIT` mà thời gian tạo đơn đã vượt quá 24 giờ (`createdAt < now() - 24h`).
  - Hệ thống tự động chuyển trạng thái đơn sang `CANCELLED`, đồng thời kích hoạt giao dịch hoàn kho ngay lập tức.
- **Nguyên tắc hoàn kho đúng 1 lần duy nhất**:
  - Mỗi đơn hàng có một cờ trạng thái `isRestocked` (mặc định `false`).
  - Khi huỷ đơn (dù do tự động sau 24h hay do Admin bấm huỷ bằng tay), hệ thống kiểm tra: Nếu `isRestocked === false`, tiến hành cộng lại tồn kho, ghi log `ORDER_CANCEL_RESTOCK`, và đổi cờ thành `isRestocked = true` trong **cùng một transaction**. Nếu huỷ lần 2 hoặc gọi lại API, giao dịch sẽ bị từ chối, đảm bảo không bao giờ bị cộng thừa kho.

### 3.2. Quy tắc hàng Đặt trước (Pre-order)
- Sản phẩm được gắn cờ `productType: "PRE_ORDER"`.
- Hiển thị ngày phát hành dự kiến (`expectedReleaseDate`).
- Khách đặt hàng Pre-order vẫn thanh toán tiền cọc 10% như bình thường.
- **Xử lý tồn kho Pre-order**:
  - Không trừ số lượng `stockQuantity` (vì hàng thực tế chưa về kho).
  - Tăng chỉ số theo dõi `preOrderCount` để chủ shop biết chính xác cần nhập bao nhiêu bộ từ hãng khi mở bán.
  - Khi hàng thực tế cập bến: Admin làm phiếu **Nhập kho (IMPORT)** $\rightarrow$ sau đó bấm chuyển đơn Pre-order sang trạng thái **Đang đóng gói (CONFIRMED)** thì hệ thống mới trừ vào số tồn thực tế.

### 3.3. Phân chia khu vực vận chuyển & Tính tiền cọc 10%
- **Danh sách khu vực vận chuyển cụ thể**:
  - **Nội thành (Khu vực trung tâm shop phục vụ)**: 
    - Bao gồm các quận: Quận 1, Quận 3, Quận 4, Quận 5, Quận 6, Quận 8, Quận 10, Quận 11, Tân Bình, Tân Phú, Phú Nhuận, Gò Vấp, Bình Thạnh (Ví dụ chuẩn theo TP.HCM, có thể cấu hình lại theo địa chỉ thực tế của shop).
    - Phí ship: Tạm tính **0đ** trên web $\rightarrow$ hiển thị ghi chú rõ ràng: *"Phí vận chuyển Nội thành giao hỏa tốc/tiết kiệm sẽ được nhân viên shop liên hệ báo chính xác qua Zalo sau khi đóng gói"*.
  - **Ngoại thành & Liên tỉnh**: 
    - Bao gồm các huyện ngoại thành và toàn bộ 62 tỉnh thành khác trên toàn quốc.
    - Phí ship: **Cố định 20.000đ** (Flat rate hỗ trợ người mua).
- **Công thức tính tiền cọc 10%**:
  - Tiền cọc 10% **chỉ tính trên Tổng tiền hàng** (Tổng giá trị các sản phẩm trong giỏ), **tuyệt đối KHÔNG tính trên phí vận chuyển**.
  - `depositRequired = Math.round(totalProductAmount * 0.1)`
  - *Ví dụ*: Đơn gồm 1 mẫu HG Gundam Aerial giá 350.000đ, giao ngoại thành phí ship 20.000đ $\rightarrow$ Tổng đơn thanh toán khi nhận: 370.000đ $\rightarrow$ Tiền cọc 10% cần chuyển khoản trước: 35.000đ. Số tiền còn lại thu COD: 335.000đ.

### 3.4. Danh mục loại biến động kho (`changeType`)
Mọi thay đổi số lượng tồn trong bảng `InventoryLog` bắt buộc phải thuộc một trong các loại sau:
1. `IMPORT`: Nhập hàng mới từ nhà phân phối/hãng Bandai (ghi nhận giá vốn).
2. `EXPORT_MANUAL`: Xuất bán lẻ trực tiếp tại cửa hàng hoặc quà tặng.
3. `ORDER_DEDUCT`: Tự động trừ kho ngay khi khách đặt đơn hàng có sẵn thành công.
4. `ORDER_CANCEL_RESTOCK`: Tự động hoàn lại hàng vào kho khi đơn bị huỷ (sau 24h hoặc Admin huỷ).
5. `ADJUST`: Cân chỉnh số lượng sau các đợt kiểm kê thực tế định kỳ.
6. `DAMAGED`: Xuất loại bỏ do hàng bị lỗi đúc (runner lỗi), móp méo hộp nặng trong vận chuyển.
7. `WARRANTY`: Xuất linh kiện / part / runner rời để bảo hành hoặc bù cho khách hàng.

### 3.5. Ràng buộc an toàn tồn kho (Prisma Transaction)
- **Tuyệt đối không để tồn kho âm**: Mọi thao tác trừ kho đều phải nằm trong `prisma.$transaction`. Sử dụng điều kiện kiểm tra nghiêm ngặt:
  ```typescript
  // Trừ kho nguyên tử (Atomic decrement with condition)
  const product = await tx.product.update({
    where: { 
      id: productId,
      stockQuantity: { gte: quantityToDeduct } // Điều kiện: Tồn phải >= số lượng cần trừ
    },
    data: { stockQuantity: { decrement: quantityToDeduct } }
  });
  ```
  Nếu số tồn hiện tại nhỏ hơn số lượng yêu cầu, lệnh update sẽ báo lỗi ngay lập tức và Transaction tự động rollback (huỷ bỏ toàn bộ), ngăn chặn 100% tình trạng âm kho.
- **Server luôn tự lấy giá và tồn từ DB**: Khách hàng bấm gửi đơn chỉ gửi lên danh sách `{ productId, quantity }`. Máy chủ Node.js sẽ tự truy vấn bảng `Product` trong Database để lấy đơn giá thực tế và số lượng tồn kho. Tuyệt đối không nhận giá tiền hoặc tổng tiền từ trình duyệt gửi lên để chống gian lận sửa giá bằng F12.

### 3.6. Cơ chế tạo VietQR & Xác nhận cọc thủ công
- **Tạo mã VietQR**: 
  - Tạo URL ảnh VietQR chuẩn quốc gia Napas247 theo cú pháp:
    `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${depositRequired}&addInfo=${orderCode}&accountName=${ACCOUNT_NAME}`
  - Mã QR hiển thị ngay tại trang hoàn tất đơn hàng, tự động điền sẵn chính xác số tiền cọc (10%) và nội dung chuyển khoản là mã đơn hàng (ví dụ: `GHB-928371`). Khách hàng chỉ cần mở app ngân hàng quét là xong.
- **Quy trình Admin xác nhận cọc**:
  - Khi tiền cọc về tài khoản, Admin đối chiếu mã đơn trong nội dung chuyển khoản.
  - Admin vào trang `/admin/don-hang`, tìm đơn tương ứng $\rightarrow$ Bấm nút **"Xác nhận đã nhận cọc"**.
  - Hệ thống cập nhật `depositPaid = true`, đổi trạng thái đơn sang `CONFIRMED` (Đã cọc / Đang đóng gói) và lưu lịch sử người duyệt.

---

## 4. BẢO MẬT HỆ THỐNG

1. **Mật khẩu Admin ban đầu & Bắt buộc đổi**:
   - Khi chạy script seed lần đầu, hệ thống lấy mật khẩu từ biến môi trường `ADMIN_INITIAL_PASSWORD` trong `.env`.
   - Tài khoản được gán cờ `mustChangePassword: true`.
   - Ngay lần đầu Admin đăng nhập thành công, hệ thống chặn truy cập các trang khác và bắt buộc điều hướng đến trang `/admin/doi-mat-khau`. Sau khi đổi mật khẩu mới thành công, cờ chuyển thành `false`.
2. **Mã hoá mật khẩu**:
   - Sử dụng thư viện `bcrypt` với 12 salt rounds (hoặc `argon2id`), băm một chiều an toàn, chống tấn công bảng băm cầu vồng (Rainbow table).
3. **Quản lý Phiên làm việc (Session) & Cookie**:
   - Tạo mã phiên Token an toàn, lưu trong Cookie với các cờ bảo vệ tối đa:
     - `httpOnly: true`: Ngăn chặn hoàn toàn JavaScript phía trình duyệt đọc được Cookie (chống đánh cắp phiên qua XSS).
     - `secure: true`: Chỉ gửi qua giao thức mã hoá HTTPS (ở môi trường chạy thật).
     - `sameSite: "lax"`: Ngăn chặn gửi Cookie chéo trang khi bị tấn công giả mạo yêu cầu (chống CSRF).
4. **Chống tấn công dò mật khẩu (Brute-force)**:
   - Áp dụng cơ chế giới hạn tần suất (Rate Limiting) trên đường dẫn `/api/admin/login`: Khóa tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp từ một địa chỉ IP.
5. **Chống XSS & SQL Injection**:
   - React tự động mã hoá (escape) dữ liệu trước khi render ra màn hình.
   - Toàn bộ truy vấn Database đều đi qua **Prisma ORM**, tự động tham số hoá 100% câu lệnh SQL (`Parameterized queries`), ngăn ngừa hoàn toàn lỗi SQL Injection.

---

## 5. TIÊU CHUẨN SEO CHO TRANG KHÁCH HÀNG

1. **Metadata & Thẻ Open Graph động**:
   - Dùng hàm `generateMetadata()` của Next.js cho từng trang: Tự động tạo `title`, `description`, `canonical`, `openGraph` (ảnh bìa, tiêu đề khi chia sẻ qua Zalo/Facebook).
2. **Cấu trúc URL sạch & Thân thiện**:
   - Chi tiết sản phẩm: `/san-pham/[slug]` (ví dụ: `/san-pham/rg-1-144-hi-nu-gundam`).
   - Danh mục sản phẩm: `/danh-muc/[slug]` (ví dụ: `/danh-muc/real-grade-rg`).
   - Tuyệt đối không chứa ID số trần; slug tiếng Việt không dấu, nối bằng dấu gạch ngang.
3. **Cấu trúc HTML ngữ nghĩa & Heading**:
   - Đúng **duy nhất 1 thẻ `<h1>`** trên mỗi trang.
   - Phân cấp Heading chuẩn: `h1` (tên sản phẩm) $\rightarrow$ `h2` (thông số kỹ thuật, mô tả chi tiết, kit liên quan) $\rightarrow$ `h3`.
   - Dùng các thẻ HTML5: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`.
4. **Schema Dữ liệu có cấu trúc (JSON-LD)**:
   - **Product Schema**: Tên, hình ảnh, mô tả, SKU, Hãng sản xuất, Giá bán VND, Tình trạng hàng (`InStock`, `OutOfStock`, `PreOrder`).
   - **BreadcrumbList Schema**: Đường dẫn phân cấp (Trang chủ $\rightarrow$ Danh mục $\rightarrow$ Sản phẩm).
   - **Organization Schema**: Thông tin shop GHobby, logo, số điện thoại, địa chỉ.
5. **Sitemap & Robots tự động**:
   - `app/sitemap.ts`: Tự động truy vấn sản phẩm đang hoạt động (`isActive: true`) để sinh ra file `/sitemap.xml`. Sản phẩm bị ẩn sẽ tự động bị loại khỏi sitemap.
   - `app/robots.ts`: Cho phép bot Google quét toàn bộ trang khách hàng, **chặn triệt để** thư mục `/admin/` và `/api/`.
6. **Xử lý trạng thái & Phân trang**:
   - Trang 404 (`app/not-found.tsx`) trả đúng mã trạng thái HTTP Status 404.
   - Sản phẩm hết hàng vẫn giữ nguyên trang (HTTP 200 OK), hiển thị nhãn "Hết hàng" và gợi ý sản phẩm cùng dòng để giữ thứ hạng SEO.
   - Phân trang dùng thẻ liên kết `<a>` thực tế (`<Link>`), có `rel="canonical"` trỏ đúng trang gốc.

---

## 6. BỘ TEST TỰ ĐỘNG CHO LOGIC KHO (AUTOMATED TESTS)

Viết kịch bản kiểm thử tự động (sử dụng Jest / Vitest) để kiểm tra độc lập các tình huống then chốt:
1. **Test 1: Chặn tồn kho âm**:
   - Giả lập sản phẩm có tồn kho = 3. Thử thực hiện lệnh xuất kho hoặc đặt đơn với số lượng = 4.
   - *Kết quả mong đợi*: Lệnh bị từ chối, Transaction rollback hoàn toàn, số lượng tồn kho vẫn giữ nguyên = 3.
2. **Test 2: Hoàn kho đúng một lần duy nhất (Idempotent Restock)**:
   - Tạo đơn hàng gồm 2 sản phẩm (kho đã bị trừ 2).
   - Gọi hàm huỷ đơn lần 1 $\rightarrow$ Tồn kho được cộng lại 2, cờ `isRestocked` đổi thành `true`.
   - Cố tình gọi hàm huỷ đơn lần 2 với cùng mã đơn đó $\rightarrow$ Hệ thống phát hiện `isRestocked === true`, không cộng thêm kho, trả về thông báo đơn đã được xử lý trước đó.
3. **Test 3: Tranh chấp đồng thời (Concurrency Test - 2 khách mua món cuối cùng)**:
   - Giả lập sản phẩm chỉ còn đúng **1 hộp duy nhất** trong kho (`stockQuantity = 1`).
   - Cho 2 tiến trình đặt hàng gửi yêu cầu mua sản phẩm đó vào cùng một mili-giây.
   - *Kết quả mong đợi*: Nhờ Transaction và ràng buộc nguyên tử (`gte: 1`), duy nhất **1 khách hàng đặt thành công**, khách hàng còn lại nhận được thông báo "Sản phẩm vừa hết hàng". Số lượng tồn kho cuối cùng bằng 0, tuyệt đối không bị âm thành -1.

---

## 7. HƯỚNG DẪN CẤP QUYỀN THƯ MỤC CHO RIÊNG TÀI KHOẢN CỦA BẠN

Để đảm bảo hệ thống có toàn quyền đọc/ghi trên thư mục `D:\GHobby` mà không cần cấp quyền cho tất cả mọi người, bạn thực hiện cấp quyền `Modify` cho riêng tài khoản của bạn theo 1 trong 2 cách:

- **Cách 1 (Dùng lệnh PowerShell Admin - Khuyên dùng, nhanh nhất)**:
  1. Bấm phím **Windows**, gõ `PowerShell`.
  2. Nhấp chuột phải vào **Windows PowerShell** $\rightarrow$ Chọn **Run as Administrator**.
  3. Dán câu lệnh sau rồi bấm Enter:
     ```powershell
     icacls "D:\GHobby" /grant "$($env:USERNAME):(OI)(CI)M" /T
     ```
  *(Lệnh này cấp quyền Modify cho đúng tên tài khoản đang đăng nhập của bạn, tự động áp dụng cho mọi thư mục con).*

- **Cách 2 (Thực hiện bằng chuột trong File Explorer)**:
  1. Mở File Explorer, tìm đến thư mục `D:\GHobby`.
  2. Nhấp chuột phải vào `GHobby` $\rightarrow$ Chọn **Properties**.
  3. Chọn thẻ **Security** $\rightarrow$ Bấm nút **Edit...**
  4. Nếu thấy tên tài khoản của bạn (ví dụ: `Admin` hoặc `AnhLy`): Chọn tên đó $\rightarrow$ Ở khung bên dưới, tích vào ô **Modify** (hoặc **Full control**) $\rightarrow$ Bấm **OK**.
  5. Nếu chưa có tên bạn: Bấm **Add...** $\rightarrow$ Nhập tên người dùng máy bạn vào ô $\rightarrow$ Bấm **Check Names** $\rightarrow$ Bấm **OK** $\rightarrow$ Tích chọn ô **Modify** $\rightarrow$ Bấm **OK**.

---

## 8. LỘ TRÌNH 5 LÁT CẮT TRIỂN KHAI (BUILD SLICES)

- **Lát 1: Khung Next.js App Router, Prisma ORM, Trang chủ & Chi tiết sản phẩm chuẩn SEO (SSR)**
  - Cấu hình Next.js với Tailwind CSS build tĩnh.
  - Cấu hình Prisma kết nối Database, chạy migration và nạp 10 mẫu Gunpla mẫu (HG Aerial, RG Hi-Nu, MG Barbatos, PG Unleashed RX-78-2...).
  - Trang chủ SSR, Danh mục SSR, Chi tiết sản phẩm SSR với đầy đủ thẻ Meta, Open Graph, thẻ H1 duy nhất và Schema JSON-LD.
  - *Verify*: Chạy `npm run build && npm run start`, dùng `curl` kiểm tra mã nguồn HTML có sẵn toàn bộ thẻ SEO và dữ liệu sản phẩm mà không cần chạy JS.
- **Lát 2: Trang quản trị (/admin), Bảo mật đăng nhập, Quản lý sản phẩm & Upload ảnh Supabase**
  - Trang `/admin` cấu hình `noindex` và chặn trong `robots.txt`.
  - Đăng nhập bảo mật: Đọc `ADMIN_INITIAL_PASSWORD` từ `.env`, bắt đổi mật khẩu lần đầu, mã hoá bcrypt, Cookie HttpOnly.
  - Route Handler upload ảnh: Kiểm tra magic bytes, giới hạn 5MB, đổi tên UUID, đẩy lên Supabase Storage qua Service Role Key.
  - Form thêm/sửa/ẩn sản phẩm (chọn Grade, Hãng, Scale, Series, SKU, Giá, Ảnh, Loại hàng có sẵn hay Pre-order).
  - *Verify*: Thử đăng nhập, đổi mật khẩu, upload 1 file ảnh thật và thử upload 1 file giả mạo đuôi ảnh xem có bị chặn không.
- **Lát 3: Nghiệp vụ Kho an toàn (Transaction), Lịch sử biến động, Cảnh báo tồn & Bộ test tự động**
  - Xây dựng các hàm Nhập kho (`IMPORT`), Xuất thủ công (`EXPORT_MANUAL`, `ADJUST`, `DAMAGED`, `WARRANTY`).
  - Toàn bộ thay đổi kho bọc trong Prisma Transaction, chống âm kho tuyệt đối.
  - Bảng lịch sử xuất nhập kho chi tiết và cảnh báo sắp hết hàng trực quan khi tồn $\le$ ngưỡng tối thiểu.
  - Chạy bộ Test tự động (Test 1: Chống âm kho, Test 2: Hoàn kho 1 lần, Test 3: Tranh chấp 2 người mua món cuối).
  - *Verify*: Chạy `npm test` và báo cáo kết quả thực tế của 3 bài test logic kho.
- **Lát 4: Giỏ hàng, Đặt đơn hàng, Cọc 10%, Mã VietQR, Trừ kho tự động & Huỷ sau 24h**
  - Giỏ hàng kiểm tra tồn kho thời gian thực; Server luôn tự lấy đơn giá từ DB.
  - Trang thanh toán: Chọn Nội thành (phí thỏa thuận Zalo) hoặc Ngoại thành (20k). Tính cọc 10% trên tiền hàng.
  - Sinh mã VietQR chuyển khoản tự động kèm mã đơn `#GHB-XXXXXX`. Đặt đơn thành công tự động trừ tồn kho.
  - Tác vụ tự động quét đơn quá 24h chưa cọc để huỷ và hoàn kho.
  - Trang Admin duyệt cọc và quản lý trạng thái đơn hàng.
  - *Verify*: Thử đặt 1 đơn hàng $\rightarrow$ kiểm tra tồn kho bị trừ; thử huỷ đơn $\rightarrow$ kiểm tra kho được hoàn đúng 1 lần; thử gọi huỷ lần 2 xem có bị chặn không.
- **Lát 5: Trang 404, Giao diện Mobile-first, Tự động Sitemap/Robots, Đo kiểm SEO & Hoàn thiện**
  - Trang 404 trả đúng mã trạng thái HTTP 404; trang sản phẩm hết hàng hiển thị gợi ý.
  - Tự động xuất `sitemap.xml` và `robots.txt` từ Database.
  - Kiểm tra và tinh chỉnh giao diện Mobile-first.
  - Tạo file `run.bat` để bạn chỉ cần nhấp đúp là khởi động dự án trên Windows.
  - *Verify*: Kiểm tra toàn diện trên Desktop và thiết bị di động, kiểm tra tính hợp lệ của sitemap.xml.

---

## 9. CÂU HỎI CÒN MỞ (BẠN VUI LÒNG CHO Ý KIẾN KHI DUYỆT)
1. **Lựa chọn Cơ sở dữ liệu**: Bạn muốn dùng **Phương án A (PostgreSQL trên Supabase Cloud - Khuyên dùng vì đi chung với nơi lưu ảnh)** hay **Phương án B (PostgreSQL chạy cục bộ trên máy tính của bạn)**?
2. **Khu vực Nội thành của Shop**: Shop của bạn đặt tại tỉnh/thành phố nào (Hồ Chí Minh, Hà Nội, hay tỉnh khác) để tôi cấu hình sẵn danh sách các quận Nội thành mặc định?
3. **Thông tin ngân hàng nhận cọc**: Bạn dự kiến dùng ngân hàng nào (ví dụ: MB Bank, Vietcombank, Techcombank...), Số tài khoản và Tên chủ tài khoản là gì để tôi đưa vào file mẫu cấu hình VietQR?
