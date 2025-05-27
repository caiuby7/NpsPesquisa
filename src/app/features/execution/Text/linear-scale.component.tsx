import React from 'react';
import {
  Box,
  Text,
  Textarea,
} from '@chakra-ui/react';


export const TextBox: React.FC= () => {

  return (
    <Box
      borderRadius="md"
      p={4}
      borderWidth="1px"
      mt="24px"
      textAlign="center"
      w="100%"
    >
      <Text mb={4} fontWeight="bold" textAlign="left">
        Como você avalia os seguintes aspectos?
      </Text>
      <Textarea placeholder="Resposta do usuário" />
    </Box>
  );
};
