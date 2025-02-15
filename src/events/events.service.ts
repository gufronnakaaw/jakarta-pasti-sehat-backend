import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}
}
