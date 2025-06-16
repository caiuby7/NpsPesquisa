"use client"

import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"

export { useColorModeValue }

export const ColorModeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <IconButton
      aria-label="Alternar tema"
      icon={colorMode === "light" ? <LuMoon /> : <LuSun />}
      onClick={toggleColorMode}
      variant="ghost"
    />
  )
}
