// Outer shell — no auth here; auth lives in (protected)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
