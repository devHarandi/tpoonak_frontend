import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, TextField, Link, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';
import { sendLoginCode } from '@/services/auth';
import { getProfile } from '@/services/user';
import { LoginRequest } from '@/types/auth';
import styles from '../components/feature/styles/Login.module.css';
import AppFrame from '@/components/common/AppFrame';
import { removeToken } from '@/utils/storage';

// تابع تبدیل اعداد فارسی به لاتین
const persianToLatinDigits = (input: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const latinDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = input;
  for (let i = 0; i < persianDigits.length; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), latinDigits[i]);
  }
  return result;
};

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const router = useRouter();

  // بررسی وضعیت لاگین
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        await getProfile(); // اگر درخواست موفقیت‌آمیز باشد، کاربر لاگین کرده است
        router.push('/home'); // هدایت به صفحه خانه
      } 
      catch (err: any) 
      {
        removeToken();
        // اگر خطا رخ دهد (مثل 403)، کاربر لاگین نکرده و در صفحه لاگین می‌ماند
        if (err.response?.status === 403 || err.response?.status === 401) 
        {
          setError('لطفاً وارد شوید');
          setOpenSnackbar(true);
        } 
        else 
        {
          // setError(err.response?.data?.message || 'خطا در بررسی وضعیت لاگین');
          // setOpenSnackbar(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  // تابع بررسی اعتبار شماره موبایل
  const isValidMobileNumber = (mobile: string): boolean => {
    const mobileRegex = /^09\d{9}$/;
    return mobileRegex.test(mobile);
  };

  // تابع مدیریت تغییر شماره موبایل
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // تبدیل اعداد فارسی به لاتین
    const latinValue = persianToLatinDigits(value);
    // فقط اجازه ورود اعداد لاتین و حداکثر 11 کاراکتر
    if (/^\d*$/.test(latinValue) && latinValue.length <= 11) {
      setMobileNumber(latinValue);
    }
  };

  // تابع ارسال درخواست لاگین
  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try 
    {
      await sendLoginCode({ mobile: mobileNumber } as LoginRequest);
      router.push(`/verifycode?mobile=${mobileNumber}`);
    } 
    catch (err: any) 
    {
      setError(err.response?.data?.message || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
      setTimeout(() => {
            removeToken();
            router.push('/login');
      }, 2000);
      setOpenSnackbar(true);
    } 
    finally 
    {
      setIsLoading(false);
    }
  };

  // مدیریت بستن Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  const isButtonDisabled = !isValidMobileNumber(mobileNumber);

  if (isLoading) {
    return (
      <AppFrame>
        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: 'IranYekan, sans-serif', color: '#00784a', textAlign: 'right' }}>
            در حال بررسی وضعیت لاگین...
          </Typography>
          <CircularProgress sx={{ mt: 2, color: '#fbd700' }} />
        </Box>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Image
            src="/images/logo.png"
            alt="لوگوی تیپاکس پونک"
            width={120}
            height={80}
            className={styles.icon}
          />
          <Typography
            variant="h4"
            className={styles.title}
            sx={{ fontFamily: 'IranYekan, sans-serif', fontWeight: 'bold', color: '#ffffff' }}
          >
            تــیـــپاکـــس پونک
          </Typography>
        </Box>

        <Box className={styles.loginBox}>
          <Typography
            variant="h4"
            sx={{ fontFamily: 'IranYekan, sans-serif', fontWeight: 'bold', mb: 2, color: '#000000' }}
          >
            ورود به تیپاکس پونک
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'IranYekan, sans-serif', mb: 3, color: '#000000' }}
          >
            برای ورود لطفاً شماره موبایل خود را وارد کنید
          </Typography>

          <TextField
            label="شماره موبایل"
            variant="outlined"
            fullWidth
            value={mobileNumber}
            onChange={handleMobileChange}
            inputProps={{
              maxLength: 11,
              inputMode: 'numeric',
              dir: 'ltr',
              style: { textAlign: 'center' },
            }}
            sx={{ mb: 3 }}
            error={mobileNumber.length > 0 && !isValidMobileNumber(mobileNumber)}
            helperText={
              mobileNumber.length > 0 && !isValidMobileNumber(mobileNumber)
                ? 'شماره موبایل باید 11 رقم و با 09 شروع شود'
                : ''
            }
            disabled={isLoading}
            placeholder="09125949514"
          />

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'IranYekan, sans-serif',
              color: '#000000',
              textAlign: 'center',
              direction: 'rtl',
            }}
          >
            با ثبت‌نام در تیپاکس پونک{' '}
            <Link
              component={NextLink}
              href="/rules"
              sx={{ color: '#00784a', fontFamily: 'IranYekan, sans-serif', textDecoration: 'underline' }}
            >
              قوانین و شرایط
            </Link>{' '}
            را قبول می‌کنم.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            className={styles.submitButton}
            disabled={isButtonDisabled || isLoading}
            onClick={handleLogin}
            sx={{
              mt: 3,
              borderRadius: '15px',
              padding: '14px 10px',
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
                backgroundColor: '#b9d9ca',
                color: '#ffffff',
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                در حال ارسال کد...
              </Box>
            ) : (
              'ورود به تیپاکس پونک'
            )}
          </Button>
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{
              fontFamily: 'IranYekan, sans-serif',
              bgcolor: '#fff1f1',
              color: '#b42318',
              '& .MuiAlert-icon': {
                color: '#b42318',
              },
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </AppFrame>
  );
}
