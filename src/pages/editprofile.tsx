import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getProfile, updateProfile} from '@/services/auth';
import styles from '../components/feature/styles/Home.module.css';
import { ProfileResponse, UpdateProfileRequest } from '@/types/auth';

// Styled Components
const ProfileCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  overflow: 'hidden',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  backgroundColor: '#00784a',
  color: '#fff',
  padding: theme.spacing(2),
  fontSize: '1.1rem',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#119965',
  },
}));

export default function EditProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse['data'] | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // دریافت داده‌های اولیه پروفایل
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
        setFirstName(response.data.profile.first_name);
        setLastName(response.data.profile.last_name);
        setMobile(response.data.profile.mobile);
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در دریافت اطلاعات پروفایل');
        setOpenSnackbar(true);
      }
    };

    fetchProfile();
  }, []);

  // مدیریت ذخیره پروفایل
  const handleSubmit = async () => {
    if (!firstName || !lastName || !mobile) {
      setError('لطفاً تمام فیلدها را پر کنید');
      setOpenSnackbar(true);
      return;
    }

    if (!/^09\d{9}$/.test(mobile)) {
      setError('شماره موبایل باید 11 رقم و با 09 شروع شود');
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateProfile({ first_name: firstName, last_name: lastName, mobile } as UpdateProfileRequest);
      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در به‌روزرسانی پروفایل');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // مدیریت بستن Toast
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  return (
    <AppFrame>
       <Header title="ویرایش حساب کاربری" />
      <Box
        className={styles.container}
        sx={{
          textAlign: 'right',
          minHeight: '100%',
          overflowY: 'auto',
          pb: 16,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
          direction: 'rtl',
        }}
      >
       

        {/* Profile Header */}
        <ProfileCard >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Image
              src="/images/user-profile.svg"
              alt="پروفایل کاربر"
              width={100}
              height={100}
              style={{ borderRadius: '8px', objectFit: 'contain' }}
            />
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: '#333',
                mb: 1,
                fontFamily: 'IranYekan, sans-serif',
              }}
            >
              {profile ? `${profile.profile.first_name} ${profile.profile.last_name} عزیز خوش آمدید` : 'در حال بارگذاری...'}
            </Typography>
          </CardContent>
        </ProfileCard>

        {/* Profile Edit Form */}
        <Box sx={{ px: 2, mt: 2 }}>
          <Typography sx={{ mb: 2, fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
            * نام
          </Typography>
          <TextField
            fullWidth
            label="نام"
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
            sx={{
              mb: 2,
              direction: 'rtl',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: '16px',
                },
                '&:hover fieldset': {
                  borderRadius: '16px',
                },
                '&.Mui-focused fieldset': {
                  borderRadius: '16px',
                },
              },
            }}
          />
          <Typography sx={{ mb: 2, fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
            * نام خانوادگی
          </Typography>
          <TextField
            fullWidth
            label="نام خانوادگی"
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
            sx={{
              mb: 2,
              direction: 'rtl',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: '16px',
                },
                '&:hover fieldset': {
                  borderRadius: '16px',
                },
                '&.Mui-focused fieldset': {
                  borderRadius: '16px',
                },
              },
            }}
          />
          <Typography sx={{ mb: 2, fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
            * موبایل
          </Typography>
          <TextField
            fullWidth
            label="موبایل"
            variant="outlined"
            value={mobile}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value) && value.length <= 11) {
                setMobile(value);
              }
            }}
            disabled={isLoading}
            inputProps={{
              maxLength: 11,
              inputMode: 'numeric',
              dir: 'ltr',
              style: { textAlign: 'center' },
            }}
            sx={{
              mb: 2,
              direction: 'rtl',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: '16px',
                },
                '&:hover fieldset': {
                  borderRadius: '16px',
                },
                '&.Mui-focused fieldset': {
                  borderRadius: '16px',
                },
              },
            }}
            error={mobile.length > 0 && !/^09\d{9}$/.test(mobile)}
            helperText={mobile.length > 0 && !/^09\d{9}$/.test(mobile) ? 'شماره موبایل باید 11 رقم و با 09 شروع شود' : ''}
          />
        </Box>

        {/* Submit Button */}
        <Box sx={{ px: 2 }}>
          <SubmitButton
            fullWidth
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              margin: 0,
              fontFamily: 'IranYekan, sans-serif',
            }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'در حال ذخیره...' : 'ذخیره'}
          </SubmitButton>
        </Box>
      </Box>

      <CustomBottomNavigation />

      {/* نمایش خطا به صورت Toast */}
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
            bgcolor: '#ffebee',
            color: '#c62828',
            '& .MuiAlert-icon': {
              color: '#c62828',
            },
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </AppFrame>
  );
}