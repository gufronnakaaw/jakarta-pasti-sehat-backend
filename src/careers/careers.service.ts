import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { getOrderBy, slug } from '../utils/string.util';
import {
  CareerQuery,
  CreateCareerApplDto,
  CreateCareerDto,
  UpdateCarApplDto,
  UpdateCareerDto,
} from './careers.dto';

@Injectable()
export class CareersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getPublicCareers(query: CareerQuery) {
    const default_page = 1;
    const take = 6;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_careers, careers] = await this.prisma.$transaction([
      this.prisma.career.count({
        where: {
          is_active: true,
          AND:
            query.filter && !['asc', 'desc'].includes(query.filter)
              ? query.filter === 'other'
                ? { pillar_id: null, sub_pillar_id: null }
                : {
                    OR: [
                      {
                        title: { contains: query.filter },
                      },
                      {
                        pillar: {
                          slug: { contains: query.filter },
                        },
                      },
                      {
                        subpillar: {
                          slug: { contains: query.filter },
                        },
                      },
                    ],
                  }
              : {},
        },
        orderBy: getOrderBy(query.filter),
      }),
      this.prisma.career.findMany({
        where: {
          is_active: true,
          AND:
            query.filter && !['asc', 'desc'].includes(query.filter)
              ? query.filter === 'other'
                ? { pillar_id: null, sub_pillar_id: null }
                : {
                    OR: [
                      {
                        title: { contains: query.filter },
                      },
                      {
                        pillar: {
                          slug: { contains: query.filter },
                        },
                      },
                      {
                        subpillar: {
                          slug: { contains: query.filter },
                        },
                      },
                    ],
                  }
              : {},
        },
        select: {
          slug: true,
          title: true,
          location: true,
          type: true,
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
        orderBy: getOrderBy(query.filter),
        take,
        skip,
      }),
    ]);

    return {
      careers: careers.map((vol) => {
        return {
          ...vol,
          pillar: vol.pillar ? vol.pillar.name : 'Lainnya',
          subpillar: vol.subpillar ? vol.subpillar.name : 'Lainnya',
        };
      }),
      page: careers.length ? page : 0,
      total_careers,
      total_pages: Math.ceil(total_careers / take),
    };
  }

  async getCareers(query: CareerQuery) {
    const default_page = 1;
    const take = 8;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_careers, careers] = await this.prisma.$transaction([
      this.prisma.career.count({
        where: {
          title: {
            contains: query.q,
          },
        },
      }),
      this.prisma.career.findMany({
        where: {
          title: {
            contains: query.q,
          },
        },
        select: {
          career_id: true,
          slug: true,
          title: true,
          created_at: true,
          is_active: true,
          carappl: {
            select: {
              car_appl_id: true,
            },
          },
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
        take,
        skip,
      }),
    ]);

    return {
      careers: careers.map((vol) => {
        const { carappl, ...all } = vol;

        return {
          ...all,
          total_carappls: carappl.length,
        };
      }),
      page: careers.length ? page : 0,
      total_careers,
      total_pages: Math.ceil(total_careers / take),
    };
  }

  async getPublicCareer(id_or_slug: string) {
    const career = await this.prisma.career.findFirst({
      where: {
        OR: [
          {
            career_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        career_id: true,
        slug: true,
        title: true,
        location: true,
        type: true,
        requirements: true,
        responsibilities: true,
        created_at: true,
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
    });

    return {
      ...career,
      pillar: career.pillar ? career.pillar.name : 'Lainnya',
      subpillar: career.subpillar ? career.subpillar.name : 'Lainnya',
    };
  }

  async getCareer(id_or_slug: string) {
    const career = await this.prisma.career.findFirst({
      where: {
        OR: [
          {
            career_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        career_id: true,
        slug: true,
        title: true,
        type: true,
        location: true,
        requirements: true,
        responsibilities: true,
        created_at: true,
        pillar: {
          select: {
            pillar_id: true,
            name: true,
          },
        },
        subpillar: {
          select: {
            sub_pillar_id: true,
            name: true,
          },
        },
        carappl: {
          select: {
            car_appl_id: true,
            fullname: true,
            email: true,
            address: true,
            phone_number: true,
            instagram_url: true,
            portofolio_url: true,
            cv_url: true,
            uploaded_at: true,
            is_approved: true,
            approved_by: true,
          },
          orderBy: {
            uploaded_at: 'desc',
          },
        },
      },
    });

    const { carappl, ...all } = career;
    delete career.carappl;

    return {
      ...all,
      carappls: carappl,
      pillar: career.pillar ? career.pillar : 'Lainnya',
      subpillar: career.subpillar ? career.subpillar : 'Lainnya',
    };
  }

  createCareer(body: CreateCareerDto) {
    return this.prisma.career.create({
      data: {
        career_id: `${PREFIX['CAREER']}${random(100000, 999999)}`,
        slug: slug(body.title),
        title: body.title,
        location: body.location,
        type: body.type,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        career_id: true,
      },
    });
  }

  async updateCareer(body: UpdateCareerDto) {
    if (
      !(await this.prisma.career.count({
        where: { career_id: body.career_id },
      }))
    ) {
      throw new NotFoundException('Karir tidak ditemukan');
    }

    return this.prisma.career.update({
      where: { career_id: body.career_id },
      data: {
        slug: body.title ? slug(body.title) : undefined,
        title: body.title,
        location: body.location,
        type: body.type,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        pillar_id: body.pillar_id ? body.pillar_id : null,
        sub_pillar_id: body.sub_pillar_id ? body.sub_pillar_id : null,
        updated_by: body.by,
        is_active: body.is_active,
      },
      select: {
        career_id: true,
      },
    });
  }

  async deleteCareer(career_id: string) {
    const career = await this.prisma.career.findUnique({
      where: { career_id },
      select: {
        carappl: {
          select: {
            cv_key: true,
          },
        },
      },
    });

    if (!career) {
      throw new NotFoundException('Karir tidak ditemukan');
    }

    for (const carappl of career.carappl) {
      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: carappl.cv_key,
      });
    }

    return this.prisma.career.delete({
      where: { career_id },
      select: {
        career_id: true,
      },
    });
  }

  async createCarAppl(body: CreateCareerApplDto, file: Express.Multer.File) {
    const cv_key = `career_cvs/${Date.now()}-${file.originalname}`;

    try {
      const url = await this.storage.uploadFile({
        buffer: file.buffer,
        bucket: 'jakartapastisehat',
        key: cv_key,
        mimetype: file.mimetype,
      });

      return this.prisma.careerApplicant.create({
        data: {
          career_id: body.career_id,
          car_appl_id: `JPSCARAPPL${random(100000, 999999)}`,
          fullname: body.fullname,
          address: body.address,
          phone_number: body.phone_number,
          email: body.email,
          cv_key,
          cv_url: url,
          instagram_url: body.instagram_url,
          portofolio_url: body.portofolio_url,
        },
        select: {
          car_appl_id: true,
        },
      });
    } catch (error) {
      this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: cv_key,
      });

      throw error;
    }
  }

  async updateCarAppl(body: UpdateCarApplDto) {
    const carappl = await this.prisma.careerApplicant.findUnique({
      where: { car_appl_id: body.car_appl_id },
      select: {
        is_approved: true,
      },
    });

    if (!carappl) {
      throw new NotFoundException('Volunteer tidak ditemukan');
    }

    return this.prisma.careerApplicant.update({
      where: { car_appl_id: body.car_appl_id },
      data: {
        is_approved: !carappl.is_approved,
        approved_by: body.by,
      },
      select: {
        car_appl_id: true,
      },
    });
  }
}
