import { AppHeader } from "../../src/app/features/header/header.component";
import CreateQuestion from "../../src/app/widgets/create-question/create-question.component";
import { withAuth } from "../../src/lib/withAuth";
import { Box } from "@chakra-ui/react";


export const getServerSideProps = withAuth();

export default function CreateFormPage() {
  return (
    <Box>
      <AppHeader />
      <CreateQuestion />
    </Box>
  );
}
