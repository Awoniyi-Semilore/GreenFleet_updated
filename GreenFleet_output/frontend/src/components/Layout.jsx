import React from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [meta, setMeta] = React.useState({ title: '', breadcrumb: '' })

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Topbar
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
            <Outlet context={{ setMeta }} />
          </div>
        </main>
      </div>
    </div>
  )
}

export function usePageMeta({ title, breadcrumb }) {
  const { setMeta } = useOutletContext()
  React.useEffect(() => {
    setMeta({ title, breadcrumb })
    document.title = title ? `${title} — GreenFleet` : 'GreenFleet'
  }, [title, breadcrumb, setMeta])
}
