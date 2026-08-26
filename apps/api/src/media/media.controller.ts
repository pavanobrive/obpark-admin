import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { cloudinary } from './cloudinary.provider'

interface UploadedFileType {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

@Controller('admin/media')
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