import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { BannersModule } from './banners/banners.module';
import { DocsModule } from './docs/docs.module';
import { EventsModule } from './events/events.module';
import { KeysModule } from './keys/keys.module';
import { PartnersModule } from './partners/partners.module';
import { PillarsModule } from './pillars/pillars.module';
import { PositionsModule } from './positions/positions.module';
import { TeamsModule } from './teams/teams.module';
import { PrismaService } from './utils/services/prisma.service';
import { StorageService } from './utils/services/storage.service';
import { VolunteersModule } from './volunteers/volunteers.module';
import { CareersModule } from './careers/careers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: '6h',
      },
    }),
    AdminModule,
    BannersModule,
    PartnersModule,
    PillarsModule,
    KeysModule,
    PositionsModule,
    DocsModule,
    TeamsModule,
    VolunteersModule,
    EventsModule,
    ArticlesModule,
    CareersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, StorageService],
})
export class AppModule {}
