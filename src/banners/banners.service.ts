import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { BannersQuery, CreateBannerDto, UpdateBannerDto } from './banners.dto';

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getBanners(query: BannersQuery) {
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
          link: true,
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
        link: true,
        created_at: true,
      },
    });
  }

  async createBanner(body: CreateBannerDto, file: Express.Multer.File) {
    const key = `banners/${Date.now()}-${file.originalname}`;

    const url = await this.storage.uploadFile({
      buffer: file.buffer,
      bucket: 'jakartapastisehat',
      key,
      mimetype: file.mimetype,
    });

    return this.prisma.banner.create({
      data: {
        banner_id: `${PREFIX['BANNER']}${random(10000, 99999)}`,
        image_url: url,
        image_key: key,
        alt: body.alt,
        description: body.description,
        link: body.link,
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        banner_id: true,
      },
    });
  }

  async updateBanner(body: UpdateBannerDto, file: Express.Multer.File) {
    const banner = await this.prisma.banner.findUnique({
      where: { banner_id: body.banner_id },
      select: { image_key: true },
    });

    if (!banner) {
      throw new NotFoundException('Banner tidak ditemukan');
    }

    if (file) {
      if (
        await this.storage.checkFile({
          bucket: 'jakartapastisehat',
          key: banner.image_key,
        })
      ) {
        await this.storage.deleteFile({
          bucket: 'jakartapastisehat',
          key: banner.image_key,
        });
      }

      const key = `banners/${Date.now()}-${file.originalname}`;

      const url = await this.storage.uploadFile({
        buffer: file.buffer,
        bucket: 'jakartapastisehat',
        key,
        mimetype: file.mimetype,
      });

      return this.prisma.banner.update({
        where: { banner_id: body.banner_id },
        data: {
          image_url: url,
          image_key: key,
          alt: body.alt,
          description: body.description,
          link: body.link,
          updated_by: body.by,
        },
        select: {
          banner_id: true,
        },
      });
    }

    return this.prisma.banner.update({
      where: { banner_id: body.banner_id },
      data: {
        alt: body.alt,
        description: body.description,
        link: body.link,
        updated_by: body.by,
      },
      select: {
        banner_id: true,
      },
    });
  }

  async deleteBanner(banner_id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { banner_id },
      select: { image_key: true },
    });

    if (!banner) {
      throw new NotFoundException('Banner tidak ditemukan');
    }

    if (
      await this.storage.checkFile({
        bucket: 'jakartapastisehat',
        key: banner.image_key,
      })
    ) {
      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: banner.image_key,
      });
    }

    return this.prisma.banner.delete({
      where: {
        banner_id,
      },
      select: {
        banner_id: true,
      },
    });
  }
}
