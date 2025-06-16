import { AppHeader } from "../../components/header/header.component";
import QuestionsWidget from "../../app/widgets/questions/questions.component";
import { Box } from "@chakra-ui/react";

export default function QuestionsPage() {
  return (
    <Box>
      <AppHeader />
      <QuestionsWidget />
    </Box>
  );
} 