import React, { useEffect, useState } from 'react'
import { FileSpreadsheet, FileText, FileBarChart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { usePageMeta } from '../../components/Layout.jsx'
import { PillTabs } from '../../components/Segmented.jsx'
import { Select } from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { getVehicles, getDrivers, getBranches, getAnalytics, exportReport, getReportPreview } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function Reports() {
  usePageMeta({ title: 'Reports', breadcrumb: 'Transport Admin' })
  const { showToast } = useToast()
  const [period, setPeriod] = useState('weekly')
  const [branch, setBranch] = useState('')
  const [driver, setDriver] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [generated, setGenerated] = useState(false)
  const [branches, setBranches] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [b, d, v, a] = await Promise.all([
          getBranches(),
          getDrivers(),
          getVehicles(),
          getAnalytics().catch(() => null),
        ])
        setBranches(b)
        setDrivers(d)
        setVehicles(v)
        setAnalytics(a)
      } catch (err) {
        console.error('Failed to load report filter data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const data = await getReportPreview({ period, branch, driver, vehicle })
      setReportData(data)
      setGenerated(true)
    } catch (err) {
      console.error('Failed to generate report preview:', err)
      showToast('Failed to generate preview', 'error')
    } finally {
      setGenerating(false)
    }
  }

  function handleExport(kind) {
    setExporting(true)
    exportReport({
      period,
      branch,
      driver,
      vehicle,
      format: kind.toLowerCase(),
    })
      .then((blob) => {
        const ext = kind.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx'
        const mime = ext === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        const file = new Blob([blob], { type: mime })
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = `greenfleet_report_${period}_${new Date().toISOString().slice(0,10)}.${ext}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
        showToast(`${kind} report downloaded`)
      })
      .catch((err) => {
        console.error('Export failed:', err)
        if (err.response?.data instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const json = JSON.parse(reader.result)
              showToast(json.message || 'Export failed', 'error')
            } catch {
              showToast('Export failed', 'error')
            }
          }
          reader.readAsText(err.response.data)
        } else {
          showToast(err.message || 'Export failed', 'error')
        }
      })
      .finally(() => {
        setExporting(false)
      })
  }

  // Use reportData when generated, fallback to analytics for initial load
  const displayData = generated ? reportData : analytics

  const approvalTrend = displayData?.avgApprovalTrend?.map((v, i) => ({ day: `D${i + 1}`, minutes: v })) || []
  const tripTrend = displayData?.avgTripTrend?.map((v, i) => ({ day: `D${i + 1}`, minutes: v })) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-5 h-fit">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Report Period</h3>
        <PillTabs
          options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]}
          value={period}
          onChange={setPeriod}
        />

        <div className="flex flex-col gap-3 mt-5">
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1.5">Branch</label>
            <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name || b.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1.5">Driver</label>
            <Select value={driver} onChange={(e) => setDriver(e.target.value)}>
              <option value="">All Drivers</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{`${d.first_name || ''} ${d.last_name || ''}`.trim() || d.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1.5">Vehicle</label>
            <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              <option value="">All Vehicles</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number || v.plate}</option>)}
            </Select>
          </div>
        </div>

        <Button fullWidth className="mt-5" onClick={handleGenerate} loading={generating || loading}>
          Generate
        </Button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
        {!generated ? (
          <EmptyState icon={FileBarChart} message="Choose filters and generate a report to see a preview here." />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-sm font-semibold text-ink-900 capitalize">{period} Report</h3>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={FileSpreadsheet} onClick={() => handleExport('Excel')} loading={exporting}>
                  Export Excel
                </Button>
                <Button variant="secondary" size="sm" icon={FileText} onClick={() => handleExport('PDF')} loading={exporting}>
                  Export PDF
                </Button>
              </div>
            </div>

            {displayData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-surface-muted rounded-lg p-3">
                    <div className="text-xs text-ink-600">Avg Approval Time</div>
                    <div className="text-lg font-semibold text-ink-900">{displayData.avgApprovalTime ?? '—'}</div>
                  </div>
                  <div className="bg-surface-muted rounded-lg p-3">
                    <div className="text-xs text-ink-600">Avg Trip Time</div>
                    <div className="text-lg font-semibold text-ink-900">{displayData.avgTripTime ?? '—'}</div>
                  </div>
                  <div className="bg-surface-muted rounded-lg p-3">
                    <div className="text-xs text-ink-600">Requests/Day</div>
                    <div className="text-lg font-semibold text-ink-900">{displayData.avgRequestsPerDay ?? '—'}</div>
                  </div>
                  <div className="bg-surface-muted rounded-lg p-3">
                    <div className="text-xs text-ink-600">Top Branch</div>
                    <div className="text-lg font-semibold text-ink-900 truncate">{displayData.mostRequestedBranches?.[0]?.branch || '—'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border border-border-subtle rounded-lg p-4">
                    <h4 className="text-sm font-medium text-ink-900 mb-3">Approval Time Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={approvalTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="minutes" fill="#006527" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border border-border-subtle rounded-lg p-4">
                    <h4 className="text-sm font-medium text-ink-900 mb-3">Trip Duration Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={tripTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="minutes" fill="#85CA23" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-sm text-ink-600">
                <p>Analytics data not available. Generate to see report preview.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}