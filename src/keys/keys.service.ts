import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { decryptText, encryptText } from '../utils/encrypt.util';
import { PrismaService } from '../utils/services/prisma.service';
import { CreateKeyDto } from './keys.dto';

@Injectable()
export class KeysService {
  constructor(private prisma: PrismaService) {}

  async getKeys() {
    const keys = await this.prisma.accessKey.findMany({
      select: {
        access_key_id: true,
        value: true,
        created_at: true,
        created_by: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return keys.map((key) => {
      return {
        ...key,
        value: decryptText(key.value, process.env.ENCRYPT_KEY),
      };
    });
  }

  createKey(body: CreateKeyDto) {
    if (body.access_key !== process.env.ACCESS_KEY) {
      throw new ForbiddenException();
    }

    return this.prisma.accessKey.create({
      data: {
        access_key_id: `${PREFIX['KEY']}${random(1000, 9999)}`,
        value: encryptText(body.value, process.env.ENCRYPT_KEY),
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        access_key_id: true,
      },
    });
  }

  async deleteKey(params: { access_key_id: string; access_key: string }) {
    if (params.access_key !== process.env.ACCESS_KEY) {
      throw new ForbiddenException();
    }

    if (
      !(await this.prisma.accessKey.count({
        where: {
          access_key_id: params.access_key_id,
        },
      }))
    ) {
      throw new NotFoundException('Akses key tidak ditemukan');
    }

    return this.prisma.accessKey.delete({
      where: {
        access_key_id: params.access_key_id,
      },
      select: {
        access_key_id: true,
      },
    });
  }
}
