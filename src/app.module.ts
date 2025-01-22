import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AppController } from './app.controller';
import { GeneralModule } from './general/general.module';

@Module({
  imports: [GeneralModule, AdminsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
