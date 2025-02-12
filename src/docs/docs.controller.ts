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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { PublicGuard } from '../utils/guards/public.guard';
import { ZodInterceptor } from '../utils/interceptors/zod.interceptor';
import {
  CreateDocDto,
  CreateDocImageDto,
  createDocImageSchema,
  createDocSchema,
  DocsQuery,
  UpdateDocDto,
  updateDocSchema,
} from './docs.dto';
import { DocsService } from './docs.service';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getDocs(
    @Query() query: DocsQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.headers['x-role'];

      const data =
        role !== 'admin'
          ? await this.docsService.getPublicDocs(query)
          : await this.docsService.getDocs(query);
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
  async getDoc(
    @Param('id_or_slug') id_or_slug: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.docsService.getDoc(id_or_slug),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'doc_images' },
    ]),
    new ZodInterceptor(createDocSchema),
  )
  async createDoc(
    @Body() body: CreateDocDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      doc_images?: Express.Multer.File[];
    },
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.docsService.createDoc(body, files),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('thumbnail'),
    new ZodInterceptor(updateDocSchema),
  )
  async updateDoc(
    @Body() body: UpdateDocDto,
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
    thumbnail: Express.Multer.File,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.docsService.updateDoc(body, thumbnail),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':doc_id')
  @HttpCode(HttpStatus.OK)
  async deleteDoc(@Param('doc_id') doc_id: string): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.docsService.deleteDoc(doc_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post('/images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('doc_images'),
    new ZodInterceptor(createDocImageSchema),
  )
  async createDocImage(
    @Body() body: CreateDocImageDto,
    @UploadedFiles()
    doc_images: Express.Multer.File[],
  ): Promise<SuccessResponse> {
    await this.docsService.uploadDocImages(
      doc_images,
      body.doc_id,
      'create_images',
    );

    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: {
          doc_id: body.doc_id,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete('/images/:doc_image_id')
  @HttpCode(HttpStatus.OK)
  async deleteDocImage(
    @Param('doc_image_id') doc_image_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.docsService.deleteDocImage(doc_image_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
