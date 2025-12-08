import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    // Use environment variable or default to local uploads directory
    this.uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: any): boolean {
    if (!file) {
      return false;
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    if (file.size > maxFileSize) {
      throw new BadRequestException('File size exceeds maximum limit of 5MB.');
    }

    return true;
  }

  /**
   * Save image file locally
   */
  async saveImageLocally(file: any, subfolder: string = 'general'): Promise<string> {
    this.validateImageFile(file);

    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const filepath = path.join(this.uploadDir, subfolder);

    // Ensure subfolder exists
    if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath, { recursive: true });
    }

    const fullPath = path.join(filepath, filename);

    try {
      fs.writeFileSync(fullPath, file.buffer);
      this.logger.log(`Image saved: ${fullPath}`);
      
      // Return relative URL path
      return `/uploads/${subfolder}/${filename}`;
    } catch (error) {
      this.logger.error(`Failed to save image: ${error.message}`);
      throw new BadRequestException('Failed to save image file');
    }
  }

  /**
   * Delete image file
   */
  async deleteImage(imagePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), imagePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Image deleted: ${fullPath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload to AWS S3 (placeholder for cloud integration)
   */
  async uploadToS3(file: any, key: string): Promise<string> {
    // TODO: Implement S3 upload using AWS SDK
    // const s3 = new AWS.S3();
    // const params = {
    //   Bucket: this.configService.get('AWS_S3_BUCKET'),
    //   Key: key,
    //   Body: file.buffer,
    //   ContentType: file.mimetype,
    //   ACL: 'public-read',
    // };
    // const result = await s3.upload(params).promise();
    // return result.Location;
    throw new BadRequestException('S3 upload not yet configured. Use local storage instead.');
  }

  /**
   * Upload to Cloudinary (placeholder for cloud integration)
   */
  async uploadToCloudinary(file: any): Promise<string> {
    // TODO: Implement Cloudinary upload
    // const cloudinary = require('cloudinary').v2;
    // const stream = cloudinary.uploader.upload_stream(
    //   { folder: 'parakar-halani-parivar' },
    //   (error, result) => {
    //     if (error) throw error;
    //     return result.secure_url;
    //   }
    // );
    // stream.end(file.buffer);
    throw new BadRequestException('Cloudinary upload not yet configured. Use local storage instead.');
  }

  /**
   * Get image metadata
   */
  getImageMetadata(imagePath: string): { size: number; created: Date } | null {
    try {
      const fullPath = path.join(process.cwd(), imagePath);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          size: stats.size,
          created: stats.birthtime,
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to get image metadata: ${error.message}`);
      return null;
    }
  }
}
