import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import InstituicoesPage from "./src/app/pages/instituicoes";

export default function InstituicoesPageWrapper() {
  return (
    <Box>
      <AppHeader />
      <InstituicoesPage />
    </Box>
  );
}
