import { Box } from "@chakra-ui/react";
import MainLayout from "../../components/layout/main-layout.component";
import QuestoesVinculosWidget from "../../app/widgets/questoes-vinculos/questoes-vinculos.widget";

export default function QuestoesVinculosPage() {
  return (
    <MainLayout>
      <Box px={4} py={6}>
        <QuestoesVinculosWidget />
      </Box>
    </MainLayout>
  );
}

