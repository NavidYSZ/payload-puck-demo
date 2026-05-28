'use client'

import * as React from 'react'
import { useField } from '@payloadcms/ui'
import type { CheckboxFieldClientProps } from 'payload'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/utilities/ui'

/**
 * shadcn-powered checkbox for Payload custom-field slots.
 * Drop into a CheckboxField via:
 *   admin: { components: { Field: '@/components/admin/fields/CheckboxField' } }
 */
const CheckboxField: React.FC<CheckboxFieldClientProps> = (props) => {
  const path = props.path ?? props.field?.name ?? ''
  const { value, setValue, errorMessage, showError } = useField<boolean>({ path })

  const label =
    typeof props.field?.label === 'string' ? props.field.label : props.field?.name || ''
  const description =
    typeof props.field?.admin?.description === 'string'
      ? props.field.admin.description
      : undefined
  const required = props.field?.required === true
  const id = `field-${path.replace(/\./g, '-')}`

  return (
    <div className={cn('field-type checkbox mb-4 flex flex-col gap-1.5')}>
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(checked) => setValue(checked === true)}
          disabled={props.readOnly}
          aria-invalid={showError || undefined}
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-[13px] font-medium text-foreground select-none"
        >
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
      </div>
      {description ? (
        <p className="ml-6 text-[12px] text-muted-foreground">{description}</p>
      ) : null}
      {showError && errorMessage ? (
        <p className="ml-6 text-[12px] text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}

export default CheckboxField
