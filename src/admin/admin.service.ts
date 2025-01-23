import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { PrismaService } from '../utils/services/prisma.service';
import { AdminQuery } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getBanners(query: AdminQuery) {
    const default_page = 1;
    const take = 5;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_banners, banners] = await this.prisma.$transaction([
      this.prisma.banner.count(),
      this.prisma.banner.findMany({
        select: {
          banner_id: true,
          alt: true,
          description: true,
          image_url: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      banners,
      page: banners.length ? page : 0,
      total_banners,
      total_pages: Math.ceil(total_banners / take),
    };
  }

  getBanner(banner_id: string) {
    return this.prisma.banner.findUnique({
      where: {
        banner_id,
      },
      select: {
        banner_id: true,
        alt: true,
        description: true,
        image_url: true,
      },
    });
  }

  async deleteBanner(banner_id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { banner_id },
      select: { image_url: true },
    });

    if (!banner) {
      throw new NotFoundException('Banner tidak ditemukan');
    }

    const pathname = new URL(banner.image_url).pathname;
    const file_path = pathname.startsWith('/') ? pathname.slice(1) : pathname;

    if (existsSync(file_path)) {
      await unlink(file_path);
    }

    return this.prisma.banner.delete({
      where: { banner_id },
      select: { banner_id: true },
    });
  }

  async getPartners(query: AdminQuery) {
    const default_page = 1;
    const take = 5;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_partners, partners] = await this.prisma.$transaction([
      this.prisma.partner.count(),
      this.prisma.partner.findMany({
        select: {
          partner_id: true,
          alt: true,
          description: true,
          image_url: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      partners,
      page: partners.length ? page : 0,
      total_partners,
      total_pages: Math.ceil(total_partners / take),
    };
  }

  getPartner(partner_id: string) {
    return this.prisma.partner.findUnique({
      where: {
        partner_id,
      },
      select: {
        partner_id: true,
        alt: true,
        description: true,
        image_url: true,
      },
    });
  }

  async deletePartner(partner_id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { partner_id },
      select: { image_url: true },
    });

    if (!partner) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    const pathname = new URL(partner.image_url).pathname;
    const file_path = pathname.startsWith('/') ? pathname.slice(1) : pathname;

    if (existsSync(file_path)) {
      await unlink(file_path);
    }

    return this.prisma.partner.delete({
      where: { partner_id },
      select: { partner_id: true },
    });
  }
}
