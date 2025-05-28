// pages/form-builder.tsx
import { AppHeader } from "@/app/features/header/header.component";
import QuestionsWidget from "@/app/widgets/questions/questions.component";
import { withAuth } from "@/lib/withAuth";
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
