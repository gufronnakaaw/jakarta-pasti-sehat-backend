import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { SuccessResponse } from './utils/global/global.response';

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
}
