'use client'

import * as React from 'react'
import { useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type OptionInput = string | { label?: string; value: string }

function normalizeOptions(options?: OptionInput[]) {
  if (!options) return [] as { label: string; value: string }[]
  return options.map((opt) => {
    if (typeof opt === 'string') return { label: opt, value: opt }
    const label =
      typeof opt.label === 'string' ? opt.label : opt.label != null ? String(opt.label) : opt.value
    return { label, value: opt.value }
  })
}

/**
 * shadcn-powered single-value select for Payload's `select` field type.
 * For `hasMany: true` we fall back to a textual readout — Radix Select is
 * single-value by design; multi-select wants a different primitive.
 *
 * Drop in via:
 *   admin: { components: { Field: '@/components/admin/fields/SelectField' } }
 */
const SelectField: React.FC<SelectFieldClientProps> = (props) => {
  const path = props.path ?? props.field?.name ?? ''
  const { value, setValue, errorMessage, showError } = useField<string | string[]>({ path })

  const field = props.field
  const label = typeof field?.label === 'string' ? field.label : field?.name || ''
  const description =
    typeof field?.admin?.description === 'string' ? field.admin.description : undefined
  const required = field?.required === true
  const hasMany = (field as { hasMany?: boolean })?.hasMany === true
  const placeholder =
    (field as { admin?: { placeholder?: string } })?.admin?.placeholder || 'Auswählen…'
  const options = normalizeOptions((field as { options?: OptionInput[] })?.options)
  const id = `field-${path.replace(/\./g, '-')}`

  if (hasMany) {
    // Multi-select isn't Radix-Select; let Payload handle this case with its
    // own renderer. We render a hint so it's clear nothing's broken.
    const arrayValue = Array.isArray(value) ? value : []
    return (
      <div className="field-type select mb-4 flex flex-col gap-1.5">
        {label ? (
          <label className="text-[13px] font-medium text-foreground">
            {label}
            {required ? <span className="ml-1 text-destructive">*</span> : null}
          </label>
        ) : null}
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[13px] text-muted-foreground">
          {arrayValue.length
            ? options
                .filter((o) => arrayValue.includes(o.value))
                .map((o) => o.label)
                .join(', ')
            : 'Mehrfachauswahl — bitte Standardrenderer verwenden'}
        </div>
      </div>
    )
  }

  const singleValue = typeof value === 'string' ? value : ''

  return (
    <div className="field-type select mb-4 flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-foreground"
        >
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
      ) : null}
      <Select
        value={singleValue}
        onValueChange={(v) => setValue(v)}
        disabled={props.readOnly}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={showError || undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description ? <p className="text-[12px] text-muted-foreground">{description}</p> : null}
      {showError && errorMessage ? (
        <p className="text-[12px] text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}

export default SelectField
