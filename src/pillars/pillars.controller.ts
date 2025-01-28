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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SuccessResponse } from 'src/utils/global/global.response';
import { PublicGuard } from 'src/utils/guards/public.guard';
import { ZodValidationPipe } from 'src/utils/pipes/zod.pipe';
import { AdminGuard } from '../utils/guards/admin.guard';
import {
  CreatePillarDto,
  createPillarSchema,
  PillarsQuery,
  UpdatePillarDto,
  updatePillarSchema,
} from './pillars.dto';
import { PillarsService } from './pillars.service';

@Controller('pillars')
export class PillarsController {
  constructor(private readonly pillarsService: PillarsService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPillars(
    @Query() query: PillarsQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.headers['x-role'];

      const data =
        role !== 'admin'
          ? await this.pillarsService.getPublicPillars()
          : await this.pillarsService.getPillars(query);
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
  @Get(':pillar_id')
  @HttpCode(HttpStatus.OK)
  async getPillar(
    @Param('pillar_id') pillar_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.pillarsService.getPillar(pillar_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(createPillarSchema))
  async createPillar(@Body() body: CreatePillarDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.pillarsService.createPillar(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updatePillarSchema))
  async updatePillar(@Body() body: UpdatePillarDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.pillarsService.updatePillar(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':pillar_id')
  @HttpCode(HttpStatus.OK)
  async deletePillar(
    @Param('pillar_id') pillar_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.pillarsService.deletePillar(pillar_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
