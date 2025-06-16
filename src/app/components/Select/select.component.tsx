/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Portal, Select } from "@chakra-ui/react"
import { Controller, Control } from "react-hook-form"

interface CustomSelectProps {
  control: Control<any>;
  items: { value: string | number; label: string }[];
  label?: string;
  placeholder?: string;
  name: string;
  invalid?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  control,
  items,
  label,
  placeholder,
  name,
  invalid
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          placeholder={placeholder}
          isInvalid={invalid}
          {...field}
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      )}
    />
  );
};


