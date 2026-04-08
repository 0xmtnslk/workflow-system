"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const superAdminEmail = 'admin@gws.com';
    const superAdminPassword = 'adminpassword';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    const existingAdmin = await prisma.user.findUnique({
        where: { email: superAdminEmail },
    });
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
    const itDept = await prisma.department.findFirst({
        where: { name: 'Bilgi İşlem' }
    }) || await prisma.department.create({ data: { name: 'Bilgi İşlem' } });
    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                email: superAdminEmail,
                name: 'Super Admin',
                passwordHash: hashedPassword,
                role: client_1.Role.SUPER_ADMIN,
                departmentId: itDept.id,
            },
        });
        console.log('Super Admin created successfully');
        console.log('Email: admin@gws.com');
        console.log('Password: adminpassword');
    }
    else {
        console.log('Super Admin already exists');
    }
    console.log('Departments seeded successfully');
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
//# sourceMappingURL=seed.js.map