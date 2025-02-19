import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import {
  CreatePartnerDto,
  PartnersQuery,
  UpdatePartnerDto,
} from './partners.dto';

@Injectable()
export class PartnersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  getPublicPartners() {
    return this.prisma.partner.findMany({
      select: {
        partner_id: true,
        alt: true,
        description: true,
        image_url: true,
        created_at: true,
      },
    });
  }

  async getPartners(query: PartnersQuery) {
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

  async createPartner(body: CreatePartnerDto, file: Express.Multer.File) {
    const key = `partners/${Date.now()}-${file.originalname}`;

    const url = await this.storage.uploadFile({
      buffer: file.buffer,
      bucket: 'jakartapastisehat',
      key,
      mimetype: file.mimetype,
    });

    return this.prisma.partner.create({
      data: {
        partner_id: `${PREFIX['PARTNER']}${random(10000, 99999)}`,
        image_url: url,
        image_key: key,
        alt: body.alt,
        description: body.description,
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        partner_id: true,
      },
    });
  }

  async updatePartner(body: UpdatePartnerDto, file: Express.Multer.File) {
    const partner = await this.prisma.partner.findUnique({
      where: { partner_id: body.partner_id },
      select: { image_key: true },
    });

    if (!partner) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    if (file) {
      if (
        await this.storage.checkFile({
          bucket: 'jakartapastisehat',
          key: partner.image_key,
        })
      ) {
        await this.storage.deleteFile({
          bucket: 'jakartapastisehat',
          key: partner.image_key,
        });
      }

      const key = `partners/${Date.now()}-${file.originalname}`;

      const url = await this.storage.uploadFile({
        buffer: file.buffer,
        bucket: 'jakartapastisehat',
        key,
        mimetype: file.mimetype,
      });

      return this.prisma.partner.update({
        where: { partner_id: body.partner_id },
        data: {
          image_url: url,
          image_key: key,
          alt: body.alt,
          description: body.description,
          updated_by: body.by,
        },
        select: {
          partner_id: true,
        },
      });
    }

    return this.prisma.partner.update({
      where: { partner_id: body.partner_id },
      data: {
        alt: body.alt,
        description: body.description,
        updated_by: body.by,
      },
      select: {
        partner_id: true,
      },
    });
  }

  async deletePartner(partner_id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { partner_id },
      select: { image_key: true },
    });

    if (!partner) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    if (
      await this.storage.checkFile({
        bucket: 'jakartapastisehat',
        key: partner.image_key,
      })
    ) {
      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: partner.image_key,
      });
    }

    return this.prisma.partner.delete({
      where: { partner_id },
      select: { partner_id: true },
    });
  }
}
