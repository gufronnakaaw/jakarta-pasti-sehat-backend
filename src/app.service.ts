import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './app.dto';
import { verifyPassword } from './utils/bcrypt.util';
import { PrismaService } from './utils/services/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getHomepageData() {
    const [banners, partners] = await Promise.all([
      this.getBanners(),
      this.getPartners(),
    ]);

    return {
      articles: [],
      banners,
      events: [],
      teams: [],
      partners,
    };
  }

  getBanners() {
    return this.prisma.banner.findMany({
      select: {
        banner_id: true,
        alt: true,
        description: true,
        image_url: true,
      },
    });
  }

  getPartners() {
    return this.prisma.partner.findMany({
      select: {
        partner_id: true,
        alt: true,
        description: true,
        image_url: true,
      },
    });
  }

  async adminLogin(body: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        admin_id: body.admin_id,
      },
      select: {
        admin_id: true,
        fullname: true,
        role: true,
        password: true,
      },
    });

    if (!admin) {
      throw new BadRequestException('Admin ID atau password salah');
    }

    if (!(await verifyPassword(body.password, admin.password))) {
      throw new BadRequestException('Admin ID atau password salah');
    }

    return {
      admin_id: admin.admin_id,
      fullname: admin.fullname,
      access_token: await this.jwtService.signAsync({
        admin_id: admin.admin_id,
        role: admin.role,
      }),
    };
  }

  getDashboard() {
    return {
      total_volunteers: 0,
      total_events: 0,
      total_articles: 0,
      total_applicants: 0,
    };
  }
}
