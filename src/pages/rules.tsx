import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import Header from '@/components/common/Header';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import AppFrame from '@/components/common/AppFrame';

export default function Rules() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const router = useRouter();

  // مدیریت بستن Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // مدیریت کلیک روی دکمه بازگشت به صفحه اصلی
  const handleBackToHome = () => {
    router.push('/home');
  };

  const rules = [
    {
      title: '1. شرایط استفاده از خدمات',
      description: 'استفاده از خدمات تیپاکس پونک به معنای پذیرش تمامی شرایط و قوانین این پلتفرم است. کاربران موظف‌اند اطلاعات دقیق و معتبر ارائه دهند.',
    },
    {
      title: '2. مسئولیت‌های کاربر',
      description: 'کاربران مسئول بسته‌بندی مناسب مرسولات خود هستند. هرگونه خسارت ناشی از بسته‌بندی نامناسب بر عهده فرستنده است.',
    },
    {
      title: '3. سیاست‌های حریم خصوصی',
      description: 'تیپاکس پونک متعهد به حفاظت از اطلاعات شخصی کاربران است. اطلاعات شما تنها برای ارائه خدمات استفاده خواهد شد.',
    },
    {
      title: '4. شرایط ارسال و تحویل',
      description: 'زمان‌بندی ارسال ممکن است بسته به شرایط مختلف تغییر کند و تا ۳ ساعت طول بکشد. تیپاکس پونک تلاش می‌کند تا مرسولات را در سریع‌ترین زمان ممکن تحویل دهد.',
    },
    {
      title: '5. قوانین پرداخت',
      description: 'تمامی پرداخت‌ها باید از طریق درگاه‌های معتبر انجام شوند. بازپرداخت در صورت لغو سفارش طبق سیاست‌های تیپاکس پونک انجام می‌شود.',
    },
    {
      title: '6. پشتیبانی و شکایات',
      description: 'کاربران می‌توانند در هر زمان از طریق شماره تماس یا ایمیل با پشتیبانی تیپاکس پونک تماس بگیرند تا مشکلات خود را مطرح کنند.',
    },
  ];

  return (
    <AppFrame>
      <Box sx={{
        textAlign: 'right',
        minHeight: 'calc(100dvh - 68px)',
        overflowY: 'auto',
        pb: 14,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        direction: 'rtl',
        pt: 2,
        pr: 2,
        pl: 2,
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              color: '#08784f',
              fontWeight: 'bold',
              textAlign: 'right',
              mb: 2,
              fontSize: { xs: 24, md: 36 }
            }}
          >
            قوانین و مقررات تیپاکس پونک
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              color: '#666',
              textAlign: 'right',
              mb: 4,
              lineHeight: 1.7,
              fontSize: { xs: 16, md: 18 }
            }}
          >
            لطفاً قوانین و مقررات زیر را به دقت مطالعه کنید. استفاده از خدمات تیپاکس پونک به منزله پذیرش این شرایط است.
          </Typography>

          <Card sx={{ 
              p: { xs: 2, sm: 4 },
              borderRadius: '20px',
              backgroundColor: '#fff'
          }}>
            <CardContent sx={{ p: 0 }}>
              {rules.map((rule, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'IranYekan, sans-serif', 
                      color: '#08784f',
                      fontWeight: 600, 
                      mb: 1 
                    }}
                  >
                    {rule.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'IranYekan, sans-serif', 
                      color: '#666', 
                      lineHeight: 1.7, 
                      textAlign: 'right' 
                    }}
                  >
                    {rule.description}
                  </Typography>
                </Box>
              ))}
              <Button
                variant="contained"
                fullWidth
                onClick={handleBackToHome}
                sx={{
                  mt: 3,
                  borderRadius: '8px',
                  padding: '10px 10px',
                  backgroundColor: '#08784f',
                  color: '#ffffff',
                  fontFamily: 'IranYekan, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#075c3e',
                  },
                  '&:disabled': {
                    backgroundColor: '#b3d1c2',
                    color: '#ffffff',
                  },
                }}
              >
                بازگشت به صفحه اصلی
              </Button>
            </CardContent>
          </Card>
        </Container>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              fontFamily: 'IranYekan, sans-serif',
              bgcolor: snackbar.severity === 'error' ? '#e6f0e9' : '#00784a',
              color: snackbar.severity === 'error' ? '#00784a' : '#fff',
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'error' ? '#00784a' : '#fff',
              },
              textAlign: 'right'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppFrame>
  );
}
