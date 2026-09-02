import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getProfile } from '@/services/user';
import { GetProfileResponse } from '@/types/user';

type QuickAction = {
  title: string;
  description: string;
  route: string;
  icon: typeof AddBoxRoundedIcon;
  tone: 'green' | 'yellow' | 'blue';
};

const toneMap = {
  green: { background: '#e6f4ee', color: '#08784f' },
  yellow: { background: '#fff8d9', color: '#9a7600' },
  blue: { background: '#edf4ff', color: '#315fa7' },
};

export default function Home() {
  const [profile, setProfile] = useState<GetProfileResponse['data'] | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();
        setProfile(response.data);
      } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          setSnackbar({ open: true, message: 'نشست شما منقضی شده است.', severity: 'error' });
          setTimeout(() => router.push('/login'), 1200);
        } else {
          setSnackbar({
            open: true,
            message: err.response?.data?.message || 'خطا در بارگذاری پروفایل',
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const firstName = profile?.profile.first_name?.trim() || 'دوست عزیز';
  const isCollector = profile?.profile.roles.some((role) => role.name === 'Collector');
  const isAdmin = profile?.profile.roles.some((role) => role.name === 'Admin');

  const quickActions: QuickAction[] = [
    {
      title: 'ثبت مرسوله',
      description: 'درخواست جدیدت را ثبت کن',
      route: '/createorder',
      icon: AddBoxRoundedIcon,
      tone: 'yellow',
    },
    {
      title: 'سفارش‌های من',
      description: 'وضعیت ارسال‌ها را ببین',
      route: '/myorders',
      icon: ReceiptLongOutlinedIcon,
      tone: 'green',
    },
    ...(isCollector
      ? [{
          title: 'درخواست‌های حمل',
          description: 'مرسوله‌های نزدیک را بررسی کن',
          route: '/carrier-orders',
          icon: LocalShippingOutlinedIcon,
          tone: 'blue' as const,
        }]
      : []),
    ...(isAdmin
      ? [{
          title: 'مدیریت کاربران',
          description: 'حساب‌ها و نقش‌ها را مدیریت کن',
          route: '/admin/users',
          icon: ManageAccountsOutlinedIcon,
          tone: 'green' as const,
        }]
      : []),
  ];

  if (isLoading) {
    return (
      <AppFrame>
        <Header title="تیپاکس پونک - خانه" />
        <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 380 }}>
          <CircularProgress size={30} sx={{ color: '#08784f' }} />
        </Box>
        <CustomBottomNavigation />
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <Header title="تیپاکس پونک - خانه" />
      <Box
        component="main"
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3 },
          pt: 2.5,
          pb: 14,
          direction: 'rtl',
          background: 'transparent',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: '26px',
            color: '#ffffff',
            background: 'linear-gradient(140deg, #08784f 0%, #075c3e 100%)',
            boxShadow: '0 18px 34px rgba(8, 120, 79, 0.2)',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: '50%',
              left: -68,
              bottom: -100,
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 390 }}>
            <Typography sx={{ fontSize: 12, color: '#bce5d2', fontWeight: 700, mb: 1 }}>
              پنل ارسال هوشمند
            </Typography>
            <Typography component="h1" sx={{ fontSize: { xs: 24, sm: 28 }, lineHeight: 1.45, fontWeight: 800, mb: 1 }}>
              سلام {firstName}؛ آماده‌ی ارسال هستی؟
            </Typography>
            <Typography sx={{ color: '#e1f3e9', fontSize: 13, lineHeight: 1.9, mb: 2.5 }}>
              ثبت مرسوله، انتخاب ناوگان و پیگیری سفارش را یک‌جا و بدون پیچیدگی انجام بده.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/createorder')}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                color: '#17231e',
                background: '#f4c400',
                '&:hover': { background: '#ffd52d' },
                px: 2,
              }}
            >
              ثبت مرسوله جدید
            </Button>
          </Box>
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              left: { xs: 12, sm: 30 },
              bottom: { xs: 16, sm: 22 },
              display: { xs: 'none', sm: 'block' },
              opacity: 0.2,
              transform: 'rotate(-12deg)',
            }}
          >
            <LocalShippingOutlinedIcon sx={{ fontSize: 116 }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 1.5 }}>
          <Box>
            <Typography component="h2" sx={{ color: '#17231e', fontSize: 18, fontWeight: 800 }}>
              دسترسی سریع
            </Typography>
            <Typography sx={{ color: '#65746c', fontSize: 12, mt: 0.5 }}>
              هر کاری که لازم داری، همین‌جاست
            </Typography>
          </Box>
          <RouteOutlinedIcon sx={{ color: '#08784f', fontSize: 26 }} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
          {quickActions.map((action) => {
            const tone = toneMap[action.tone];
            const Icon = action.icon;
            return (
              <Card key={action.route} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                <CardActionArea onClick={() => router.push(action.route)} sx={{ height: '100%', p: 1.75 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minHeight: 118 }}>
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: '14px', color: tone.color, background: tone.background, mb: 1.5 }}>
                      <Icon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography sx={{ color: '#17231e', fontSize: 14, fontWeight: 800, textAlign: 'right' }}>
                      {action.title}
                    </Typography>
                    <Typography sx={{ color: '#65746c', fontSize: 11, lineHeight: 1.7, mt: 0.5, textAlign: 'right' }}>
                      {action.description}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        <Card sx={{ mt: 2, p: 2, borderRadius: '20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '13px', color: '#08784f', background: '#e6f4ee' }}>
              <VerifiedUserOutlinedIcon sx={{ fontSize: 23 }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#17231e', fontSize: 13, fontWeight: 800 }}>
                تجربه‌ای شفاف و مطمئن
              </Typography>
              <Typography sx={{ color: '#65746c', fontSize: 11, lineHeight: 1.7, mt: 0.25 }}>
                وضعیت مرسوله‌ات را مرحله‌به‌مرحله دنبال کن.
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      <CustomBottomNavigation />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
          sx={{ bgcolor: snackbar.severity === 'error' ? '#fff1f1' : '#e6f4ee', color: snackbar.severity === 'error' ? '#b42318' : '#075c3e' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppFrame>
  );
}
