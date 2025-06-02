const theme = {
  colors: {
    brand: {
      500: '#9d2235',
      600: '#7a1a29',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Link: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
}

export default theme 