import path from 'path'
import { PrismaClient } from '@/app/generated/prisma/client'

function makePrisma() {
  const url = process.env.DATABASE_URL ?? ''

  // Production: PostgreSQL
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

const globalForPrisma = globalThis as unknown as { _prisma: PrismaClient | undefined }

// Lazy getter — Prisma is not instantiated at module load (build) time,
// only when first accessed at request time when DATABASE_URL is available.
export function getPrisma(): PrismaClient {
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = makePrisma()
  }
  return globalForPrisma._prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
