import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import ProfessoresPage from "./src/app/pages/professores";

export default function ProfessoresPageWrapper() {
  return (
    <Box>
      <AppHeader />
      <ProfessoresPage />
    </Box>
  );
}
