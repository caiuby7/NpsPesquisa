// pages/form-builder.tsx
import { AppHeader } from "../../src/app/features/header/header.component";
import CreateForm from "../../src/app/widgets/create-form/create-form.component";
import { withAuth } from "../../src/lib/withAuth";
import { Box } from "@chakra-ui/react";

export const getServerSideProps = withAuth();

export default function CreateFormPage() {
  return (
    <Box>
      <AppHeader />
      <CreateForm />
    </Box>
  );
}
