import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { name: string; email: string; passwordHash: string; role?: Role; departmentId?: string }) {
    const existing = await this.findOneByEmail(data.email);
    if (existing) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashed = await bcrypt.hash(data.passwordHash, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        passwordHash: hashed,
        mustChangePassword: true, // Manual admin entry requires change on first login
      },
    });
  }

  async update(id: string, data: { name?: string; role?: Role; departmentId?: string | null }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async resetPassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashed,
        mustChangePassword: true,
      },
    });
  }

  async changeOwnPassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashed,
        mustChangePassword: false,
      },
    });
  }
}
