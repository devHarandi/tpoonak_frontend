import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#08784f',
      dark: '#075c3e',
      light: '#e6f4ee',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f4c400',
      dark: '#c79e00',
      light: '#fff8d9',
      contrastText: '#17231e',
    },
    background: {
      default: '#eef3f0',
      paper: '#ffffff',
    },
    text: {
      primary: '#17231e',
      secondary: '#65746c',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"iranYekan", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: 'rtl',
          backgroundColor: '#eef3f0',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          minHeight: 44,
          textTransform: 'none',
          fontFamily: 'iranYekan, sans-serif',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e1eae5',
          backgroundImage: 'none',
          boxShadow: '0 10px 30px rgba(22, 50, 38, 0.06)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#ffffff',
          '& fieldset': { borderColor: '#dce6e0' },
          '&:hover fieldset': { borderColor: '#9db8aa' },
          '&.Mui-focused fieldset': { borderColor: '#08784f', borderWidth: 1 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10, fontFamily: 'iranYekan, sans-serif' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 22, border: '1px solid #e1eae5' },
      },
    },
  },
});

export default theme;
