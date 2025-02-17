import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './app.dto';
import { verifyPassword } from './utils/bcrypt.util';
import { decryptText } from './utils/encrypt.util';
import { PrismaService } from './utils/services/prisma.service';
import { StorageService } from './utils/services/storage.service';
import { getReadingTimeFromHTML, getStatus } from './utils/string.util';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private storage: StorageService,
  ) {}

  async getHomepageData() {
    const [articles, banners, events, teams, partners] =
      await this.prisma.$transaction([
        this.prisma.article.findMany({
          where: {
            is_active: true,
          },
          select: {
            article_id: true,
            slug: true,
            pillar: {
              select: {
                name: true,
              },
            },
            subpillar: {
              select: {
                name: true,
              },
            },
            content: true,
            title: true,
            description: true,
            image_url: true,
            created_at: true,
          },
          take: 4,
          orderBy: {
            created_at: 'desc',
          },
        }),
        this.prisma.banner.findMany({
          select: {
            banner_id: true,
            alt: true,
            description: true,
            image_url: true,
          },
        }),
        this.prisma.event.findMany({
          where: {
            is_active: true,
          },
          select: {
            event_id: true,
            slug: true,
            image_url: true,
            title: true,
            start: true,
            end: true,
            pillar: {
              select: {
                name: true,
              },
            },
            subpillar: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 4,
        }),
        this.prisma.team.findMany({
          select: {
            fullname: true,
            image_url: true,
            position: {
              select: {
                name: true,
              },
            },
          },
          take: 7,
          orderBy: {
            created_at: 'asc',
          },
        }),
        this.prisma.partner.findMany({
          select: {
            partner_id: true,
            alt: true,
            description: true,
            image_url: true,
          },
        }),
      ]);

    return {
      articles: articles.map((article) => {
        return {
          ...article,
          pillar: article.pillar ? article.pillar.name : 'Lainnya',
          subpillar: article.subpillar ? article.subpillar.name : 'Lainnya',
          reading_time: getReadingTimeFromHTML(article.content),
        };
      }),
      banners,
      events: events.map((event) => {
        return {
          ...event,
          status: getStatus(event.start, event.end),
          pillar: event.pillar ? event.pillar.name : 'Lainnya',
          subpillar: event.subpillar ? event.subpillar.name : 'Lainnya',
        };
      }),
      teams: teams.map((team) => {
        return {
          ...team,
          position: team.position.name,
        };
      }),
      partners,
    };
  }

  async adminLogin(body: AdminLoginDto) {
    const keys = await this.prisma.accessKey.findMany({
      select: {
        value: true,
      },
    });

    if (
      !keys
        .map((key) => decryptText(key.value, process.env.ENCRYPT_KEY))
        .includes(body.access_key)
    ) {
      throw new BadRequestException('Akses key salah');
    }

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

  async getDashboard() {
    const [
      total_articles,
      total_events,
      total_volunteers,
      total_partners,
      total_volappls,
    ] = await this.prisma.$transaction([
      this.prisma.article.count(),
      this.prisma.event.count(),
      this.prisma.volunteer.count(),
      this.prisma.partner.count(),
      this.prisma.volunteerApplicant.count(),
    ]);

    return {
      total_articles,
      total_events,
      total_volunteers,
      total_partners,
      total_volappls,
      total_crrappls: 0,
    };
  }

  uploadContentImage(file: Express.Multer.File) {
    return this.storage.uploadFile({
      buffer: file.buffer,
      bucket: 'jakartapastisehat',
      key: `contents/${Date.now()}-contents-${file.originalname}`,
      mimetype: file.mimetype,
    });
  }
}
