import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { cloudinary } from './cloudinary.provider'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

interface UploadedFileType {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MediaController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadedFileType) {
    if (!file) throw new BadRequestException('No file uploaded')
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'obpark-products' },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        },
      )
      stream.end(file.buffer)
    })
    return { url: result.secure_url }
  }
}