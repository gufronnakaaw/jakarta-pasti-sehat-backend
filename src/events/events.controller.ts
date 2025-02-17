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
import { Request } from 'express';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { PublicGuard } from '../utils/guards/public.guard';
import { ZodInterceptor } from '../utils/interceptors/zod.interceptor';
import {
  CreateEventDto,
  createEventSchema,
  EventsQuery,
  UpdateEventDto,
  updateEventSchema,
} from './events.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getEvents(
    @Query() query: EventsQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.xrole;

      const data =
        role !== 'admin'
          ? await this.eventsService.getPublicEvents(query)
          : await this.eventsService.getEvents(query);
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
  async getEvent(
    @Param('id_or_slug') id_or_slug: string,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.xrole;

      const data =
        role !== 'admin'
          ? await this.eventsService.getPublicEvent(id_or_slug)
          : await this.eventsService.getEvent(id_or_slug);

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
    FileInterceptor('events'),
    new ZodInterceptor(createEventSchema),
  )
  async createEvent(
    @Body() body: CreateEventDto,
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
        data: await this.eventsService.createEvent(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('events'),
    new ZodInterceptor(updateEventSchema),
  )
  async updateEvent(
    @Body() body: UpdateEventDto,
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
        data: await this.eventsService.updateEvent(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':event_id')
  @HttpCode(HttpStatus.OK)
  async deleteEvent(
    @Param('event_id') event_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.eventsService.deleteEvent(event_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
