import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { slug } from '../utils/string.util';
import { CreatePillarDto, PillarsQuery, UpdatePillarDto } from './pillars.dto';

@Injectable()
export class PillarsService {
  constructor(private prisma: PrismaService) {}

  async getPublicPillars() {
    const pillars = await this.prisma.pillar.findMany({
      select: {
        name: true,
        slug: true,
        subpillar: {
          select: {
            name: true,
            slug: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return pillars.map((pillar) => {
      const { subpillar, ...all } = pillar;

      return {
        ...all,
        subpillars: subpillar,
      };
    });
  }

  async getPillars(query: PillarsQuery) {
    const default_page = 1;
    const take = 5;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_pillars, pillars] = await this.prisma.$transaction([
      this.prisma.pillar.count(),
      this.prisma.pillar.findMany({
        select: {
          pillar_id: true,
          name: true,
          created_at: true,
        },
        orderBy: {
          name: 'asc',
        },
        take,
        skip,
      }),
    ]);

    return {
      pillars,
      page: pillars.length ? page : 0,
      total_pillars,
      total_pages: Math.ceil(total_pillars / take),
    };
  }

  async getPillar(pillar_id: string) {
    const pillar = await this.prisma.pillar.findUnique({
      where: {
        pillar_id,
      },
      select: {
        pillar_id: true,
        name: true,
        created_at: true,
        subpillar: {
          select: {
            sub_pillar_id: true,
            name: true,
            created_at: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!pillar) {
      return {};
    }

    return {
      pillar_id: pillar.pillar_id,
      name: pillar.name,
      created_at: pillar.created_at,
      subpillars: pillar.subpillar,
    };
  }

  createPillar(body: CreatePillarDto) {
    return this.prisma.pillar.create({
      data: {
        pillar_id: `${PREFIX['PILLAR']}${random(1000, 9999)}`,
        name: body.name,
        slug: slug(body.name),
        created_by: body.by,
        updated_by: body.by,
        subpillar: {
          createMany: {
            data: body.subpillars.map((subpillar) => {
              return {
                sub_pillar_id: `${PREFIX['SUBPILLAR']}${random(1000, 9999)}`,
                name: subpillar,
                slug: slug(subpillar),
                created_by: body.by,
                updated_by: body.by,
              };
            }),
          },
        },
      },
      select: {
        pillar_id: true,
      },
    });
  }

  async updatePillar(body: UpdatePillarDto) {
    if (
      !(await this.prisma.pillar.count({
        where: { pillar_id: body.pillar_id },
      }))
    ) {
      throw new NotFoundException('Pilar tidak ditemukan');
    }

    if (body.subpillars) {
      if (body.subpillars.length) {
        const promises = [];

        for (const subpillar of body.subpillars) {
          promises.push(
            this.prisma.subPillar.upsert({
              where: {
                sub_pillar_id: subpillar.sub_pillar_id,
              },
              update: {
                name: subpillar.name,
                slug: subpillar.name ? slug(subpillar.name) : undefined,
                updated_by: body.by,
              },
              create: {
                pillar_id: body.pillar_id,
                sub_pillar_id: `${PREFIX['SUBPILLAR']}${random(1000, 9999)}`,
                name: subpillar.name,
                slug: slug(subpillar.name),
                created_by: body.by,
                updated_by: body.by,
              },
            }),
          );
        }

        await Promise.all([
          ...promises,
          this.prisma.pillar.update({
            where: { pillar_id: body.pillar_id },
            data: {
              name: body.name,
              slug: body.name ? slug(body.name) : undefined,
              updated_by: body.by,
            },
          }),
        ]);

        return {
          pillar_id: body.pillar_id,
        };
      }
    }

    return this.prisma.pillar.update({
      where: {
        pillar_id: body.pillar_id,
      },
      data: {
        name: body.name,
        slug: body.name ? slug(body.name) : undefined,
        updated_by: body.by,
      },
      select: {
        pillar_id: true,
      },
    });
  }

  async deletePillar(pillar_id: string) {
    if (!(await this.prisma.pillar.count({ where: { pillar_id } }))) {
      throw new NotFoundException('Pilar tidak ditemukan');
    }

    return this.prisma.pillar.delete({
      where: {
        pillar_id,
      },
      select: {
        pillar_id: true,
      },
    });
  }
}
