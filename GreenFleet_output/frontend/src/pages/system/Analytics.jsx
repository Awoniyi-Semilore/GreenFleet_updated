import React, { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { usePageMeta } from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { getAnalytics } from '../../data/api.js'

export default function Analytics() {
  usePageMeta({ title: 'Analytics', breadcrumb: 'System Admin / Dashboard' })
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getAnalytics()
        setAnalytics(data)
        setError('')
      } catch (err) {
        console.error('Failed to load analytics:', err)
        setError('Failed to load analytics data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-4 py-3">
          {error}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-ink-600">No analytics data available.</div>
      </div>
    )
  }

  const approvalTrend = (analytics.avgApprovalTrend || []).map((v, i) => ({ day: `D${i + 1}`, minutes: v }))
  const tripTrend = (analytics.avgTripTrend || []).map((v, i) => ({ day: `D${i + 1}`, minutes: v }))

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Avg. Approval Time" value={analytics.avgApprovalTime || '—'} tone="green" compact />
        <StatCard label="Avg. Trip Time" value={analytics.avgTripTime || '—'} tone="blue" compact />
        <StatCard label="Avg. Requests / Day" value={analytics.avgRequestsPerDay ?? '—'} tone="lime" compact />
        <StatCard label="Busiest Branch" value={analytics.mostRequestedBranches?.[0]?.branch || '—'} tone="amber" compact />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Approval Time Trend (min)">
          {approvalTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={approvalTrend}>
                <CartesianGrid stroke="#E1E7E2" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4B564E' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4B564E' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="minutes" stroke="#006527" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Trip Duration Trend (min)">
          {tripTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={tripTrend}>
                <CartesianGrid stroke="#E1E7E2" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4B564E' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4B564E' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="minutes" stroke="#85CA23" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Most Requested Branches">
          {analytics.mostRequestedBranches?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.mostRequestedBranches} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="branch" width={100} tick={{ fontSize: 11, fill: '#4B564E' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#E6F0E9' }} />
                <Bar dataKey="count" fill="#006527" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Most Used Vehicles">
          {analytics.mostUsedVehicles?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.mostUsedVehicles}>
                <XAxis dataKey="plate" tick={{ fontSize: 11, fill: '#4B564E' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4B564E' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#E6F0E9' }} />
                <Bar dataKey="trips" fill="#85CA23" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
      <h3 className="text-sm font-semibold text-ink-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function NoData() {
  return (
    <div className="flex items-center justify-center h-[220px] text-sm text-ink-500">
      No data available for this period.
    </div>
  )
}
