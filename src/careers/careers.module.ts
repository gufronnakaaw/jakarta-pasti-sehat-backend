import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

@Module({
  controllers: [CareersController],
  providers: [CareersService, PrismaService, StorageService],
})
export class CareersModule {}
