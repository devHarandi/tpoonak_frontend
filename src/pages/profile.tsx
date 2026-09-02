import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  CardContent,
  Grid,
  Button,
  Snackbar,
  Alert,
  Card,
  Avatar,
} from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { ExitToApp } from '@mui/icons-material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getProfile } from '@/services/auth';
import { ProfileResponse } from '@/types/auth';
import { removeToken } from '@/utils/storage';
import styles from '../components/feature/styles/Home.module.css';

// Styled Components
const ProfileCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  overflow: 'hidden',
}));

interface BalanceCardProps {
  isNegative?: boolean;
}

const BalanceCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isNegative',
})<BalanceCardProps>(({ theme, isNegative }: BalanceCardProps & { theme: Theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  color: '#fff',
  minHeight: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isNegative ? '#dc6b62' : '#08784f',
  width: '100%',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2, 2, 1, 2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
  color: '#17231e',
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  backgroundColor: '#EA615D',
  color: '#fff',
  padding: theme.spacing(2),
  fontSize: '1.1rem',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#EA615D',
  },
}));

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse['data'] | null>(null);
  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const router = useRouter();

  // دریافت داده‌های پروفایل
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در دریافت اطلاعات پروفایل');
        setOpenSnackbar(true);
      }
    };

    fetchProfile();
  }, []);

  // مدیریت خروج
  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  // مدیریت بستن Toast
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  // پیدا کردن بالانس برای نقش‌های Customer و Collector
  const customerBalance = profile?.balances.find((b) => b.role.name === 'Customer')?.balance || '0.00';
  const collectorBalance = profile?.balances.find((b) => b.role.name === 'Collector')?.balance || '0.00';
  const isCustomerBalanceNegative = parseFloat(customerBalance) < 0;
  const isCollectorBalanceNegative = parseFloat(collectorBalance) < 0;

  return (
    <AppFrame>
      <Header title="پروفایل کاربری" />
      <Box
        className={styles.container}
        sx={{
          textAlign: 'right',
          minHeight: 'calc(100dvh - 68px)',
          overflowY: 'auto',
          pb: 16,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'transparent',
          direction: 'rtl',
        }}
      >
      

        {/* Profile Header */}
        <ProfileCard>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Avatar
              src={profile?.profile.profile_image || undefined}
              alt="تصویر پروفایل"
              sx={{
                width: 104,
                height: 104,
                mx: 'auto',
                mb: 2,
                bgcolor: '#dcefe8',
                color: '#08784f',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {profile
                ? `${profile.profile.first_name.charAt(0)}${profile.profile.last_name.charAt(0)}`
                : 'ت'}
            </Avatar>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: '#17231e',
                mb: 1,
                fontFamily: 'IranYekan, sans-serif',
              }}
            >
              {profile ? `${profile.profile.first_name} ${profile.profile.last_name} عزیز خوش آمدید` : 'در حال بارگذاری...'}
            </Typography>
          </CardContent>
        </ProfileCard>


        {/* Balance Cards */}
        {/* <Grid container spacing={2} sx={{ mx: 2, mb: 2 }}>
          <Grid size={6}>
            <BalanceCard isNegative={isCustomerBalanceNegative}>
              <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontFamily: 'IranYekan, sans-serif' }}>
                  حساب مشتری
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
                  {parseFloat(customerBalance).toLocaleString('fa-IR')} تومان
                </Typography>
              </CardContent>
            </BalanceCard>
          </Grid>
          <Grid size={6}>
            <BalanceCard isNegative={isCollectorBalanceNegative}>
              <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontFamily: 'IranYekan, sans-serif' }}>
                  حساب جمع‌آوری‌کننده
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
                  {parseFloat(collectorBalance).toLocaleString('fa-IR')} تومان
                </Typography>
              </CardContent>
            </BalanceCard>
          </Grid>
        </Grid> */}

        {/* Profile Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1,mx:2 }}>
                {/* نوع مرسوله */}
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    border: '1px solid #e1eae5',
                    borderRadius: '16px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                    <Typography sx={{ color: '#65746c', fontSize: '14px' }}>
                    نام
                  </Typography>
                   <Typography sx={{ color: '#17231e', fontSize: '14px', fontWeight: 700 }}>
                    {profile?.profile.first_name || '-'}
                  </Typography>
                </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1,mx:2 }}>
                {/* نوع مرسوله */}
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    border: '1px solid #e1eae5',
                    borderRadius: '16px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                    <Typography sx={{ color: '#65746c', fontSize: '14px' }}>
                    نام خانوادگی
                  </Typography>
                   <Typography sx={{ color: '#17231e', fontSize: '14px', fontWeight: 700 }}>
                    {profile?.profile.last_name || '-'}
                  </Typography>
                </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1,mx:2 }}>
          <Box
            sx={{
              backgroundColor: '#fff',
              border: '1px solid #e1eae5',
              borderRadius: '16px',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: '#65746c', fontSize: '14px' }}>نوع حساب</Typography>
            <Typography sx={{ color: '#17231e', fontSize: '14px', fontWeight: 700 }}>
              {profile?.profile.customer_type === 'company' ? 'شرکت' : 'کاربر خانگی'}
            </Typography>
          </Box>
        </Box>
        {profile?.profile.customer_type === 'company' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1,mx:2 }}>
            <Box
              sx={{
                backgroundColor: '#fff',
                border: '1px solid #e1eae5',
                borderRadius: '16px',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ color: '#65746c', fontSize: '14px' }}>نام شرکت</Typography>
              <Typography sx={{ color: '#17231e', fontSize: '14px', fontWeight: 700 }}>
                {profile.profile.company_name || '-'}
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1,mx:2 }}>
                {/* نوع مرسوله */}
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    border: '1px solid #e1eae5',
                    borderRadius: '16px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                    <Typography sx={{ color: '#65746c', fontSize: '14px' }}>
                    موبایل
                  </Typography>
                   <Typography sx={{ color: '#17231e', fontSize: '14px', fontWeight: 700 }}>
                    {profile?.profile.mobile || '-'}
                  </Typography>
                </Box>
        </Box>
        {/* Logout Button */}
        <Box sx={{ px: 2, mt: 5 }}>
          <LogoutButton
            fullWidth
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              margin: 0,
              fontFamily: 'IranYekan, sans-serif',
            }}
            onClick={handleLogout}
          >
            <ExitToApp sx={{ fontSize: '20px' }} />
            خروج از حساب کاربری
          </LogoutButton>
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
