import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
  console.log('Using DB host:', process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : 'UNDEFINED')

  const usersToSeed = [
    {
      email: 'shiva@obrive.com',
      name: 'Shiva Admin',
      plainPassword: 'obpark-admin-00',
      role: Role.ADMIN_OBPARK,
    },
    {
      email: 'admin@obrive.com',
      name: 'Admin Obpark',
      plainPassword: 'obpark-admin-01',
      role: Role.ADMIN_OBPARK,
    },
  ]

  for (const u of usersToSeed) {
    const passwordHash = await bcrypt.hash(u.plainPassword, 10)
    const admin = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        role: u.role,
        isVerified: true,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        isVerified: true,
      },
    })

    console.log(`✅ User created/updated: ${admin.email} (Role: ${admin.role})`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
