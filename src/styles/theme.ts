import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#fbd700', // رنگ اصلی (آبی Material Design)
    },
    secondary: {
      main: '#002047', // رنگ ثانویه
    },
  },
  typography: {
    fontFamily: '"iranYekan", "Helvetica", "Arial", sans-serif', // فونت استاندارد Material Design
  },
});

export default theme;