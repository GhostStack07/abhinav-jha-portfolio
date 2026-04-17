import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const { status, notes } = body

    const lead = await prisma.lead.update({
      where: { id: Number(id) },
      data: { status, notes },
    })
    return NextResponse.json(lead)
  } catch (err) {
    console.error('[leads/id] PATCH error:', err)
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.lead.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[leads/id] DELETE error:', err)
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
