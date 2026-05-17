import { requireAdmin } from '@/lib/adminAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f0ea' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: '220px', padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
