import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService, PrismaService],
})
export class PositionsModule {}
