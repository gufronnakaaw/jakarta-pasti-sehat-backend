import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService, PrismaService, StorageService],
})
export class PartnersModule {}
