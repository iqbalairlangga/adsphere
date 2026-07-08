import { Controller, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.upload(file);
  }

  @Delete(':path')
  @ApiOperation({ summary: 'Delete a file' })
  async delete(@Param('path') path: string) {
    return this.uploadService.delete(path);
  }
}
