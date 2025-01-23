import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { SuccessResponse } from 'src/utils/global/global.response';
import { AdminQuery } from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/banners')
  @HttpCode(HttpStatus.OK)
  async getBanners(@Query() query: AdminQuery): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminService.getBanners(query),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/banners/:banner_id')
  @HttpCode(HttpStatus.OK)
  async getBanner(
    @Param('banner_id') banner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminService.getBanner(banner_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/banners/:banner_id')
  @HttpCode(HttpStatus.OK)
  async deleteBanner(
    @Param('banner_id') banner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminService.deleteBanner(banner_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/partners')
  @HttpCode(HttpStatus.OK)
  async getPartners(@Query() query: AdminQuery): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminService.getPartners(query),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/partners/:partner_id')
  @HttpCode(HttpStatus.OK)
  async getPartner(
    @Param('partner_id') partner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminService.getPartner(partner_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/partners/:partner_id')
  @HttpCode(HttpStatus.OK)
  async deletePartner(
    @Param('partner_id') partner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminService.deletePartner(partner_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
