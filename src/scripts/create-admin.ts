import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "admin123";
  const phone = "0999999999";
  const fullName = "Quản trị viên GHobby";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      phone,
      fullName,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false,
    },
    create: {
      username,
      passwordHash,
      phone,
      fullName,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log("Đã tạo/reset tài khoản Admin thành công:");
  console.log("Username:", user.username);
  console.log("Password:", password);
  console.log("Role:", user.role);
  console.log("Phone:", user.phone);
}

main()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
