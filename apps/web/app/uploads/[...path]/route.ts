import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Candidate base directories where uploads can reside
const CANDIDATE_BASE_DIRS = [
  process.env.UPLOADS_DIR,
  '/var/www/obpark-api/uploads',
  path.resolve(process.cwd(), '../api/uploads'),
  path.resolve(process.cwd(), 'public/uploads'),
].filter(Boolean) as string[]

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Join and decode URI path segments
    const relativePath = pathSegments.map((s) => decodeURIComponent(s)).join('/')

    // Prevent directory traversal
    if (relativePath.includes('..') || relativePath.includes('\0')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Find the first candidate directory that contains the file
    let foundFilePath: string | null = null

    for (const baseDir of CANDIDATE_BASE_DIRS) {
      const candidatePath = path.resolve(baseDir, relativePath)
      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        foundFilePath = candidatePath
        break
      }
    }

    if (!foundFilePath) {
      return new NextResponse(`File Not Found: ${relativePath}`, { status: 404 })
    }

    const ext = path.extname(foundFilePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    const fileBuffer = fs.readFileSync(foundFilePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Error serving upload image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
