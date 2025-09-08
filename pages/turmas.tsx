import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import TurmasPage from "./src/app/pages/turmas";

export default function TurmasPageWrapper() {
  return (
    <Box>
      <AppHeader />
      <TurmasPage />
    </Box>
  );
}
