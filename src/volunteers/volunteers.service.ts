import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { getOrderBy, slug } from '../utils/string.util';
import {
  CreateVolApplDto,
  CreateVolDto,
  UpdateVolApplDto,
  UpdateVolDto,
  VolsQuery,
} from './volunteers.dto';

@Injectable()
export class VolunteersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getPublicVols(query: VolsQuery) {
    const default_page = 1;
    const take = 8;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_vols, vols] = await this.prisma.$transaction([
      this.prisma.volunteer.count({
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
      this.prisma.volunteer.findMany({
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
          volunteer_id: true,
          slug: true,
          title: true,
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
        orderBy: getOrderBy(query.filter),
        take,
        skip,
      }),
    ]);

    return {
      vols: vols.map((vol) => {
        return {
          ...vol,
          pillar: vol.pillar ? vol.pillar.name : 'Lainnya',
          subpillar: vol.subpillar ? vol.subpillar.name : 'Lainnya',
        };
      }),
      page: vols.length ? page : 0,
      total_vols,
      total_pages: Math.ceil(total_vols / take),
    };
  }

  async getVols(query: VolsQuery) {
    const default_page = 1;
    const take = 8;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_vols, vols] = await this.prisma.$transaction([
      this.prisma.volunteer.count({
        where: {
          title: {
            contains: query.q,
          },
        },
      }),
      this.prisma.volunteer.findMany({
        where: {
          title: {
            contains: query.q,
          },
        },
        select: {
          volunteer_id: true,
          slug: true,
          title: true,
          created_at: true,
          volappl: {
            select: {
              vol_appl_id: true,
            },
          },
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
        },
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      vols: vols.map((vol) => {
        const { volappl, ...all } = vol;

        return {
          ...all,
          total_volappls: volappl.length,
        };
      }),
      page: vols.length ? page : 0,
      total_vols,
      total_pages: Math.ceil(total_vols / take),
    };
  }

  async getPublicVol(id_or_slug: string) {
    const vol = await this.prisma.volunteer.findFirst({
      where: {
        OR: [
          {
            volunteer_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        volunteer_id: true,
        slug: true,
        title: true,
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
      ...vol,
      pillar: vol.pillar ? vol.pillar.name : 'Lainnya',
      subpillar: vol.subpillar ? vol.subpillar.name : 'Lainnya',
    };
  }

  async getVol(id_or_slug: string) {
    const vol = await this.prisma.volunteer.findFirst({
      where: {
        OR: [
          {
            volunteer_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        volunteer_id: true,
        slug: true,
        title: true,
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
        volappl: {
          select: {
            vol_appl_id: true,
            fullname: true,
            email: true,
            institution: true,
            level: true,
            study_program: true,
            reason: true,
            cv_url: true,
            follow_url: true,
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

    const { volappl, ...all } = vol;
    delete vol.volappl;

    return {
      ...all,
      volappls: volappl,
      pillar: vol.pillar ? vol.pillar.name : 'Lainnya',
      subpillar: vol.subpillar ? vol.subpillar.name : 'Lainnya',
    };
  }

  createVol(body: CreateVolDto) {
    return this.prisma.volunteer.create({
      data: {
        volunteer_id: `${PREFIX['VOLUNTEER']}${random(100000, 999999)}`,
        title: body.title,
        slug: slug(body.title),
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        volunteer_id: true,
      },
    });
  }

  async updateVol(body: UpdateVolDto) {
    if (
      !(await this.prisma.volunteer.count({
        where: { volunteer_id: body.volunteer_id },
      }))
    ) {
      throw new NotFoundException('Volunteer tidak ditemukan');
    }

    return this.prisma.volunteer.update({
      where: { volunteer_id: body.volunteer_id },
      data: {
        title: body.title,
        slug: body.title ? slug(body.title) : undefined,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        updated_by: body.by,
        is_active: body.is_active,
      },
      select: {
        volunteer_id: true,
      },
    });
  }

  async deleteVol(volunteer_id: string) {
    const vol = await this.prisma.volunteer.findUnique({
      where: { volunteer_id },
      select: {
        volappl: {
          select: {
            cv_key: true,
            follow_key: true,
          },
        },
      },
    });

    if (!vol) {
      throw new NotFoundException('Volunteer tidak ditemukan');
    }

    for (const volappl of vol.volappl) {
      await Promise.all([
        this.storage.deleteFile({
          bucket: 'jakartapastisehat',
          key: volappl.cv_key,
        }),
        this.storage.deleteFile({
          bucket: 'jakartapastisehat',
          key: volappl.follow_key,
        }),
      ]);
    }

    return this.prisma.volunteer.delete({
      where: { volunteer_id },
      select: {
        volunteer_id: true,
      },
    });
  }

  async createVolAppl(
    body: CreateVolApplDto,
    files: {
      cv?: Express.Multer.File[];
      follow?: Express.Multer.File[];
    },
  ) {
    const cv = files.cv[0];
    const follow = files.follow[0];

    const cv_key = `vol_cvs/${Date.now()}-${cv.originalname}`;
    const follow_key = `vol_proofs/${Date.now()}-${follow.originalname}`;

    try {
      const [cv_url, follow_url] = await Promise.all([
        this.storage.uploadFile({
          buffer: cv.buffer,
          bucket: 'jakartapastisehat',
          key: cv_key,
          mimetype: cv.mimetype,
        }),
        this.storage.uploadFile({
          buffer: follow.buffer,
          bucket: 'jakartapastisehat',
          key: follow_key,
          mimetype: follow.mimetype,
        }),
      ]);

      return this.prisma.volunteerApplicant.create({
        data: {
          volunteer_id: body.volunteer_id,
          vol_appl_id: `JPSVOLAPPL${random(100000, 999999)}`,
          fullname: body.fullname,
          email: body.email,
          institution: body.institution,
          level: body.level,
          study_program: body.study_program,
          reason: body.reason,
          cv_key,
          cv_url,
          follow_key,
          follow_url,
        },
        select: {
          vol_appl_id: true,
        },
      });
    } catch (error) {
      await Promise.all([
        this.storage.deleteFile({
          bucket: 'jakartapastisehat',
          key: cv_key,
        }),
        this.storage.deleteFile({
          bucket: 'jakartapastisehat',
          key: follow_key,
        }),
      ]);

      throw error;
    }
  }

  async updateVolAppl(body: UpdateVolApplDto) {
    const volappl = await this.prisma.volunteerApplicant.findUnique({
      where: { vol_appl_id: body.vol_appl_id },
      select: {
        is_approved: true,
      },
    });

    if (!volappl) {
      throw new NotFoundException('Volunteer tidak ditemukan');
    }

    return this.prisma.volunteerApplicant.update({
      where: { vol_appl_id: body.vol_appl_id },
      data: {
        is_approved: !volappl.is_approved,
        approved_by: body.by,
      },
      select: {
        vol_appl_id: true,
      },
    });
  }
}
