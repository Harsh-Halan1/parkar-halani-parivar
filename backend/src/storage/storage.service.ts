import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { FileStorage } from '@prisma/client';
import * as path from 'path';

export interface UploadFileDto {
  file: Express.Multer.File;
  bucketPath?: string;
  memberId?: string;
  uploadedBy: string;
}

@Injectable()
export class StorageService {
  private readonly defaultBucket: string;
  private readonly maxFileSize = 512 * 1024; // 512KB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {
    this.defaultBucket = process.env.SUPABASE_BUCKET || 'parakar-storage';
  }

  /**
   * Upload a file to Supabase Storage and save metadata to database
   */
  async uploadFile(dto: UploadFileDto): Promise<FileStorage> {
    const { file, bucketPath = 'uploads', memberId, uploadedBy } = dto;

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(file.originalname);
    const fileExtension = path.extname(sanitizedFileName);
    const fileBaseName = path.basename(sanitizedFileName, fileExtension);
    const uniqueFileName = `${fileBaseName}_${timestamp}${fileExtension}`;
    const fullPath = `${bucketPath}/${uniqueFileName}`;

    try {
      // Upload to Supabase
      await this.supabase.uploadFile(
        this.defaultBucket,
        fullPath,
        file.buffer,
        file.mimetype,
      );

      // Get public URL
      const fileUrl = this.supabase.getPublicUrl(this.defaultBucket, fullPath);

      // Save metadata to database
      const fileRecord = await this.prisma.fileStorage.create({
        data: {
          fileName: sanitizedFileName,
          fileUrl,
          bucketPath: fullPath,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy,
          memberId,
        },
      });

      return fileRecord;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to upload file: ${errorMessage}`);
    }
  }

  /**
   * Get file metadata by ID
   */
  async getFileById(id: string): Promise<FileStorage> {
    const file = await this.prisma.fileStorage.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  /**
   * Get all files uploaded by a user
   */
  async getFilesByUser(uploadedBy: string): Promise<FileStorage[]> {
    return this.prisma.fileStorage.findMany({
      where: { uploadedBy },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all files for a specific member
   */
  async getFilesByMember(memberId: string): Promise<FileStorage[]> {
    return this.prisma.fileStorage.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a file from Supabase and database
   */
  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.getFileById(id);

    // Optional: Check if user is authorized to delete (file owner or admin)
    if (file.uploadedBy !== userId) {
      throw new BadRequestException('You are not authorized to delete this file');
    }

    try {
      // Delete from Supabase
      await this.supabase.deleteFile(this.defaultBucket, file.bucketPath);

      // Delete from database
      await this.prisma.fileStorage.delete({
        where: { id },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to delete file: ${errorMessage}`);
    }
  }

  /**
   * Download file content from Supabase
   */
  async downloadFile(id: string): Promise<Blob> {
    const file = await this.getFileById(id);

    try {
      const blob = await this.supabase.downloadFile(this.defaultBucket, file.bucketPath);
      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to download file: ${errorMessage}`);
    }
  }

  /**
   * Sanitize filename to prevent path traversal and special characters
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .replace(/\.+/g, '.') // Replace multiple dots with single dot
      .replace(/_+/g, '_') // Replace multiple underscores with single underscore
      .slice(0, 255); // Limit length
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    const totalFiles = await this.prisma.fileStorage.count();
    const totalSizeResult = await this.prisma.fileStorage.aggregate({
      _sum: {
        fileSize: true,
      },
    });

    const filesByType = await this.prisma.fileStorage.groupBy({
      by: ['mimeType'],
      _count: true,
    });

    return {
      totalFiles,
      totalSize: totalSizeResult._sum.fileSize || 0,
      totalSizeMB: ((totalSizeResult._sum.fileSize || 0) / (1024 * 1024)).toFixed(2),
      filesByType,
    };
  }
}
