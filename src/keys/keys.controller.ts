import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SuccessResponse } from '../utils/global/global.response';
import { SuperAdminGuard } from '../utils/guards/superadmin.guard';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import { CreateKeyDto, createKeySchema } from './keys.dto';
import { KeysService } from './keys.service';

@Controller('keys')
@UseGuards(SuperAdminGuard)
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getKeys(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.keysService.getKeys(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createKeySchema))
  async createKey(@Body() body: CreateKeyDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.keysService.createKey(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':access_key_id/:access_key')
  @HttpCode(HttpStatus.OK)
  async deleteKey(
    @Param() params: { access_key_id: string; access_key: string },
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.keysService.deleteKey(params),
      };
    } catch (error) {
      throw error;
    }
  }
}
