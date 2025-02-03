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
import { SuperAdminGuard } from '../utils/guards/superadmin.guard';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import {
  CreateAdminDto,
  createAdminSchema,
  UpdateAdminDto,
  updateAdminSchema,
} from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(SuperAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAdmins(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.adminService.getAdmins(),
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
        data: await this.adminService.getAdmin(admin_id),
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
        data: await this.adminService.createAdmin(body),
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
        data: await this.adminService.updateAdmin(body),
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
        data: await this.adminService.deleteAdmin(admin_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
