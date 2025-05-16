"use client"

import { Portal, Select, createListCollection } from "@chakra-ui/react"

export const CustomSelect = () => {
  return (
    <Select.Root collection={frameworks} size="sm" width="320px" defaultValue={["text_box"]}>
      <Select.HiddenSelect />
      <Select.Label>Tipo da questão</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select o Tipo da Questão" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {frameworks.items.map((framework) => (
              <Select.Item item={framework} key={framework.value}>
                {framework.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}

const frameworks = createListCollection({
  items: [
    { value: "multiple_choice", label: "Múltipla Escolha" },
    { value: "text_box", label: "Caixa de texto" },
    { value: "dropdown", label: "Menu suspenso" },
    { value: "worst_best", label: "Pior Melhor" },
    { value: "matrix", label: "Matriz" },
    { value: "slider", label: "Barra de deslizar" },
  ],
})
