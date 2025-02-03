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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { PublicGuard } from '../utils/guards/public.guard';
import { ZodInterceptor } from '../utils/interceptors/zod.interceptor';
import {
  CreatePartnerDto,
  createPartnerSchema,
  PartnersQuery,
  UpdatePartnerDto,
  updatePartnerSchema,
} from './partners.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPartners(
    @Query() query: PartnersQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.headers['x-role'];

      const data =
        role !== 'admin'
          ? await this.partnersService.getPublicPartners()
          : await this.partnersService.getPartners(query);
      return {
        success: true,
        status_code: HttpStatus.OK,
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Get(':partner_id')
  @HttpCode(HttpStatus.OK)
  async getPartner(
    @Param('partner_id') partner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.partnersService.getPartner(partner_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('partner'),
    new ZodInterceptor(createPartnerSchema),
  )
  async createPartner(
    @Body() body: CreatePartnerDto,
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
        data: await this.partnersService.createPartner(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('partner'),
    new ZodInterceptor(updatePartnerSchema),
  )
  async updatePartner(
    @Body() body: UpdatePartnerDto,
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
        data: await this.partnersService.updatePartner(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':partner_id')
  @HttpCode(HttpStatus.OK)
  async deletePartner(
    @Param('partner_id') partner_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.partnersService.deletePartner(partner_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
