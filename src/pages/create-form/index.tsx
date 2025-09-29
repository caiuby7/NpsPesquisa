import { AppHeader } from "../../components/header/header.component";
import CreateForm from "../../app/widgets/create-form/create-form.component";
import { Box } from "@chakra-ui/react";

export default function CreateFormPage() {
  return (
    <Box>
      <AppHeader />
      <CreateForm />
    </Box>
  );
} 
