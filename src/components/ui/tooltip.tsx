import { Tooltip as ChakraTooltip, TooltipProps as ChakraTooltipProps } from "@chakra-ui/react"
import * as React from "react"

export interface TooltipProps extends ChakraTooltipProps {
  showArrow?: boolean
  label: string
  disabled?: boolean
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      label,
      ...rest
    } = props

    if (disabled) return <>{children}</>

    return (
      <ChakraTooltip label={label} hasArrow={showArrow} {...rest} ref={ref}>
        {children}
      </ChakraTooltip>
    )
  },
)
