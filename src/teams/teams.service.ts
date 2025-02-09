import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import {
  EDUCATIONORDER,
  PREFIX,
  SOCIALMEDIAORDER,
} from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { CreateTeamsDto, TeamsQuery, UpdateTeamsDto } from './teams.dto';

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getTeams(query: TeamsQuery) {
    const default_page = 1;
    const take = 5;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_teams, teams] = await this.prisma.$transaction([
      this.prisma.team.count(),
      this.prisma.team.findMany({
        select: {
          team_id: true,
          fullname: true,
          image_url: true,
          created_at: true,
          position: {
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
      teams: teams.map((team) => {
        return {
          team_id: team.team_id,
          fullname: team.fullname,
          position: team.position.name,
          image_url: team.image_url,
          created_at: team.created_at,
        };
      }),
      page: teams.length ? page : 0,
      total_teams,
      total_pages: Math.ceil(total_teams / take),
    };
  }

  async getPublicTeams() {
    const teams = await this.prisma.team.findMany({
      select: {
        team_id: true,
        fullname: true,
        image_url: true,
        position: {
          select: {
            name: true,
          },
        },
      },
    });

    return teams.map((team) => {
      return {
        team_id: team.team_id,
        fullname: team.fullname,
        position: team.position.name,
        image_url: team.image_url,
      };
    });
  }

  async getTeam(team_id: string) {
    const team = await this.prisma.team.findUnique({
      where: {
        team_id,
      },
      select: {
        team_id: true,
        fullname: true,
        description: true,
        image_url: true,
        position: {
          select: {
            name: true,
          },
        },
        education: {
          select: {
            education_id: true,
            name: true,
            level: true,
          },
          orderBy: {
            order: 'desc',
          },
        },
        socmed: {
          select: {
            socmed_id: true,
            name: true,
            url: true,
          },
          orderBy: {
            order: 'desc',
          },
        },
      },
    });

    return {
      team_id: team.team_id,
      fullname: team.fullname,
      description: team.description,
      image_url: team.image_url,
      position: team.position.name,
      educations: team.education,
      social_links: team.socmed,
    };
  }

  async createTeams(body: CreateTeamsDto, file: Express.Multer.File) {
    const key = `teams/${Date.now()}-${file.originalname}`;

    const url = await this.storage.uploadFile({
      buffer: file.buffer,
      bucket: 'jakartapastisehat',
      key,
      mimetype: file.mimetype,
    });

    try {
      return this.prisma.team.create({
        data: {
          team_id: `${PREFIX['TEAM']}${random(100000, 999999)}`,
          position_id: body.position_id,
          fullname: body.fullname,
          description: body.description,
          image_key: key,
          image_url: url,
          created_by: body.by,
          updated_by: body.by,
          education:
            body.with_education == 'true'
              ? {
                  createMany: {
                    data: body.educations.map((education) => {
                      return {
                        education_id: `${PREFIX['EDUCATION']}${random(100000, 999999)}`,
                        name: education.name,
                        level: education.level,
                        order: EDUCATIONORDER[education.level],
                      };
                    }),
                  },
                }
              : undefined,
          socmed:
            body.with_social_links == 'true'
              ? {
                  createMany: {
                    data: body.social_links.map((socmed) => {
                      return {
                        socmed_id: `${PREFIX['SOCIAL_MEDIA']}${random(100000, 999999)}`,
                        name: socmed.name,
                        order: SOCIALMEDIAORDER[socmed.name],
                        url: socmed.url,
                      };
                    }),
                  },
                }
              : undefined,
        },
        select: {
          team_id: true,
        },
      });
    } catch (error) {
      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key,
      });

      throw error;
    }
  }

  async updateTeams(body: UpdateTeamsDto, file: Express.Multer.File) {
    const team = await this.prisma.team.findUnique({
      where: {
        team_id: body.team_id,
      },
      select: {
        image_key: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    const education_promises = [];
    const social_promises = [];

    if (body.educations) {
      for (const education of body.educations) {
        education_promises.push(
          this.prisma.education.upsert({
            where: {
              education_id: education.education_id,
            },
            update: {
              name: education.name,
              level: education.level,
              order: EDUCATIONORDER[education.level],
            },
            create: {
              team_id: body.team_id,
              education_id: `${PREFIX['EDUCATION']}${random(100000, 999999)}`,
              name: education.name,
              level: education.level,
              order: EDUCATIONORDER[education.level],
            },
          }),
        );
      }
    }

    if (body.social_links) {
      for (const social of body.social_links) {
        social_promises.push(
          this.prisma.socialMedia.upsert({
            where: {
              socmed_id: social.socmed_id,
            },
            update: {
              name: social.name,
              order: SOCIALMEDIAORDER[social.name],
              url: social.url,
            },
            create: {
              team_id: body.team_id,
              socmed_id: `${PREFIX['SOCIAL_MEDIA']}${random(100000, 999999)}`,
              name: social.name,
              order: SOCIALMEDIAORDER[social.name],
              url: social.url,
            },
          }),
        );
      }
    }

    if (file) {
      const key = `teams/${Date.now()}-${file.originalname}`;

      const url = await this.storage.uploadFile({
        buffer: file.buffer,
        bucket: 'jakartapastisehat',
        key,
        mimetype: file.mimetype,
      });

      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: team.image_key,
      });

      await Promise.all([...education_promises, ...social_promises]);

      return this.prisma.team.update({
        where: {
          team_id: body.team_id,
        },
        data: {
          position_id: body.position_id,
          fullname: body.fullname,
          description: body.description,
          image_key: key,
          image_url: url,
          updated_by: body.by,
        },
        select: {
          team_id: true,
        },
      });
    }

    await Promise.all([...education_promises, ...social_promises]);

    return this.prisma.team.update({
      where: {
        team_id: body.team_id,
      },
      data: {
        position_id: body.position_id,
        fullname: body.fullname,
        description: body.description,
        updated_by: body.by,
      },
      select: {
        team_id: true,
      },
    });
  }

  async deleteTeam(team_id: string) {
    const team = await this.prisma.team.findUnique({
      where: { team_id },
      select: { image_key: true },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    await this.storage.deleteFile({
      bucket: 'jakartapastisehat',
      key: team.image_key,
    });

    return this.prisma.team.delete({
      where: {
        team_id,
      },
      select: {
        team_id: true,
      },
    });
  }

  async deleteEducation(education_id: string) {
    if (!(await this.prisma.education.count())) {
      throw new NotFoundException('Pendidikan tidak ditemukan');
    }

    return this.prisma.education.delete({
      where: {
        education_id,
      },
      select: {
        education_id: true,
      },
    });
  }

  async deleteSocial(socmed_id: string) {
    if (!(await this.prisma.socialMedia.count())) {
      throw new NotFoundException('Sosial media tidak ditemukan');
    }

    return this.prisma.socialMedia.delete({
      where: {
        socmed_id,
      },
      select: {
        socmed_id: true,
      },
    });
  }
}
