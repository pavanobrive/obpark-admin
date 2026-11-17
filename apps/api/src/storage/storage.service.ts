import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

export interface UploadedFileDto {
  buffer: Buffer
  originalname: string
  mimetype?: string
  size?: number
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private readonly baseUploadDir: string

  constructor() {
    this.baseUploadDir = this.resolveUploadDir()
    this.ensureDirectoryExists(this.baseUploadDir)
    this.ensureDirectoryExists(path.join(this.baseUploadDir, 'products'))
    this.ensureDirectoryExists(path.join(this.baseUploadDir, 'categories'))
    this.ensureDirectoryExists(path.join(this.baseUploadDir, 'profile'))
    this.logger.log(`StorageService initialized. Base upload directory: ${this.baseUploadDir}`)
  }

  private resolveUploadDir(): string {
    // 1. Explicit environment variable takes highest priority
    if (process.env.UPLOAD_DIR) {
      const explicit = path.resolve(process.env.UPLOAD_DIR)
      if (fs.existsSync(explicit)) {
        return explicit
      }
    }

    // 2. Search upwards from process.cwd() for obpark-backend/uploads
    let curr = path.resolve(process.cwd())
    for (let i = 0; i < 5; i++) {
      const candidate = path.join(curr, 'obpark-backend', 'uploads')
      if (fs.existsSync(candidate)) {
        return candidate
      }
      const parent = path.dirname(curr)
      if (parent === curr) break
      curr = parent
    }

    // 3. Known absolute path for this project workspace
    const knownAbsolute = path.resolve('C:/practicals/next_js_projects/obrive/obpark-backend/uploads')
    if (fs.existsSync(knownAbsolute)) {
      return knownAbsolute
    }

    // 4. Fallback to process.cwd() / uploads
    return path.resolve(process.cwd(), 'uploads')
  }

  public getBaseDir(): string {
    return this.baseUploadDir
  }

  public ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  /**
   * Save a product image into uploads/products/{productSlug}/
   */
  async saveProductImage(
    productSlug: string,
    file: UploadedFileDto,
    index?: number,
  ): Promise<{ url: string; relativePath: string }> {
    const cleanSlug = productSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
    const targetDir = path.join(this.baseUploadDir, 'products', cleanSlug)
    this.ensureDirectoryExists(targetDir)

    const ext = path.extname(file.originalname).toLowerCase() || '.png'
    const filename = index !== undefined ? `p-${index}${ext}` : `p-${Date.now()}${ext}`
    const fullPath = path.join(targetDir, filename)

    fs.writeFileSync(fullPath, file.buffer)

    const url = `/uploads/products/${cleanSlug}/${filename}`
    const relativePath = `products/${cleanSlug}/${filename}`
    return { url, relativePath }
  }

  /**
   * Save a category image (card, banner, or slider) into uploads/categories/{categorySlug}/
   */
  async saveCategoryImage(
    categorySlug: string,
    imageType: 'card' | 'banner' | 'slider',
    file: UploadedFileDto,
  ): Promise<{ url: string; relativePath: string }> {
    const cleanSlug = categorySlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
    const targetDir = path.join(this.baseUploadDir, 'categories', cleanSlug)
    this.ensureDirectoryExists(targetDir)

    const ext = path.extname(file.originalname).toLowerCase() || '.png'
    const filename = `${imageType}${ext}`
    const fullPath = path.join(targetDir, filename)

    fs.writeFileSync(fullPath, file.buffer)

    const url = `/uploads/categories/${cleanSlug}/${filename}`
    const relativePath = `categories/${cleanSlug}/${filename}`
    return { url, relativePath }
  }

  /**
   * Save a profile image into uploads/profile/
   */
  async saveProfileImage(
    file: UploadedFileDto,
    identifier?: string,
  ): Promise<{ url: string; relativePath: string }> {
    const targetDir = path.join(this.baseUploadDir, 'profile')
    this.ensureDirectoryExists(targetDir)

    const ext = path.extname(file.originalname).toLowerCase() || '.webp'
    const cleanId = identifier ? identifier.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') : `${Date.now()}`
    const filename = `${cleanId}${ext}`
    const fullPath = path.join(targetDir, filename)

    fs.writeFileSync(fullPath, file.buffer)

    const url = `/uploads/profile/${filename}`
    const relativePath = `profile/${filename}`
    return { url, relativePath }
  }

  /**
   * Delete a specific file given its relative URL (/uploads/...) or relative path
   */
  deleteFile(fileUrlOrPath: string): boolean {
    if (!fileUrlOrPath) return false
    // Strip leading /uploads/ or uploads/
    const cleanRelative = fileUrlOrPath
      .replace(/^\/?uploads\//, '')
      .replace(/^\/+/, '')

    const fullPath = path.resolve(this.baseUploadDir, cleanRelative)

    // Security check: ensure path is strictly within baseUploadDir
    if (!fullPath.startsWith(this.baseUploadDir)) {
      this.logger.warn(`Security warning: attempted deletion outside base upload dir: ${fileUrlOrPath}`)
      return false
    }

    try {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath)
        this.logger.log(`Deleted file: ${fullPath}`)
        return true
      }
    } catch (err: any) {
      this.logger.error(`Failed to delete file ${fullPath}: ${err.message}`)
    }
    return false
  }

  /**
   * Delete an entire product folder (uploads/products/{productSlug}/)
   */
  deleteProductFolder(productSlug: string): boolean {
    if (!productSlug) return false
    const cleanSlug = productSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
    const targetDir = path.resolve(this.baseUploadDir, 'products', cleanSlug)

    if (!targetDir.startsWith(path.join(this.baseUploadDir, 'products'))) {
      return false
    }

    try {
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true })
        this.logger.log(`Deleted product folder: ${targetDir}`)
        return true
      }
    } catch (err: any) {
      this.logger.error(`Failed to delete product folder ${targetDir}: ${err.message}`)
    }
    return false
  }

  /**
   * Delete an entire category folder (uploads/categories/{categorySlug}/)
   */
  deleteCategoryFolder(categorySlug: string): boolean {
    if (!categorySlug) return false
    const cleanSlug = categorySlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
    const targetDir = path.resolve(this.baseUploadDir, 'categories', cleanSlug)

    if (!targetDir.startsWith(path.join(this.baseUploadDir, 'categories'))) {
      return false
    }

    try {
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true })
        this.logger.log(`Deleted category folder: ${targetDir}`)
        return true
      }
    } catch (err: any) {
      this.logger.error(`Failed to delete category folder ${targetDir}: ${err.message}`)
    }
    return false
  }

  /**
   * Diff two image arrays and remove files that were discarded
   */
  diffAndDeleteImages(existingImages: string[] = [], newImages: string[] = []): void {
    const toRemove = existingImages.filter((img) => !newImages.includes(img))
    for (const img of toRemove) {
      this.deleteFile(img)
    }
  }
}
