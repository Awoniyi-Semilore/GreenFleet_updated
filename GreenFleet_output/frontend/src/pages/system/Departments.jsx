import React, { useEffect, useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Mail,
  Building2,
  User,
  Briefcase,
} from 'lucide-react'

import { usePageMeta } from '../../components/Layout.jsx'
import { Field, Input } from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import { useToast } from '../../context/ToastContext.jsx'

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getSettings,
  updateSetting,
} from '../../data/api.js'

export default function Departments() {
  usePageMeta({
    title: 'Departments',
    breadcrumb: 'System Admin',
  })

  const { showToast } = useToast()

  const [departments, setDepartments] = useState([])

  const [
    groupTransportEmail,
    setGroupTransportEmail,
  ] = useState('transport@greenwichmerchantbank.com')

  const [loading, setLoading] = useState(true)

  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [newGroupEmail, setNewGroupEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  // Department modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState(null)

  const [form, setForm] = useState({
    name: '',
    line_manager_name: '',
    line_manager_email: '',
    line_manager_title: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      const [
        deptData,
        settingsData,
      ] = await Promise.all([
        getDepartments().catch(() => []),

        getSettings().catch((err) => {
          console.warn(
            'Settings API failed:',
            err
          )

          return null
        }),
      ])

      setDepartments(deptData || [])

      if (settingsData) {
        const savedEmail =
          settingsData?.company?.transport_email ||
          settingsData?.group_transport_email ||
          'transport@greenwichmerchantbank.com'

        setGroupTransportEmail(savedEmail)
      }
    } catch (err) {
      console.error(
        'Failed to load departments data:',
        err
      )

      showToast(
        'Failed to load departments.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  function openEmailModal() {
    setNewGroupEmail(groupTransportEmail)
    setEmailModalOpen(true)
  }

  async function handleSaveGroupEmail() {
    const email = newGroupEmail.trim()

    if (!email) {
      showToast(
        'Group transport email cannot be empty.',
        'error'
      )
      return
    }

    // Basic frontend validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email)) {
      showToast(
        'Please enter a valid email address.',
        'error'
      )
      return
    }

    setSavingEmail(true)

    try {
      /*
       * Save to the database.
       */
      await updateSetting('company', {
        name: 'Greenwich Merchant Bank',
        transport_email: email,
      })

      /*
       * Re-fetch settings from the backend.
       *
       * This is intentional: we want the UI to display
       * what the backend actually saved.
       */
      const settings = await getSettings()

      const savedEmail =
        settings?.company?.transport_email ||
        settings?.group_transport_email

      if (!savedEmail) {
        throw new Error(
          'The email was saved, but could not be retrieved from the server.'
        )
      }

      setGroupTransportEmail(savedEmail)
      setNewGroupEmail(savedEmail)

      setEmailModalOpen(false)

      showToast(
        'Group transport email updated successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to update group transport email:',
        err
      )

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Failed to update group transport email.',
        'error'
      )
    } finally {
      setSavingEmail(false)
    }
  }

  function openModal(dept = null) {
    setEditingDept(dept)

    if (dept) {
      setForm({
        name:
          dept.department_name ||
          dept.name ||
          '',

        line_manager_name:
          dept.line_manager_name ||
          dept.line_manager?.name ||
          '',

        line_manager_email:
          dept.line_manager_email ||
          dept.line_manager?.email ||
          '',

        line_manager_title:
          dept.line_manager_title ||
          dept.line_manager?.title ||
          '',
      })
    } else {
      setForm({
        name: '',
        line_manager_name: '',
        line_manager_email: '',
        line_manager_title: '',
      })
    }

    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast(
        'Department name is required.',
        'error'
      )
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        department_name: form.name.trim(),
        name: form.name.trim(),

        line_manager_name:
          form.line_manager_name.trim() || null,

        line_manager_email:
          form.line_manager_email.trim() || null,

        line_manager_title:
          form.line_manager_title.trim() || null,
      }

      if (editingDept) {
        await updateDepartment(
          editingDept.id,
          payload
        )

        showToast(
          'Department updated successfully.'
        )
      } else {
        await createDepartment(payload)

        showToast(
          'Department created successfully.'
        )
      }

      setModalOpen(false)
      setEditingDept(null)

      await loadData()
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          'Failed to save department.',
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget?.id) {
      return
    }

    try {
      await deleteDepartment(
        deleteTarget.id
      )

      showToast(
        'Department deleted successfully.'
      )

      setDeleteTarget(null)

      await loadData()
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          'Failed to delete department.',
        'error'
      )
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-5xl mx-auto px-1 sm:px-0">
        <div className="h-20 bg-surface border border-border-subtle rounded-card animate-pulse" />
        <div className="h-64 bg-surface border border-border-subtle rounded-card animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto px-1 sm:px-0">

      {/* Group Transport Email */}
      <div className="bg-surface border border-border-subtle rounded-card p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">

        <div className="flex items-start sm:items-center gap-3 min-w-0">

          <div className="h-10 w-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Mail size={18} className="sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0 flex-1">

            <h2 className="text-[11px] sm:text-xs font-semibold text-ink-500 uppercase tracking-wider">
              Group Transport Email
            </h2>

            <p className="text-sm sm:text-base font-semibold text-ink-900 mt-0.5 break-all sm:break-normal">
              {groupTransportEmail}
            </p>

          </div>

        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Pencil}
          onClick={openEmailModal}
          className="w-full sm:w-auto justify-center shrink-0"
        >
          Edit Email
        </Button>

      </div>

      {/* Departments */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">

        <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div>
            <h2 className="text-base font-semibold text-ink-900">
              All Departments
            </h2>

            <p className="text-xs text-ink-500 mt-0.5">
              Manage organizational departments and assigned line managers
            </p>
          </div>

          <Button
            icon={Plus}
            onClick={() => openModal()}
            className="w-full sm:w-auto justify-center"
          >
            Create Department
          </Button>

        </div>

        {/* Mobile */}
        <div className="block md:hidden divide-y divide-border-subtle">

          {departments.map((dept) => {
            const managerName =
              dept.line_manager_name ||
              dept.line_manager?.name

            const managerEmail =
              dept.line_manager_email ||
              dept.line_manager?.email

            const managerTitle =
              dept.line_manager_title ||
              dept.line_manager?.title

            return (
              <div
                key={dept.id}
                className="p-4 space-y-3"
              >

                <div className="flex items-start justify-between gap-2">

                  <div className="flex items-center gap-2 font-semibold text-ink-900">

                    <Building2
                      size={18}
                      className="text-brand-green shrink-0"
                    />

                    <span>
                      {dept.department_name ||
                        dept.name}
                    </span>

                  </div>

                  <div className="flex items-center gap-1 shrink-0">

                    <button
                      onClick={() =>
                        openModal(dept)
                      }
                      className="p-1.5 rounded hover:bg-surface-muted text-ink-400 hover:text-brand-green transition-colors"
                      aria-label="Edit department"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget(dept)
                      }
                      className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-status-rejected transition-colors"
                      aria-label="Delete department"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

                <div className="bg-surface-muted/60 rounded-btn p-3 space-y-1.5 text-xs text-ink-700">

                  <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1">
                    Line Manager
                  </div>

                  {managerName || managerEmail ? (
                    <>
                      <div className="font-medium text-ink-900 flex items-center gap-1.5">

                        <User
                          size={13}
                          className="text-ink-400 shrink-0"
                        />

                        <span>
                          {managerName || '—'}
                        </span>

                      </div>

                      {managerTitle && (
                        <div className="flex items-center gap-1.5 text-ink-600 pl-4">

                          <Briefcase
                            size={12}
                            className="text-ink-400 shrink-0"
                          />

                          <span>
                            {managerTitle}
                          </span>

                        </div>
                      )}

                      {managerEmail && (
                        <div className="flex items-center gap-1.5 text-ink-600 pl-4">

                          <Mail
                            size={12}
                            className="text-ink-400 shrink-0"
                          />

                          <span className="break-all">
                            {managerEmail}
                          </span>

                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-ink-400 italic">
                      No manager assigned
                    </span>
                  )}

                </div>

              </div>
            )
          })}

          {departments.length === 0 && (
            <div className="text-center py-10 px-4 text-ink-500 text-sm">
              No departments found. Click "Create Department" to add one.
            </div>
          )}

        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-surface-muted border-b border-border-subtle text-xs font-semibold text-ink-500">

              <tr>
                <th className="px-5 py-3">
                  Department
                </th>

                <th className="px-5 py-3">
                  Line Manager Details
                </th>

                <th className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-border-subtle">

              {departments.map((dept) => {

                const managerName =
                  dept.line_manager_name ||
                  dept.line_manager?.name

                const managerEmail =
                  dept.line_manager_email ||
                  dept.line_manager?.email

                const managerTitle =
                  dept.line_manager_title ||
                  dept.line_manager?.title

                return (
                  <tr
                    key={dept.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >

                    <td className="px-5 py-4 font-medium text-ink-900">

                      <div className="flex items-center gap-2.5">

                        <Building2
                          size={16}
                          className="text-ink-400 shrink-0"
                        />

                        <span>
                          {dept.department_name ||
                            dept.name}
                        </span>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-ink-700">

                      {managerName || managerEmail ? (
                        <div>

                          <div className="font-medium text-ink-900 flex items-center gap-1.5">

                            <User
                              size={13}
                              className="text-ink-400 shrink-0"
                            />

                            <span>
                              {managerName || '—'}
                            </span>

                            {managerTitle && (
                              <span className="text-xs text-ink-500 font-normal">
                                ({managerTitle})
                              </span>
                            )}

                          </div>

                          {managerEmail && (
                            <div className="text-xs text-ink-500 pl-4 mt-0.5 break-all">
                              {managerEmail}
                            </div>
                          )}

                        </div>
                      ) : (
                        <span className="text-ink-400">
                          —
                        </span>
                      )}

                    </td>

                    <td className="px-5 py-4 text-right">

                      <div className="flex items-center justify-end gap-1">

                        <button
                          onClick={() =>
                            openModal(dept)
                          }
                          className="p-1.5 rounded hover:bg-surface-muted text-ink-400 hover:text-brand-green transition-colors"
                          aria-label="Edit department"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteTarget(dept)
                          }
                          className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-status-rejected transition-colors"
                          aria-label="Delete department"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              })}

              {departments.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-10 text-ink-500"
                  >
                    No departments found. Click "Create Department" to add one.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Email Modal */}
      <Modal
        open={emailModalOpen}
        onClose={() =>
          setEmailModalOpen(false)
        }
        title="Edit Group Transport Email"
        footer={
          <>
            <Button
              variant="tertiary"
              onClick={() =>
                setEmailModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveGroupEmail}
              loading={savingEmail}
            >
              Save Email
            </Button>
          </>
        }
      >
        <Field
          label="Transport Email Address"
          required
        >
          <Input
            type="email"
            value={newGroupEmail}
            onChange={(e) =>
              setNewGroupEmail(e.target.value)
            }
            placeholder="e.g. transport@greenwichmerchantbank.com"
          />
        </Field>
      </Modal>

      {/* Department Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingDept(null)
        }}
        title={
          editingDept
            ? 'Edit Department'
            : 'Create Department'
        }
        footer={
          <>
            <Button
              variant="tertiary"
              onClick={() => {
                setModalOpen(false)
                setEditingDept(null)
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              loading={submitting}
            >
              {editingDept
                ? 'Save Changes'
                : 'Create'}
            </Button>
          </>
        }
      >

        <div className="space-y-4">

          <Field
            label="Department Name"
            required
          >
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Finance, Human Resources, IT"
            />
          </Field>

          <div className="border-t border-border-subtle pt-3">

            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">
              Line Manager Details
            </p>

            <div className="space-y-3">

              <Field label="Line Manager Name">
                <Input
                  value={
                    form.line_manager_name
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      line_manager_name:
                        e.target.value,
                    }))
                  }
                  placeholder="e.g. John Doe"
                />
              </Field>

              <Field label="Line Manager Email">
                <Input
                  type="email"
                  value={
                    form.line_manager_email
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      line_manager_email:
                        e.target.value,
                    }))
                  }
                  placeholder="e.g. j.doe@company.com"
                />
              </Field>

              <Field label="Line Manager Title (Optional)">
                <Input
                  value={
                    form.line_manager_title
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      line_manager_title:
                        e.target.value,
                    }))
                  }
                  placeholder="e.g. Head of Finance, Senior Manager"
                />
              </Field>

            </div>

          </div>

        </div>

      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() =>
          setDeleteTarget(null)
        }
        title="Delete Department?"
        footer={
          <>
            <Button
              variant="tertiary"
              onClick={() =>
                setDeleteTarget(null)
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructiveSolid"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">

          Are you sure you want to delete{' '}

          <strong>
            {deleteTarget?.department_name ||
              deleteTarget?.name}
          </strong>
          ?

          <br />

          This action cannot be undone.

        </p>
      </Modal>

    </div>
  )
}