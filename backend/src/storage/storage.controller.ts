import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Upload a file
   * POST /storage/upload
   * Body: multipart/form-data with 'file' field
   * Optional fields: bucketPath, memberId, uploadedBy
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucketPath') bucketPath?: string,
    @Query('memberId') memberId?: string,
    @Query('uploadedBy') uploadedBy?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!uploadedBy) {
      throw new BadRequestException('uploadedBy query parameter is required');
    }

    const result = await this.storageService.uploadFile({
      file,
      bucketPath: bucketPath || 'uploads',
      memberId,
      uploadedBy,
    });

    return {
      message: 'File uploaded successfully',
      file: result,
    };
  }

  /**
   * Get file metadata by ID
   * GET /storage/files/:id
   */
  @Get('files/:id')
  async getFile(@Param('id') id: string) {
    return this.storageService.getFileById(id);
  }

  /**
   * Get all files by user
   * GET /storage/files/user/:userId
   */
  @Get('files/user/:userId')
  async getFilesByUser(@Param('userId') userId: string) {
    return this.storageService.getFilesByUser(userId);
  }

  /**
   * Get all files for a member
   * GET /storage/files/member/:memberId
   */
  @Get('files/member/:memberId')
  async getFilesByMember(@Param('memberId') memberId: string) {
    return this.storageService.getFilesByMember(memberId);
  }

  /**
   * Download a file
   * GET /storage/download/:id
   */
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const fileMetadata = await this.storageService.getFileById(id);
    const fileBlob = await this.storageService.downloadFile(id);

    const buffer = Buffer.from(await fileBlob.arrayBuffer());

    res.set({
      'Content-Type': fileMetadata.mimeType,
      'Content-Disposition': `attachment; filename="${fileMetadata.fileName}"`,
      'Content-Length': fileMetadata.fileSize,
    });

    return new StreamableFile(buffer);
  }

  /**
   * Delete a file
   * DELETE /storage/files/:id
   * Query: userId (required for authorization)
   */
  @Delete('files/:id')
  async deleteFile(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }

    await this.storageService.deleteFile(id, userId);

    return {
      message: 'File deleted successfully',
    };
  }

  /**
   * Get storage statistics
   * GET /storage/stats
   */
  @Get('stats')
  async getStats() {
    return this.storageService.getStorageStats();
  }
}
