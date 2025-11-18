import { Box } from "@chakra-ui/react";
import { AppHeader } from "./src/app/features/header/header.component";
import QuestoesVinculosWidget from "./src/app/widgets/questoes-vinculos/questoes-vinculos.widget";
import { withAuth } from "./src/lib/withAuth";

export const getServerSideProps = withAuth();

export default function QuestoesVinculosPage() {
  return (
    <Box>
      <AppHeader />
      <QuestoesVinculosWidget />
    </Box>
  );
}

