import AppFrame from '@/components/common/AppFrame';
import Header from '@/components/common/Header';
import { Box, Typography, Button, LinearProgress, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getOrder, updateOrderStatus } from '@/services/order';
import { Order } from '@/types/order';

// انیمیشن حرکت کامیون در محدوده صفحه
const moveVehicle = keyframes`
  0% { transform: translateX(80%) scale(1); }
  50% { transform: translateX(0%) scale(1.1); }
  100% { transform: translateX(-80%) scale(1); }
`;

const AnimatedVehicle = styled('img')({
  width: '120px',
  height: 'auto',
  animation: `${moveVehicle} 4s ease-in-out infinite`,
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
});

// استایل نوار پیشرفت
const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  width: '100%',
  maxWidth: '300px',
  height: '7px',
  borderRadius: '99px',
  backgroundColor: '#dce8e1',
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#08784f',
  },
}));

// پیام‌های پویا
const dynamicMessages = [
  'در حال یافتن نزدیک‌ترین ناوگان به شما...',
  'اطمینان از بهترین مسیر برای بار شما...',
  'با تیپاکس پونک، بار شما به‌موقع می‌رسد!',
  'حمل‌ونقل ایمن و سریع با تیپاکس پونک...',
];

export default function Searching() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false); // حالت برای مدال لغو
  const params = useParams();
  const orderId = params && typeof params.id === 'string' && !isNaN(parseInt(params.id, 10)) ? parseInt(params.id, 10) : null;
  const router = useRouter();

  // تغییر پیام‌ها هر ۳ ثانیه
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % dynamicMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // بررسی دوره‌ای (Polling) وضعیت سفارش
  useEffect(() => {
    if (!orderId) {
      setError('شناسه سفارش نامعتبر است');
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const orderResponse = await getOrder(orderId);
        setOrder(orderResponse.data);
        if (orderResponse.data?.status !== 'pending') {
          setOpenSnackbar(true);
          setError('سفارش شما آماده است! در حال انتقال به صفحه جزئیات...');
          setTimeout(() => {
            router.push(`/orderdetail/${orderResponse.data.id}`);
          }, 5000);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('شما اجازه انجام این دستور را ندارید.');
          setOpenSnackbar(true);
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setError(err.response?.data?.message || 'خطا در بارگذاری داده‌ها');
          setOpenSnackbar(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [orderId, router]);

  // مدیریت کلیک روی دکمه لغو
  const handleCancelOrder = async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const response = await updateOrderStatus(orderId, 'canceled');
      setOpenSnackbar(true);
      setError('سفارش با موفقیت لغو شد.');
      setOpenCancelDialog(false);
      setTimeout(() => {
        router.push('/myorders'); // انتقال به صفحه سفارشات پس از لغو
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در لغو سفارش');
      setOpenSnackbar(true);
      setOpenCancelDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppFrame>
      <Header title="جستجو برای حمل‌کننده" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'calc(100dvh - 68px)',
          py: 5,
          px: 2,
          bgcolor: 'transparent',
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
            color: '#17231e',
            mb: 3,
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
        <ProgressBar variant="indeterminate" sx={{ mb: 5 }} />

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
            src="/images/truck-delivery2.png"
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
            mb: 5,
            lineHeight: 1.6,
            fontSize: '1.1rem',
          }}
        >
          تیپاکس پونک با بهره‌گیری از فناوری پیشرفته، سریع‌ترین و ایمن‌ترین حمل‌کننده را برای بار شما پیدا می‌کند. کافی است منتظر بمانید تا حمل کننده به شما اختصاص یابد!
        </Typography>

        {/* دکمه‌ها */}
        <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: '300px', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => router.push(`/orderdetail/${orderId}`)}
            disabled={isLoading || !orderId}
            sx={{
              backgroundColor: '#08784f',
              color: '#fff',
              padding: '13px 16px',
              borderRadius: '14px',
              textTransform: 'none',
              fontFamily: 'IranYekan, sans-serif',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              flex: 1,
              '&:hover': {
                backgroundColor: '#075c3e',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
              },
            }}
          >
           جزئیات سفارش
          </Button>
        </Box>


        <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: '300px', justifyContent: 'center',mt:"20px" }}>
        <Button
            variant="outlined"
            onClick={() => setOpenCancelDialog(true)}
            disabled={isLoading || !orderId}
            sx={{
              borderColor: '#dc2626',
              color: '#dc2626',
              padding: '13px 16px',
              borderRadius: '14px',
              textTransform: 'none',
              fontFamily: 'IranYekan, sans-serif',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              flex: 1,
              '&:hover': {
                borderColor: '#b91c1c',
                color: '#b91c1c',
                backgroundColor: '#fff',
              },
              '&:disabled': {
                borderColor: '#cccccc',
                color: '#cccccc',
              },
            }}
          >
            لغو سفارش
          </Button>
        </Box>

        {/* مدال تأیید لغو */}
        <Dialog
          open={openCancelDialog}
          onClose={() => setOpenCancelDialog(false)}
          sx={{ direction: 'rtl' }}
        >
          <DialogTitle>تأیید لغو سفارش</DialogTitle>
          <DialogContent>
            <DialogContentText>
              آیا از لغو سفارش مطمئن هستید؟
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancelDialog(false)} color="primary">
              خیر
            </Button>
            <Button onClick={handleCancelOrder} color="error" autoFocus>
              بله، لغو کن
            </Button>
          </DialogActions>
        </Dialog>

        {/* اعلان */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            severity={error.includes('خطا') ? 'error' : 'success'}
            onClose={() => setOpenSnackbar(false)}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </AppFrame>
  );
}
