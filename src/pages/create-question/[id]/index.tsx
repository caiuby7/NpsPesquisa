import { AppHeader } from "@/app/features/header/header.component";
import CreateQuestion from "@/app/widgets/create-question/create-question.component";
import { withAuth } from "@/lib/withAuth";
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
