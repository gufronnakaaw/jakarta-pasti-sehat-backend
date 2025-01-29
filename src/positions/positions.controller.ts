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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import {
  CreatePositionDto,
  createPositionSchema,
  UpdatePositionDto,
  updatePositionSchema,
} from './positions.dto';
import { PositionsService } from './positions.service';

@Controller('positions')
@UseGuards(AdminGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPositions(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.positionsService.getPositions(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createPositionSchema))
  async createPosition(
    @Body() body: CreatePositionDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.positionsService.createPosition(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updatePositionSchema))
  async updatePosition(
    @Body() body: UpdatePositionDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.positionsService.updatePosition(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':position_id')
  @HttpCode(HttpStatus.OK)
  async deletePosition(
    @Param('position_id') position_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.positionsService.deletePosition(position_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
