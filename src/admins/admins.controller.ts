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
import { SuccessResponse } from 'src/utils/global/global.response';
import { ZodValidationPipe } from 'src/utils/pipes/zod.pipe';
import { SuperAdminGuard } from '../utils/guards/superadmin.guard';
import {
  CreateAdminDto,
  createAdminSchema,
  UpdateAdminDto,
  updateAdminSchema,
} from './admins.dto';
import { AdminsService } from './admins.service';

@Controller('admins')
@UseGuards(SuperAdminGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAdmins(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminsService.getAdmins(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':admin_id')
  @HttpCode(HttpStatus.OK)
  async getAdmin(
    @Param('admin_id') admin_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminsService.getAdmin(admin_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createAdminSchema))
  async adminsRegister(@Body() body: CreateAdminDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.adminsService.createAdmin(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateAdminSchema))
  async updatePrograms(@Body() body: UpdateAdminDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminsService.updateAdmin(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':admin_id')
  @HttpCode(HttpStatus.OK)
  async deleteAdmins(
    @Param('admin_id') admin_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminsService.deleteAdmin(admin_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
