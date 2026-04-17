import { prisma } from '@/lib/db'
import Link from 'next/link'
import LeadRow from '@/components/LeadRow'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })

  const counts = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    closed: leads.filter(l => l.status === 'closed').length,
  }

  return (
    <div className="crm-wrap">
      <div className="crm-header">
        <h1>Lead <i>CRM</i></h1>
        <Link href="/" className="crm-back">← Back to site</Link>
      </div>

      {/* Stats */}
      <div className="crm-stats">
        {[
          { label: 'Total leads', value: counts.total },
          { label: 'New', value: counts.new },
          { label: 'Contacted', value: counts.contacted },
          { label: 'Qualified', value: counts.qualified },
          { label: 'Closed', value: counts.closed },
        ].map(s => (
          <div className="crm-stat" key={s.label}>
            <div className="sv">{s.value}</div>
            <div className="sk">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {leads.length === 0 ? (
        <div className="crm-empty">No leads yet · Submit the form to get started</div>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Name / Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Budget</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <LeadRow
                  key={lead.id}
                  lead={{
                    ...lead,
                    createdAt: lead.createdAt.toISOString(),
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 40, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
        Data stored locally in SQLite · {leads.length} record{leads.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
