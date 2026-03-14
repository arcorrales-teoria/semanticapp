// ─── Client-safe constants ───────────────────────────────────────────────────
// Never put secrets here — this file is bundled with the browser bundle.

export const DEPARTMENTS = [
  { value: 'marketing',        label: 'Marketing' },
  { value: 'producto',         label: 'Producto' },
  { value: 'customer-success', label: 'Customer Success' },
  { value: 'ventas',           label: 'Ventas' },
  { value: 'people',           label: 'People' },
  { value: 'growth',           label: 'Growth' },
] as const

export type DepartmentValue = typeof DEPARTMENTS[number]['value']
