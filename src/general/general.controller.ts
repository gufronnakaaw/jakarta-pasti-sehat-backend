import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SuccessResponse } from '../utils/global/global.response';
import { GeneralService } from './general.service';

@Controller('general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Get('/homepage')
  @HttpCode(HttpStatus.OK)
  async getHomepageData(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.generalService.getHomepageData(),
      };
    } catch (error) {
      throw error;
    }
  }
}
