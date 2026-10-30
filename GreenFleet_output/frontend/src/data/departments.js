export const DEPARTMENTS = [
  {
    id: 'engineering',
    name: 'Engineering / Software',
    lineManagers: [
      { name: 'Semilore', email: 'semilore@company.com' },
      { name: 'Gerald', email: 'gerald@company.com' },
    ],
  },
  {
    id: 'operations',
    name: 'Fleet & Logistics Operations',
    lineManagers: [
      { name: 'Chief Operations Officer', email: 'coo@company.com' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Accounts',
    lineManagers: [
      { name: 'Finance Lead', email: 'finance.lead@company.com' },
    ],
  },
  {
    id: 'hr',
    name: 'Human Resources & Admin',
    lineManagers: [
      { name: 'HR Manager', email: 'hr@company.com' },
    ],
  },
]

export function getManagersForDepartment(deptNameOrId) {
  if (!deptNameOrId) return []
  const match = DEPARTMENTS.find(
    (d) =>
      d.id.toLowerCase() === deptNameOrId.toLowerCase() ||
      d.name.toLowerCase() === deptNameOrId.toLowerCase()
  )
  return match ? match.lineManagers : []
}