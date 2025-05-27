/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Portal, Select, createListCollection } from "@chakra-ui/react"
import { Controller } from "react-hook-form"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomSelect = ({ control, items, label, placeholder, name }: any) => {
  const frameworks = createListCollection({
    items,
  })

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select.Root
          name={field.name}
          value={field.value}
          onValueChange={({ value }) => field.onChange(value)}
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
                {frameworks.items.map((framework: any) => (
                  <Select.Item item={framework} key={framework.value}>
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


