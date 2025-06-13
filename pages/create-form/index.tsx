// pages/form-builder.tsx
import { AppHeader } from "@/app/features/header/header.component";
import CreateForm from "@/app/widgets/create-form/create-form.component";
import { withAuth } from "@/lib/withAuth";
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
