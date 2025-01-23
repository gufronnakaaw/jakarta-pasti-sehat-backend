import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { AdminsModule } from './admins/admins.module';
import { AppController } from './app.controller';
import { GeneralModule } from './general/general.module';

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
    GeneralModule,
    AdminModule,
    AdminsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
