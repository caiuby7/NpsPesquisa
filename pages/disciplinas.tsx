import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import DisciplinasPage from "./src/app/pages/disciplinas";

export default function DisciplinasPageWrapper() {
  return (
    <Box>
      <AppHeader />
      <DisciplinasPage />
    </Box>
  );
}
