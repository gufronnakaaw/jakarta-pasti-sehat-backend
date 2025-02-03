import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AdminLoginDto, adminLoginSchema } from './app.dto';
import { AppService } from './app.service';
import { SuccessResponse } from './utils/global/global.response';
import { ZodValidationPipe } from './utils/pipes/zod.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  index(): SuccessResponse {
    return {
      success: true,
      status_code: HttpStatus.OK,
      message: `Welcome to Jakarta Pasti Sehat ${process.env.MODE === 'prod' ? 'API' : 'Dev API'}`,
    };
  }

  @Get('/homepage')
  @HttpCode(HttpStatus.OK)
  async getHomepageData(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getHomepageData(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/auth/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(adminLoginSchema))
  async adminLogin(@Body() body: AdminLoginDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.adminLogin(body),
      };
    } catch (error) {
      throw error;
    }
  }
}
