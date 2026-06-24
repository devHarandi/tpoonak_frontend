import AppFrame from '@/components/common/AppFrame';
import Header from '@/components/common/Header';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useState, useEffect } from 'react';

// انیمیشن حرکت کامیون در محدوده صفحه
const moveVehicle = keyframes`
  0% { transform: translateX(80%) scale(1); }
  50% { transform: translateX(0%) scale(1.1); }
  100% { transform: translateX(-80%) scale(1); }
`;

const AnimatedVehicle = styled('img')({
  width: '120px',
  height: '100px',
  animation: `${moveVehicle} 4s ease-in-out infinite`,
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
});

// استایل نوار پیشرفت
const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  width: '100%',
  maxWidth: '300px',
  height: '8px',
  borderRadius: '4px',
  backgroundColor: '#e5e7eb',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #00784a, #003087)',
  },
}));

// پیام‌های پویا
const dynamicMessages = [
  'در حال یافتن نزدیک‌ترین حمل کننده...',
  'اطمینان از بهترین مسیر برای بار شما...',
  'با تیپاکس پونک، بار شما به‌موقع می‌رسد!',
  'حمل‌ونقل ایمن و سریع با تیپاکس پونک...',
];

export default function Searching() {
  const [currentMessage, setCurrentMessage] = useState(0);

  // تغییر پیام‌ها هر 3 ثانیه
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % dynamicMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppFrame>
      <Header title="جستجو برای حمل‌کننده" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '100vh',
          py: 8,
          px: 0,
          bgcolor: 'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)',
          direction: 'rtl',
          textAlign: 'center',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* عنوان پویا */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#1f2937',
            mb: 4,
            animation: 'fadeIn 1s ease-in',
            maxWidth: '90%',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
          }}
        >
          {dynamicMessages[currentMessage]}
        </Typography>

        {/* نوار پیشرفت */}
        <ProgressBar variant="indeterminate" sx={{ mb: 8 }} />

        {/* انیمیشن کامیون */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <AnimatedVehicle
            src="/images/logo.svg" // جایگزین با آیکون کامیون
            alt="کامیون تیپاکس پونک"
          />
        </Box>

        {/* توضیحات */}
        <Typography
          variant="body1"
          sx={{
            color: '#4b5563',
            maxWidth: '90%',
            mx: 'auto',
            mb: 8,
            lineHeight: 1.6,
            fontSize: '1.1rem',
          }}
        >
          تیپاکس پونک با بهره‌گیری از فناوری پیشرفته، سریع‌ترین و ایمن‌ترین حمل‌کننده را برای بار شما پیدا می‌کند. کافی است منتظر بمانید تا حمل کننده به شما اختصاص یابد!
        </Typography>

        {/* دکمه تعاملی */}
        <Button
          variant="contained"
          href="/myorders"
          sx={{
            mt: 2,
            background: 'linear-gradient(90deg, #00784a, #003087)',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            textTransform: 'none',
            fontFamily: 'IranYekan, sans-serif',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            width: '100%',
            maxWidth: '300px',
            '&:hover': {
              background: 'linear-gradient(90deg, #003087, #005bb5)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            },
            '&:disabled': {
              backgroundColor: '#cccccc',
            },
          }}
        >
          مشاهده سفارش‌های من
        </Button>
      </Box>
    </AppFrame>
  );
}