import path from 'path'
import { PrismaClient } from '@/app/generated/prisma/client'

function makePrisma() {
  const url = process.env.DATABASE_URL ?? ''

  // Production: PostgreSQL (Railway provides a postgres:// DATABASE_URL)
  if (url.startsWith('postgres')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg') as typeof import('pg')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg')
    const pool = new Pool({ connectionString: url })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter: new PrismaPg(pool) } as any)
  }

  // Development: local SQLite via libSQL
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaLibSql } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')
  const dbPath = path.resolve(process.cwd(), 'prisma/dev.db')
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? makePrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
