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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { PublicGuard } from '../utils/guards/public.guard';
import { ZodInterceptor } from '../utils/interceptors/zod.interceptor';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import {
  CreateVolApplDto,
  createVolApplSchema,
  CreateVolDto,
  createVolSchema,
  UpdateVolApplDto,
  updateVolApplSchema,
  UpdateVolDto,
  updateVolSchema,
  VolsQuery,
} from './volunteers.dto';
import { VolunteersService } from './volunteers.service';

@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getDocs(
    @Query() query: VolsQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.xrole;

      const data =
        role !== 'admin'
          ? await this.volunteersService.getPublicVols(query)
          : await this.volunteersService.getVols(query);
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
  async getVol(
    @Param('id_or_slug') id_or_slug: string,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.xrole;

      const data =
        role !== 'admin'
          ? await this.volunteersService.getPublicVol(id_or_slug)
          : await this.volunteersService.getVol(id_or_slug);

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
  @UsePipes(new ZodValidationPipe(createVolSchema))
  async createVol(@Body() body: CreateVolDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.volunteersService.createVol(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateVolSchema))
  async updateVol(@Body() body: UpdateVolDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.volunteersService.updateVol(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':volunteer_id')
  @HttpCode(HttpStatus.OK)
  async deleteVol(
    @Param('volunteer_id') volunteer_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.volunteersService.deleteVol(volunteer_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/applicants')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'follow', maxCount: 1 },
    ]),
    new ZodInterceptor(createVolApplSchema),
  )
  async createVolAppl(
    @Body() body: CreateVolApplDto,
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      follow?: Express.Multer.File[];
    },
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.volunteersService.createVolAppl(body, files),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch('/applicants')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateVolApplSchema))
  async updateVolAppl(
    @Body() body: UpdateVolApplDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.volunteersService.updateVolAppl(body),
      };
    } catch (error) {
      throw error;
    }
  }
}
