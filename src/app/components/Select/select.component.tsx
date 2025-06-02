/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Portal, Select, createListCollection } from "@chakra-ui/react"
import { Controller } from "react-hook-form"

interface CustomSelectProps {
  control: any;
  items: { value: string | number; label: string }[];
  label?: string;
  placeholder?: string;
  name: string;
  invalid?: boolean;
}

export const CustomSelect = ({ control, items, label, placeholder, name, invalid }: CustomSelectProps) => {
  const frameworks = createListCollection({
    items,
  })

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select.Root
          invalid={invalid}
          name={field.name}
          value={field.value ? [field.value] : []}
          onValueChange={({ value }) => field.onChange(value[0])}
          onInteractOutside={() => field.onBlur()}
          collection={frameworks}
        >
          <Select.HiddenSelect />
          {label && <Select.Label>{label}</Select.Label>}

          <Select.Control>
            <Select.Trigger>
               <Select.ValueText placeholder={placeholder} />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {frameworks.items.map((framework) => (
                  <Select.Item key={framework.value} item={framework}>
                    {framework.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      )}
    />
  )
}


