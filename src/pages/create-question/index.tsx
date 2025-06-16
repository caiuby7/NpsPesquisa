import { AppHeader } from "../../components/header/header.component";
import CreateQuestion from "../../app/widgets/create-question/create-question.component";
import { Box } from "@chakra-ui/react";

export default function CreateQuestionPage() {
  return (
    <Box>
      <AppHeader />
      <CreateQuestion />
    </Box>
  );
} 