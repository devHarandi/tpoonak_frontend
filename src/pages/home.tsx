import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Modal,
  CircularProgress,
} from '@mui/material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import styles from '../components/feature/styles/Home.module.css';
import Carousel from 'react-material-ui-carousel';
import Image from 'next/image';
import Link from 'next/link';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getProfile } from '@/services/user';
import { GetProfileResponse } from '@/types/user';

export default function Home() {
  const [profile, setProfile] = useState<GetProfileResponse['data'] | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false); // حالت مدال
  const router = useRouter();

  // بارگذاری پروفایل کاربر
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();
        setProfile(response.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setSnackbar({ open: true, message: 'شما اجازه انجام این دستور را ندارید.', severity: 'error' });
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در بارگذاری پروفایل', severity: 'error' });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // مدیریت بستن Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const slides = [
    {
      image: '/images/slide1.jpg',
      title: 'خوش آمدید به تیپاکس پونک',
      description: 'بهترین تجربه خرید آنلاین',
    },
    {
      image: '/images/slide1.jpg',
      title: 'محصولات جدید',
      description: 'جدیدترین محصولات ما را کشف کنید',
    },
    {
      image: '/images/slide1.jpg',
      title: 'تخفیف ویژه',
      description: 'تا 50٪ تخفیف برای اعضای ویژه',
    },
  ];

  // تعریف باکس‌های پایه
  const baseBoxes = [
    {
      image: '/images/logo.svg',
      text: 'ارسال بین شهری',
      link: '/createorder',
    },
    {
      image: '/images/orders.jpg',
      text: 'گزارشات من',
      link: '/myorders',
    },
  ];

  // باکس‌های شرطی بر اساس نقش‌ها
  const conditionalBoxes = [
    ...(profile?.profile.roles.some(role => role.name === 'Collector') ? [{
      image: '/images/collector.png',
      text: 'جمع‌آوری‌کننده',
      link: '/carrier-orders',
    }] : []),
    ...(profile?.profile.roles.some(role => role.name === 'Admin') ? [{
      image: '/images/users.png',
      text: 'کاربران',
      link: '/admin/users',
    }] : []),
  ];

    // مدیریت کلیک روی باکس‌ها
  const handleBoxClick = (text: string, link: string) => {
    router.push(link); 
  };
  
  // ترکیب باکس‌ها
  const boxes = [...baseBoxes, ...conditionalBoxes];

  if (isLoading) {
    return (
      <AppFrame>
        <Header title="تیپاکس پونک - خانه" />
        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: 'IranYekan, sans-serif', color: '#00784a', textAlign: 'right' }}>
            در حال بارگذاری...
          </Typography>
        </Box>
        <CustomBottomNavigation />
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <Header title="تیپاکس پونک - خانه" />
      <Box className={styles.container}>
        <Box className={styles.content} sx={{ pb: '80px' }}>
          <Carousel
            autoPlay
            interval={5000}
            animation="slide"
            indicators={false}
            navButtonsAlwaysVisible
            sx={{
              width: '100%',
              maxWidth: '600px',
              mx: 'auto',
              mt: 4,
              position: 'relative',
              borderRadius: '16px'
            }}
          >
            {slides.map((slide, index) => (
              <Box key={index} sx={{ position: 'relative', width: '100%', height: '150px', borderRadius: '16px' }}>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  style={{ objectFit: 'cover', borderRadius: 16 }}
                  priority={index === 0}
                />
              </Box>
            ))}
          </Carousel>
          <Box
            sx={{
              mt: 4,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              direction: 'rtl',
              mx: 0,
              px: 0,
              pb: 14,
              justifyContent: boxes.length % 2 === 1 ? 'center' : 'flex-start',
            }}
          >
            {boxes.map((box, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: '#FBFBFB',
                  boxShadow: '0px 4px 16px 0px rgba(18, 18, 18, 0.24)',
                  borderRadius: '16px',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '150px',
                  width: boxes.length % 2 === 1 && index === boxes.length - 1 ? 'calc(50% - 8px)' : 'calc(50% - 8px)',
                  cursor: 'pointer',
                }}
                onClick={() => handleBoxClick(box.text, box.link)}
              >
                <Image
                  src={box.image}
                  alt={box.text}
                  width={100}
                  height={80}
                  style={{ objectFit: 'contain' }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mt: 1,
                    color: '#000',
                  }}
                >
                  {box.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <CustomBottomNavigation />

        {/* مدال برای پکـچرخ */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: 'background.paper',
              borderRadius: '16px',
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
              direction: 'rtl',
            }}
          >
            <CircularProgress sx={{ mb: 2, color: '#00784a' }} />
            <Typography
              id="modal-description"
              sx={{
                fontFamily: 'IranYekan, sans-serif',
                fontSize: '16px',
                color: '#00784a',
                lineHeight: '1.5',
              }}
            >
              ما در حال ساخت بهترین مسیر و راحت‌ترین راه برای جابه‌جایی مرسولات شما در داخل بازار هستیم. لطفاً ما را با صبوری‌تان همراهی بفرمایید.
            </Typography>
          </Box>
        </Modal>

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
              bgcolor: snackbar.severity === 'error' ? '#ffebee' : '#00784a',
              color: snackbar.severity === 'error' ? '#fbd700' : '#fff',
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'error' ? '#fbd700' : '#fff',
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