// components/Indicator.tsx
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// تعریف نوع پراپ‌ها
interface IndicatorProps {
  active: boolean;
  onClick?: () => void;
}

// تعریف کامپوننت با استفاده از styled
const Indicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active', // جلوگیری از ارسال پراپ active به DOM
})<IndicatorProps>(({ theme, active }) => ({
  width: '99px',
  height: '6px',
  backgroundColor: active ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.5)',
  borderRadius: '0',
  transition: 'background-color 0.3s',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    opacity: 0.8,
  },
}));

export default Indicator;