import * as React from 'react';
import { Box, styled } from '@mui/material';

const AppFrameRoot = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  margin: 0,
  backgroundColor: theme.palette.background.default,
  overflow: 'auto',
  position: 'relative',
  boxShadow: theme.shadows[4],
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 'env(safe-area-inset-top, 0px)',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  paddingLeft: 'env(safe-area-inset-left, 0px)',
  paddingRight: 'env(safe-area-inset-right, 0px)',
  [theme.breakpoints.up('sm')]: {
    width: '100%',
    maxWidth: '430px',
    height: '100%',
    margin: 'auto',
    marginTop: '20px',
    marginBottom: '20px',
    borderRadius: '16px',
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
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <AppFrameRoot>{children}</AppFrameRoot>
    </Box>
  );
}