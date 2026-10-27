import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'admin'
  const password = 'Admin@123456'
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash,
      fullName: 'Quản trị viên GHobby',
      role: 'ADMIN',
      mustChangePassword: true
    }
  })

  console.log('Đã tạo tài khoản admin thành công!')
  console.log('Username:', username)
  console.log('Password:', password)
  console.log('Vui lòng đổi mật khẩu ngay sau khi đăng nhập.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
