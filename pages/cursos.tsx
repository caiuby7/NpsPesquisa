import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import CursosPage from "./src/app/pages/cursos";

export default function CursosPageWrapper() {
  return (
    <Box>
      <AppHeader />
      <CursosPage />
    </Box>
  );
} 