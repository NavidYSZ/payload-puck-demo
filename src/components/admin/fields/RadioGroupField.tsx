'use client'

import * as React from 'react'
import { useField } from '@payloadcms/ui'
import type { RadioFieldClientProps } from 'payload'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/utilities/ui'

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
 * shadcn-powered radio group for Payload's radio field type.
 * Drop in via:
 *   admin: { components: { Field: '@/components/admin/fields/RadioGroupField' } }
 */
const RadioGroupField: React.FC<RadioFieldClientProps> = (props) => {
  const path = props.path ?? props.field?.name ?? ''
  const { value, setValue } = useField<string>({ path })

  const field = props.field as RadioFieldClientProps['field'] | undefined
  const label = typeof field?.label === 'string' ? field.label : field?.name || ''
  const description =
    typeof field?.admin?.description === 'string' ? field.admin.description : undefined
  const required = field?.required === true
  const layout = field?.admin?.layout === 'horizontal' ? 'horizontal' : 'vertical'
  const options = normalizeOptions(field?.options as OptionInput[] | undefined)
  const baseId = `field-${path.replace(/\./g, '-')}`

  return (
    <div className="field-type radio-input mb-4 flex flex-col gap-2">
      {label ? (
        <label className="text-[13px] font-medium text-foreground">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
      ) : null}
      <RadioGroup
        value={value || ''}
        onValueChange={setValue}
        disabled={props.readOnly}
        className={cn(layout === 'horizontal' ? 'flex flex-wrap gap-x-6 gap-y-3' : 'grid gap-2.5')}
      >
        {options.map((opt) => {
          const id = `${baseId}-${opt.value}`
          return (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem id={id} value={opt.value} />
              <label
                htmlFor={id}
                className="cursor-pointer text-[13px] text-foreground select-none"
              >
                {opt.label}
              </label>
            </div>
          )
        })}
      </RadioGroup>
      {description ? <p className="text-[12px] text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export default RadioGroupField
