import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from 'src/utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { CreatePositionDto, UpdatePositionDto } from './positions.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async getPositions() {
    const positions = await this.prisma.position.findMany({
      select: {
        position_id: true,
        name: true,
        created_at: true,
        _count: {
          select: {
            team: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return positions.map((position) => {
      return {
        position_id: position.position_id,
        name: position.name,
        created_at: position.created_at,
        can_delete: !Boolean(position._count.team),
      };
    });
  }

  createPosition(body: CreatePositionDto) {
    return this.prisma.position.create({
      data: {
        position_id: `${PREFIX['POSITION']}${random(1000, 9999)}`,
        name: body.name,
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        position_id: true,
      },
    });
  }

  async updatePosition(body: UpdatePositionDto) {
    if (
      !(await this.prisma.position.count({
        where: { position_id: body.position_id },
      }))
    ) {
      throw new NotFoundException('Jabatan tidak ditemukan');
    }

    return this.prisma.position.update({
      where: { position_id: body.position_id },
      data: {
        name: body.name,
        updated_by: body.by,
      },
      select: { position_id: true },
    });
  }

  async deletePosition(position_id: string) {
    if (!(await this.prisma.position.count({ where: { position_id } }))) {
      throw new NotFoundException('Jabatan tidak ditemukan');
    }

    return this.prisma.position.delete({
      where: { position_id },
      select: { position_id: true },
    });
  }
}
