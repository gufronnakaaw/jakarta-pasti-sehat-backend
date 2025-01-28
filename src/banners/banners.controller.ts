import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { ZodInterceptor } from '../utils/interceptors/zod.interceptor';
import {
  BannersQuery,
  CreateBannerDto,
  createBannerSchema,
  UpdateBannerDto,
  updateBannerSchema,
} from './banners.dto';
import { BannersService } from './banners.service';

@Controller('banners')
@UseGuards(AdminGuard)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBanners(@Query() query: BannersQuery): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.bannersService.getBanners(query),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':banner_id')
  @HttpCode(HttpStatus.OK)
  async getBanner(
    @Param('banner_id') banner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.bannersService.getBanner(banner_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('banner'),
    new ZodInterceptor(createBannerSchema),
  )
  async createBanner(
    @Body() body: CreateBannerDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /\/(jpeg|jpg|png)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.bannersService.createBanner(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('banner'),
    new ZodInterceptor(updateBannerSchema),
  )
  async updateBanner(
    @Body() body: UpdateBannerDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /\/(jpeg|jpg|png)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.bannersService.updateBanner(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':banner_id')
  @HttpCode(HttpStatus.OK)
  async deleteBanner(
    @Param('banner_id') banner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.bannersService.deleteBanner(banner_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
