import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'admin@gws.com';
  const superAdminPassword = 'adminpassword';
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Check if super admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  // Create departments
  const departments = [
    'İnsan Kaynakları',
    'Bilgi İşlem',
    'Satın Alma',
    'Muhasebe',
    'İdari İşler',
    'Tıbbi Hizmetler'
  ];

  for (const deptName of departments) {
    const deptId = deptName.toLowerCase().replace(/ /g, '-');
    await prisma.department.upsert({
      where: { id: deptId },
      update: { name: deptName },
      create: { 
        id: deptId,
        name: deptName 
      },
    });
  }

  // Re-fetch IT department for Admin association
  const itDept = await prisma.department.findFirst({
    where: { name: 'Bilgi İşlem' }
  }) || await prisma.department.create({ data: { name: 'Bilgi İşlem' } });

  if (!existingAdmin) {
    // Create Super Admin
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: 'Super Admin',
        passwordHash: hashedPassword,
        role: Role.SUPER_ADMIN,
        departmentId: itDept.id,
      },
    });

    console.log('Super Admin created successfully');
    console.log('Email: admin@gws.com');
    console.log('Password: adminpassword');
  } else {
    console.log('Super Admin already exists');
  }

  console.log('Departments seeded successfully');

  // Initial System Config
  const existingConfig = await prisma.systemConfig.findUnique({
    where: { id: 'default' },
  });

  if (!existingConfig) {
    await prisma.systemConfig.create({
      data: {
        id: 'default',
        smtpFromName: 'GWS System',
        smtpFromEmail: 'no-reply@gws.com',
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
      },
    });
    console.log('Initial System Config created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
