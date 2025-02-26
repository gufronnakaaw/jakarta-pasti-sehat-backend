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
  ArticlesQuery,
  CreateArticleDto,
  createArticleSchema,
  UpdateArticleDto,
  updateArticleSchema,
} from './articles.dto';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getArticles(
    @Query() query: ArticlesQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.headers['x-role'];

      const data =
        role !== 'admin'
          ? await this.articlesService.getPublicArticles(query)
          : await this.articlesService.getArticles(query);
      return {
        success: true,
        status_code: HttpStatus.OK,
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id_or_slug')
  @HttpCode(HttpStatus.OK)
  async getArticle(
    @Param('id_or_slug') id_or_slug: string,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.headers['x-role'];

      const data =
        role !== 'admin'
          ? await this.articlesService.getPublicArticle(id_or_slug)
          : await this.articlesService.getArticle(id_or_slug);

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
  @UseInterceptors(
    FileInterceptor('articles'),
    new ZodInterceptor(createArticleSchema),
  )
  async createArticle(
    @Body() body: CreateArticleDto,
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
        data: await this.articlesService.createArticle(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('articles'),
    new ZodInterceptor(updateArticleSchema),
  )
  async updateArticle(
    @Body() body: UpdateArticleDto,
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
        data: await this.articlesService.updateArticle(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':article_id')
  @HttpCode(HttpStatus.OK)
  async deleteArticle(
    @Param('article_id') article_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.articlesService.deleteArticle(article_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
