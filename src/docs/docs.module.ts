import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';

@Module({
  controllers: [DocsController],
  providers: [DocsService, PrismaService, StorageService],
})
export class DocsModule {}
