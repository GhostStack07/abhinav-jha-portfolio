import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function getOrCreate() {
  return prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  })
}

export async function GET() {
  try {
    const settings = await getOrCreate()
    return NextResponse.json(settings)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...body },
      update: body,
    })
    return NextResponse.json(settings)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
