import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import TurmaDisciplinaPage from "./src/app/pages/turma-disciplina";

export default function TurmaDisciplinaPageWrapper() {
  return (
    <Box>
      <AppHeader />
      <TurmaDisciplinaPage />
    </Box>
  );
}
