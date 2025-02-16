import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { random } from 'lodash';
import { hashPassword } from '../utils/bcrypt.util';
import { PrismaService } from '../utils/services/prisma.service';
import { capitalize } from '../utils/string.util';
import { CreateAdminDto, UpdateAdminDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  getAdmins() {
    return this.prisma.admin.findMany({
      where: {
        admin_id: {
          not: 'JPSSA1',
        },
      },
      select: {
        admin_id: true,
        fullname: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async createAdmin(body: CreateAdminDto) {
    if (body.access_key !== process.env.ACCESS_KEY) {
      throw new ForbiddenException();
    }

    const admin_id =
      body.role === 'superadmin'
        ? `JPSSA${random(1000, 9999)}`
        : `JPSA${random(10000, 99999)}`;

    return this.prisma.admin.create({
      data: {
        admin_id,
        fullname: capitalize(body.fullname.toLowerCase()),
        password: await hashPassword(body.password),
        role: body.role,
      },
      select: {
        admin_id: true,
        fullname: true,
        role: true,
      },
    });
  }

  async updateAdmin(body: UpdateAdminDto) {
    if (body.access_key !== process.env.ACCESS_KEY) {
      throw new ForbiddenException();
    }

    if (
      !(await this.prisma.admin.count({ where: { admin_id: body.admin_id } }))
    ) {
      throw new NotFoundException('Admin tidak ditemukan');
    }

    return this.prisma.admin.update({
      where: {
        admin_id: body.admin_id,
      },
      data: {
        fullname: capitalize(body.fullname.toLowerCase()),
        password: body.password ? await hashPassword(body.password) : undefined,
        role: body.role,
      },
      select: {
        admin_id: true,
        fullname: true,
        role: true,
      },
    });
  }

  async deleteAdmin(admin_id: string) {
    if (!(await this.prisma.admin.count({ where: { admin_id } }))) {
      throw new NotFoundException('Admin tidak ditemukan');
    }

    return this.prisma.admin.delete({
      where: {
        admin_id,
      },
      select: {
        fullname: true,
        admin_id: true,
      },
    });
  }

  getAdmin(admin_id: string) {
    return this.prisma.admin.findUnique({
      where: {
        admin_id,
      },
      select: {
        admin_id: true,
        fullname: true,
        role: true,
      },
    });
  }
}
