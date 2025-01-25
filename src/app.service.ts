import { Injectable } from '@nestjs/common';
import { PrismaService } from './utils/services/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

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
}
