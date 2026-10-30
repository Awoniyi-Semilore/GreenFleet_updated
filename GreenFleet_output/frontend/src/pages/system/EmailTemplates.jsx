import React, { useEffect, useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { usePageMeta } from '../../components/Layout.jsx'
import Button from '../../components/Button.jsx'
import { Field, Input, Textarea } from '../../components/FormField.jsx'
import { getEmailTemplates, updateEmailTemplate } from '../../data/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const MERGE_TAGS = ['{{staff_name}}', '{{request_id}}', '{{destination}}', '{{driver_name}}', '{{driver_phone}}', '{{vehicle_plate}}', '{{temp_password}}', '{{rejection_reason}}']

export default function EmailTemplates() {
  usePageMeta({ title: 'Email Templates', breadcrumb: 'System Admin' })
  const { showToast } = useToast()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      const data = await getEmailTemplates()
      setTemplates(data)
    } catch (err) {
      console.error('Failed to load templates:', err)
      // Fallback to empty array — backend may not have this endpoint yet
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const active = templates.find((t) => t.id === activeId)

  function updateActive(patch) {
    setTemplates((ts) => ts.map((t) => (t.id === activeId ? { ...t, ...patch } : t)))
  }

  async function handleSave() {
    if (!active) return
    try {
      await updateEmailTemplate(active.id, active)
      showToast('Template saved.')
    } catch (err) {
      showToast('Failed to save template.', 'error')
    }
  }

  function handleSendTest() {
    showToast('Test email requires backend endpoint.')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent"></div>
      </div>
    )
  }

  if (active) {
    return (
      <div className="max-w-[720px]">
        <button onClick={() => setActiveId(null)} className="text-sm text-brand-green hover:underline mb-4">← Back to templates</button>

        <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
          <Field label="Subject">
            <Input value={active.subject || active.title || ''} onChange={(e) => updateActive({ subject: e.target.value })} />
          </Field>

          <div className="mb-2">
            <label className="block text-sm font-medium text-ink-900 mb-1.5">Available merge tags</label>
            <div className="flex flex-wrap gap-2">
              {MERGE_TAGS.map((tag) => (
                <span key={tag} className="font-mono text-xs bg-brand-lime-100 text-[#5c8a17] px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          <Field label="Body">
            <Textarea rows={10} value={active.body || active.message || ''} onChange={(e) => updateActive({ body: e.target.value })} className="font-mono text-[13px]" />
          </Field>

          <div className="flex items-center gap-3 mt-2">
            <Button onClick={handleSave}>Save Template</Button>
            <Button variant="secondary" icon={Send} onClick={handleSendTest}>Send Test Email</Button>
          </div>
        </div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6 text-center">
        <Mail size={32} className="text-ink-300 mx-auto mb-3" />
        <p className="text-sm text-ink-600">No email templates configured yet.</p>
        <p className="text-xs text-ink-400 mt-1">Backend endpoint for email templates not implemented.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveId(t.id)}
          className="text-left bg-surface border border-border-subtle rounded-card shadow-card p-5 hover:border-brand-green transition-colors duration-150"
        >
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-brand-green" />
            <h3 className="text-sm font-semibold text-ink-900">{t.name || t.title}</h3>
          </div>
          <p className="text-sm text-ink-600 mb-3 truncate">{t.subject || t.message || ''}</p>
          <p className="text-xs text-ink-300">Last edited {t.lastEdited || t.updated_at || '—'}</p>
        </button>
      ))}
    </div>
  )
}