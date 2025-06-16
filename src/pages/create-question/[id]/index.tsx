import { useParams } from "react-router-dom";
import { AppHeader } from "../../../components/header/header.component";
import CreateQuestionComponent from "../../../app/widgets/create-question/create-question.component";
import { Box } from "@chakra-ui/react";

export default function CreateQuestionWithIdPage() {
  const { id } = useParams();

  return (
    <Box>
      <AppHeader />
      <CreateQuestionComponent initialData={{ id: id }} />
    </Box>
  );
} 