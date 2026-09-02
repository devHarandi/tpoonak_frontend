import * as React from 'react';
import { Box, styled } from '@mui/material';

const AppFrameRoot = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100dvh',
  margin: 0,
  backgroundColor: theme.palette.background.default,
  overflow: 'auto',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 'env(safe-area-inset-top, 0px)',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  paddingLeft: 'env(safe-area-inset-left, 0px)',
  paddingRight: 'env(safe-area-inset-right, 0px)',
  [theme.breakpoints.up('sm')]: {
    width: '100%',
    maxWidth: '640px',
    minHeight: '100dvh',
    margin: 'auto',
    borderLeft: '1px solid #dce6e0',
    borderRight: '1px solid #dce6e0',
  },
}));

interface AppFrameProps {
  children: React.ReactNode;
}

export default function AppFrame({ children }: AppFrameProps) {
  return (
    <Box
      sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      minHeight: '100vh',
      width: '100%',
      }}
    >
      <AppFrameRoot>{children}</AppFrameRoot>
    </Box>
  );
}
