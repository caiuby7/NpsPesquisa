// pages/form-builder.tsx
import CreateForm from "@/app/widgets/create-form/create-form.component";
import CreateQuestion from "@/app/widgets/create-question/create-question.component";
import { Box, Heading } from "@chakra-ui/react";

export default function CreateFormPage() {
  return (
    <Box p={8}>

      <CreateQuestion />
    </Box>
  );
}
