import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import PeriodosLetivosPage from "./src/app/pages/periodos-letivos";

export default function PeriodosLetivosPageWrapper() {
  return (
    <Box>
      <AppHeader />
      <PeriodosLetivosPage />
    </Box>
  );
}
