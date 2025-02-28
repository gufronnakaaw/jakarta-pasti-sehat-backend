import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminLoginDto, adminLoginSchema } from './app.dto';
import { AppService } from './app.service';
import { SuccessResponse } from './utils/global/global.response';
import { AdminGuard } from './utils/guards/admin.guard';
import { ZodValidationPipe } from './utils/pipes/zod.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  index(): SuccessResponse {
    return {
      success: true,
      status_code: HttpStatus.OK,
      message: `Welcome to Jakarta Pasti Sehat ${process.env.MODE === 'prod' ? 'API' : 'Dev API'}`,
    };
  }

  @Get('/homepage')
  @HttpCode(HttpStatus.OK)
  async getHomepageData(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getHomepageData(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/auth/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(adminLoginSchema))
  async adminLogin(@Body() body: AdminLoginDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.adminLogin(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Get('/dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboard(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getDashboard(),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post('/contents/image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('upload'))
  async uploadContentImage(
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
  ): Promise<{ url: string }> {
    try {
      return {
        url: await this.appService.uploadContentImage(file),
      };
    } catch (error) {
      throw error;
    }
  }
}
