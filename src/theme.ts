import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Stack: {
      baseStyle: {
        spacing: 4,
      },
    },
    Button: {
      baseStyle: {
        _disabled: {
          opacity: 0.4,
          cursor: 'not-allowed',
        },
      },
    },
  },
});

export default theme; 
