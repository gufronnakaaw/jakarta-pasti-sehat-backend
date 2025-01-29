import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { KeysController } from './keys.controller';
import { KeysService } from './keys.service';

@Module({
  controllers: [KeysController],
  providers: [KeysService, PrismaService],
})
export class KeysModule {}
