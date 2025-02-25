import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { PublicGuard } from '../utils/guards/public.guard';
import { ZodInterceptor } from '../utils/interceptors/zod.interceptor';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import {
  CareerQuery,
  CreateCareerApplDto,
  createCareerApplSchema,
  CreateCareerDto,
  createCareerSchema,
  UpdateCarApplDto,
  updateCarApplSchema,
  UpdateCareerDto,
  updateCareerSchema,
} from './careers.dto';
import { CareersService } from './careers.service';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCareers(
    @Query() query: CareerQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.xrole;

      const data =
        role !== 'admin'
          ? await this.careersService.getPublicCareers(query)
          : await this.careersService.getCareers(query);
      return {
        success: true,
        status_code: HttpStatus.OK,
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(PublicGuard)
  @Get(':id_or_slug')
  @HttpCode(HttpStatus.OK)
  async getCareer(
    @Param('id_or_slug') id_or_slug: string,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.xrole;

      const data =
        role !== 'admin'
          ? await this.careersService.getPublicCareer(id_or_slug)
          : await this.careersService.getCareer(id_or_slug);

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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createCareerSchema))
  async createCareer(@Body() body: CreateCareerDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.careersService.createCareer(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateCareerSchema))
  async updateCareer(@Body() body: UpdateCareerDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.careersService.updateCareer(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':volunteer_id')
  @HttpCode(HttpStatus.OK)
  async deleteCareer(
    @Param('volunteer_id') volunteer_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.careersService.deleteCareer(volunteer_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/applicants')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('cv'),
    new ZodInterceptor(createCareerApplSchema),
  )
  async createCarAppl(
    @Body() body: CreateCareerApplDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.careersService.createCarAppl(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch('/applicants')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateCarApplSchema))
  async updateCarAppl(
    @Body() body: UpdateCarApplDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.careersService.updateCarAppl(body),
      };
    } catch (error) {
      throw error;
    }
  }
}
