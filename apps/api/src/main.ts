import { env } from './config/env'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { StorageService } from './storage/storage.service'
import cookieParser from 'cookie-parser'
import * as path from 'path'
import * as fs from 'fs'

const allowedOrigins = new Set(
  env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
)

function isCorsOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true
  if (allowedOrigins.has(origin)) return true
  // Next.js picks 3001, 3002, … when 3000 is busy — allow any localhost port in dev
  if (env.NODE_ENV === 'development' && /^http:\/\/localhost:\d+$/.test(origin)) {
    return true
  }
  return false
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })
  app.enableShutdownHooks()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Serve static uploaded assets directly from dynamic StorageService base directory
  const storageService = app.get(StorageService)
  const uploadDir = storageService.getBaseDir()
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' })

  // Also serve local ./uploads if different
  const localUploads = path.resolve(process.cwd(), 'uploads')
  if (localUploads !== uploadDir && fs.existsSync(localUploads)) {
    app.useStaticAssets(localUploads, { prefix: '/uploads/' })
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (isCorsOriginAllowed(origin)) {
        callback(null, origin ?? true)
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`), false)
      }
    },
    credentials: true,
  })

  const port = env.PORT
  try {
    await app.listen(port)
    console.log(`API running on http://localhost:${port}`)
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is in use. Run: pnpm run free-port (in apps/api), then pnpm start:dev`,
      )
    }
    throw err
  }
}
bootstrap()
