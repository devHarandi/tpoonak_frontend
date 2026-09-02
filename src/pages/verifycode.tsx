import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';
import { verifyCode, sendLoginCode } from '@/services/auth';
import { setToken } from '@/utils/storage';
import { VerifyRequest, LoginRequest } from '@/types/auth';
import styles from '../components/feature/styles/Login.module.css';
import AppFrame from '@/components/common/AppFrame';

type CodeArray = [string, string, string, string];

export default function VerifyCode() {
  const [code, setCode] = useState<CodeArray>(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobileFromUrl = searchParams?.get('mobile') || '';

  // بررسی وجود شماره موبایل
  useEffect(() => {
    if (!mobileFromUrl) {
      router.push('/login');
    }
  }, [mobileFromUrl, router]);

  // مدیریت تایمر
  useEffect(() => {
    if (timeLeft > 0 && !isLoading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isLoading]);

  const convertPersianToEnglishDigits = (value: string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = value;
    persianDigits.forEach((digit, index) => {
      result = result.replace(new RegExp(digit, 'g'), englishDigits[index]);
    });
    return result;
  };

  // مدیریت تغییر کد
  const handleChange = (index: number, value: string) => {
    // تبدیل اعداد فارسی به انگلیسی
    const convertedValue = convertPersianToEnglishDigits(value);

    if (/^\d$/.test(convertedValue) || convertedValue === '') {
      const newCode = [...code] as CodeArray;
      newCode[index] = convertedValue;
      setCode(newCode);

      if (convertedValue && index < 3) {
        inputRefs.current[index + 1]?.focus();
      } else if (!convertedValue && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // مدیریت کلید Backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // تأیید کد
  const handleVerifyCode = async () => {
    if (isSubmitted) return;

    const codeString = code.join('');
    if (codeString.length !== 4 || !mobileFromUrl) {
      setError('کد تأیید یا شماره موبایل نامعتبر است');
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);
    setError('');

    try {
      const response = await verifyCode({ mobile: mobileFromUrl, code: codeString } as VerifyRequest);
      setToken(response.data.tokens.access);

      // ثبت‌نام تازه: تا وقتی نام و نام خانوادگی پر نشده، کاربر به فرم تکمیل
      // حساب می‌رود — همان‌جا نام شرکت/کمپانی هم پرسیده می‌شود.
      const profile = response.data.user.profile;
      const isProfileCompleted = Boolean(
        profile?.first_name?.trim() &&
        profile?.last_name?.trim() &&
        (profile?.customer_type !== 'company' || profile?.company_name?.trim())
      );
      const isOperator = profile?.roles?.some((role) => role.name === 'Operator');
      router.push(
        isProfileCompleted
          ? isOperator
            ? '/operator/'
            : '/home'
          : '/editprofile?welcome=1'
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'کد نامعتبر است. لطفاً دوباره تلاش کنید.');
      setOpenSnackbar(true);
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ارسال مجدد کد
  const handleResendCode = async () => {
    if (!mobileFromUrl) return;

    setTimeLeft(120);
    setCode(['', '', '', '']);
    setIsLoading(true);
    setError('');
    setIsSubmitted(false);

    try {
      await sendLoginCode({ mobile: mobileFromUrl } as LoginRequest);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ارسال مجدد کد. لطفاً دوباره تلاش کنید.');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // تأیید خودکار کد کامل
  useEffect(() => {
    if (code.every((digit) => digit !== '') && !isLoading && !isSubmitted) {
      handleVerifyCode();
    }
  }, [code, isLoading, isSubmitted]);

  // فرمت زمان
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // بازگشت به صفحه لاگین
  const handleBackToLogin = () => {
    router.push('/login');
  };

  // مدیریت بستن Toast
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  return (
    <AppFrame>
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Image
            src="/images/logo.png"
            alt="Tipax Logo"
            width={120}
            height={80}
            className={styles.icon}
          />
          <Typography
            variant="h4"
            className={styles.title}
            sx={{ fontFamily: 'IranYekan, sans-serif', fontWeight: 'bold', color: '#ffffff' }}
          >
            تیپاکس پونک
          </Typography>
        </Box>

        <Box className={styles.loginBox}>
          <Typography
            variant="h5"
            sx={{ fontFamily: 'IranYekan, sans-serif', fontWeight: 'bold', mb: 2, color: '#000000' }}
          >
            تأیید کد موبایل
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'IranYekan, sans-serif', mb: 1, color: '#000000' }}
          >
            کد تایید به شماره {mobileFromUrl} ارسال شد
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'IranYekan, sans-serif', mb: 3, color: '#666666' }}
          >
            زمان باقی‌مانده: {formatTime(timeLeft)}
          </Typography>

          <Box className={styles.codeInputs} sx={{ mb: 3}}>
            {code.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                onKeyDown={handleKeyDown.bind(null, index)}
                disabled={isLoading || isSubmitted}
                inputProps={{
                  style: {
                    textAlign: 'center',
                    fontFamily: 'IranYekan, sans-serif',
                    fontSize: '1.5rem',
                    padding: '5px',
                    direction: 'ltr',
                  } as React.CSSProperties,
                  maxLength: 1,
                  type: 'tel',
                }}
                sx={{
                  width: '48px',
                  height: '48px',
                  mx: 0.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                border: '1px solid #dce6e0',
                borderRadius: '14px',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#f5f5f5',
                    },
                  },
                }}
              />
            ))}
          </Box>

          {timeLeft === 0 && (
            <Button
              variant="text"
              onClick={handleResendCode}
              disabled={isLoading}
              sx={{
                mb: 2,
              color: '#08784f',
                fontFamily: 'IranYekan, sans-serif',
                textTransform: 'none',
              }}
            >
              ارسال مجدد کد
            </Button>
          )}

          <Button
            variant="contained"
            fullWidth
            className={styles.submitButton}
            disabled={code.join('').length !== 4 || isLoading || isSubmitted}
            onClick={handleVerifyCode}
            sx={{
              mt: 2,
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
                در حال تایید...
              </Box>
            ) : (
              'تأیید کد ارسالی'
            )}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={handleBackToLogin}
            sx={{
              mt: 2,
              color: '#65746c',
              fontFamily: 'IranYekan, sans-serif',
              textTransform: 'none',
            }}
          >
            بازگشت و تغییر شماره موبایل
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
