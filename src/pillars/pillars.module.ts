import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { PillarsController } from './pillars.controller';
import { PillarsService } from './pillars.service';

@Module({
  controllers: [PillarsController],
  providers: [PillarsService, PrismaService],
})
export class PillarsModule {}
