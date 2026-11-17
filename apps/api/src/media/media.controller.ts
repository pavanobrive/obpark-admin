import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import * as fs from 'fs'
import * as path from 'path'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { cloudinary } from './cloudinary.provider'
import { StorageService, UploadedFileDto } from '../storage/storage.service'

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: UploadedFileDto,
    @Body('folder') bodyFolder?: string,
    @Query('folder') queryFolder?: string,
    @Body('type') bodyType?: string,
    @Query('type') queryType?: string,
    @Body('slug') bodySlug?: string,
    @Query('slug') querySlug?: string,
    @Body('imageType') bodyImageType?: string,
    @Query('imageType') queryImageType?: string,
    @Body('index') bodyIndex?: string,
    @Query('index') queryIndex?: string,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('No file uploaded')
    }

    const type = bodyType || queryType
    const slug = bodySlug || querySlug
    const imageType = (bodyImageType || queryImageType || 'card') as 'card' | 'banner' | 'slider'
    const index = bodyIndex !== undefined || queryIndex !== undefined ? Number(bodyIndex ?? queryIndex) : undefined

    // 1. Dedicated Category Image Upload: uploads/categories/{category_slug}/{imageType}.ext
    if ((type === 'category' || bodyFolder === 'categories' || queryFolder === 'categories') && slug) {
      const saved = await this.storageService.saveCategoryImage(slug, imageType, file)
      return {
        url: saved.url,
        path: saved.relativePath,
        publicUrl: saved.url,
      }
    }

    // 2. Dedicated Product Image Upload: uploads/products/{product_slug}/p-{index}.ext
    if ((type === 'product' || bodyFolder === 'products' || queryFolder === 'products') && slug) {
      const saved = await this.storageService.saveProductImage(slug, file, index)
      return {
        url: saved.url,
        path: saved.relativePath,
        publicUrl: saved.url,
      }
    }

    // 3. Dedicated Profile Image Upload: uploads/profile/{identifier}.ext
    if (type === 'profile' || bodyFolder === 'profile' || queryFolder === 'profile') {
      const saved = await this.storageService.saveProfileImage(file, slug)
      return {
        url: saved.url,
        path: saved.relativePath,
        publicUrl: saved.url,
      }
    }

    // 3. Cloudinary upload if explicitly configured
    const rawFolder = bodyFolder || queryFolder || 'products'
    const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'products'

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `obpark-${folder}` },
            (error, res) => {
              if (error) return reject(error)
              resolve(res)
            },
          )
          stream.end(file.buffer)
        })

        return {
          url: result.secure_url,
          path: result.public_id,
          publicUrl: result.secure_url,
        }
      } catch (err: any) {
        console.warn('Cloudinary upload unreachable, falling back to local storage:', err?.message)
      }
    }

    // 4. Fallback storage in baseUploadDir/{folder}/
    try {
      const ext = path.extname(file.originalname).toLowerCase() || '.png'
      const rawBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
      const filename = `${Date.now()}-${rawBase}${ext}`

      const baseDir = this.storageService.getBaseDir()
      const targetDir = path.join(baseDir, folder)
      this.storageService.ensureDirectoryExists(targetDir)

      fs.writeFileSync(path.join(targetDir, filename), file.buffer)

      const relativeUrl = `/uploads/${folder}/${filename}`
      return {
        url: relativeUrl,
        path: `${folder}/${filename}`,
        publicUrl: relativeUrl,
      }
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Failed to save uploaded media file')
    }
  }

  @Delete()
  async delete(@Body('path') bodyPath?: string, @Query('path') queryPath?: string) {
    const rawPath = bodyPath || queryPath
    if (!rawPath) throw new BadRequestException('path is required')

    const cleanPath = rawPath.replace(/^\/?uploads\//, '').replace(/^\/+/, '')
    const deleted = this.storageService.deleteFile(cleanPath)

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(cleanPath)
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      deleted,
      path: cleanPath,
    }
  }
}
