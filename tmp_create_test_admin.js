const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
(async()=>{
  const username = 'test_admin_ui';
  const passwordHash = await bcrypt.hash('Test@123456', 10);
  const user = await p.user.upsert({
    where: { username },
    update: { passwordHash, role: 'ADMIN', isActive: true, mustChangePassword: false },
    create: { username, passwordHash, fullName: 'Test Admin UI', role: 'ADMIN', isActive: true, mustChangePassword: false },
  });
  console.log(user.id);
  await p.$disconnect();
})();
