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
  CreateTeamsDto,
  createTeamsSchema,
  TeamsQuery,
  UpdateTeamsDto,
  updateTeamsSchema,
} from './teams.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(PublicGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getTeams(
    @Query() query: TeamsQuery,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      const role = request.xrole;

      const data =
        role !== 'admin'
          ? await this.teamsService.getPublicTeams()
          : await this.teamsService.getTeams(query);
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
  @Get(':team_id')
  @HttpCode(HttpStatus.OK)
  async getTeam(@Param('team_id') team_id: string): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.teamsService.getTeam(team_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('teams'),
    new ZodInterceptor(createTeamsSchema),
  )
  async createTeams(
    @Body() body: CreateTeamsDto,
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
        data: await this.teamsService.createTeams(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('teams'),
    new ZodInterceptor(updateTeamsSchema),
  )
  async updateTeams(
    @Body() body: UpdateTeamsDto,
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
        data: await this.teamsService.updateTeams(body, file),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete(':team_id')
  @HttpCode(HttpStatus.OK)
  async deleteTeam(
    @Param('team_id') team_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.teamsService.deleteTeam(team_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete('/educations/:education_id')
  @HttpCode(HttpStatus.OK)
  async deleteEducation(
    @Param('education_id') education_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.teamsService.deleteEducation(education_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete('/socials/:socmed_id')
  @HttpCode(HttpStatus.OK)
  async deleteSocial(
    @Param('socmed_id') socmed_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.teamsService.deleteSocial(socmed_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
