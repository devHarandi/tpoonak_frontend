import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import Header from '@/components/common/Header';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import AppFrame from '@/components/common/AppFrame';

export default function About() {
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

  return (
    <AppFrame>
      <Header title="تیپاکس پونک - درباره ما" />
      
      <Box sx={{
        textAlign: 'right',
        minHeight: 'calc(100dvh - 68px)',
        overflowY: 'auto',
        pb: 14,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        direction: 'rtl',
        pl: 2,
        pr: 2,
        pt: 2.5
      }}>
        <Container maxWidth="lg">
          {/* Introduction Section */}
          <Box sx={{ py: 0 }}>
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
              درباره تیپاکس پونک
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'IranYekan, sans-serif',
                color: '#666',
                textAlign: 'right',
                mb: 0,
                lineHeight: 1.7,
                fontSize: { xs: 16, md: 18 }
              }}
            >
              تیپاکس پونک یک پلتفرم هوشمند حمل و نقل است که با هدف ارائه خدمات سریع، امن، و مقرون‌به‌صرفه طراحی شده است. ما با بهره‌گیری از فناوری‌های پیشرفته، تجربه‌ای بی‌نظیر در ارسال و دریافت بسته‌ها برای شما فراهم می‌کنیم. تیم تیپاکس پونک متعهد به ارائه بهترین خدمات به مشتریان و همکاران خود است.
            </Typography>
          </Box>

          {/* Contact Information Section */}
          <Box sx={{ py: 4 }}>
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
              اطلاعات تماس
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid size={12}>
                <Card sx={{ 
                  p: { xs: 2, sm: 4 },
                  borderRadius: '20px',
                  backgroundColor: '#fff'
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                      <LocationOnIcon sx={{ color: '#08784f', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontFamily: 'IranYekan, sans-serif', color: '#08784f', fontWeight: 700 }}>
                        آدرس
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontFamily: 'IranYekan, sans-serif', color: '#666', mb: 4, lineHeight: 1.8, fontSize: { xs: 16, md: 18 }, textAlign: 'right', whiteSpace: 'pre-wrap' }}>
                      جنت آباد - شاهین شمالی - جنب معاینه فنی آبشناسان - لاله هشتم - کوچه شبنم - پلاک ۴
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <PhoneIcon sx={{ color: '#08784f', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontFamily: 'IranYekan, sans-serif', color: '#08784f', fontWeight: 700 }}>
                        شماره تماس
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontFamily: 'IranYekan, sans-serif', color: '#666', mb: 4, lineHeight: 1.8, fontSize: { xs: 16, md: 18 }, direction: 'ltr', textAlign: 'right' }}>
                      021-44411332
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <EmailIcon sx={{ color: '#08784f', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontFamily: 'IranYekan, sans-serif', color: '#08784f', fontWeight: 700 }}>
                        ایمیل
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontFamily: 'IranYekan, sans-serif', color: '#666', mb: 4, lineHeight: 1.8, fontSize: { xs: 16, md: 18 }, direction: 'ltr', textAlign: 'right' }}>
                      info@tpoonak.com
                    </Typography>
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
              </Grid>
            </Grid>
          </Box>
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
        <CustomBottomNavigation />
    </AppFrame>
  );
}
