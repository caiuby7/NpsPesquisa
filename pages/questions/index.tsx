// pages/form-builder.tsx
import { AppHeader } from "../../src/app/features/header/header.component";
import QuestionsWidget from "../../src/app/widgets/questions/questions.component";
import { withAuth } from "../../src/lib/withAuth";
import { Box } from "@chakra-ui/react";

export const getServerSideProps = withAuth();

export default function Questions() {
  return (
    <Box>
      <AppHeader />
      <QuestionsWidget />
    </Box>
  );
}
