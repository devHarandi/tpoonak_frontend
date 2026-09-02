import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check, ReceiptLongOutlined } from '@mui/icons-material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getOrders, updateOrderStatus } from '@/services/order';
import { Order } from '@/types/order';
import styles from '../components/feature/styles/Home.module.css';
import PersianDate from 'persian-date';
import PickupCountdown from '@/components/common/PickupCountdown';

// تابع برای تبدیل تاریخ به شمسی
const formatPersianDate = (dateStr: string) => {
  try {
    const date = new PersianDate(new Date(dateStr));
    return date.format('D MMMM YYYY HH:mm');
  } catch {
    return dateStr;
  }
};

// تابع برای دریافت تاریخ و ساعت فعلی به صورت شمسی
const getCurrentPersianDateTime = () => {
  const now = new PersianDate();
  return now.format('D MMMM YYYY, HH:mm:ss');
};

// تعریف مراحل استپر بر اساس status
const steps = ['ثبت درخواست', 'تایید جمع‌آوری', 'جمع آوری شده', 'تحویل به نمایندگی', 'لغو شده'];

const getActiveStep = (status: string): number => {
  const statusMap: { [key: string]: number } = {
    pending: 0,
    collected: 1,
    transferred_to_tipax: 2,
    delivered: 3,
    canceled: 4,
  };
  return statusMap[status] || 0;
};

// Custom Stepper Connector
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: '#e0e0e0',
    borderTopWidth: 2,
    borderRadius: 1,
    backgroundColor: '#e0e0e0',
    height: 2,
    border: 0,
  },
  '&.Mui-completed .MuiStepConnector-line': {
    backgroundColor: '#08784f',
  },
  '&.Mui-active .MuiStepConnector-line': {
    backgroundColor: '#08784f',
  },
  '&.MuiStepConnector-root': {
    right: 'calc(-50% + 12px)',
    left: 'calc(50% + 12px)',
    top: 12,
  },
}));

// Custom Step Icon
const CustomStepIcon = styled('div')<{ active?: boolean; completed?: boolean; isCanceled?: boolean }>(({ theme, active, completed, isCanceled }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isCanceled ? '#c9372c' : completed || active ? '#08784f' : '#dce6e0',
  color: completed || active || isCanceled ? '#fff' : '#999',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  zIndex: 2,
  position: 'relative',
}));

// کامپوننت StepIcon
function StepIcon(props: { active?: boolean; completed?: boolean; className?: string; isCanceled?: boolean }) {
  const { completed, active, className, isCanceled } = props;

  return (
    <CustomStepIcon active={active} completed={completed} isCanceled={isCanceled} className={className}>
      {completed && !isCanceled ? <Check style={{ fontSize: '14px' }} /> : null}
      {isCanceled ? '✕' : null}
    </CustomStepIcon>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const router = useRouter();

  // بارگذاری سفارشات
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await getOrders();
        setOrders(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در بارگذاری سفارشات');
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // مدیریت بستن Toast
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  // هندلر کلیک روی دکمه جزئیات
  const handleDetailsClick = (orderId: number, status: string) => {
    if (status === 'pending') {
      router.push(`/searching/${orderId}`);
    } else {
      router.push(`/orderdetail/${orderId}`);
    }
  };

  // مدیریت کلیک روی دکمه لغو
  const handleCancelClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setOpenCancelDialog(true);
  };

  // مدیریت لغو سفارش
  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    try {
      setIsLoading(true);
      await updateOrderStatus(selectedOrderId, 'canceled');
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderId ? { ...order, status: 'canceled' } : order
        )
      );
      setOpenSnackbar(true);
      setError('سفارش با موفقیت لغو شد.');
      setOpenCancelDialog(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در لغو سفارش');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
      setSelectedOrderId(null);
    }
  };

  return (
    <AppFrame>
      <Header title="تیپاکس پونک - سفارشات من" />
      <Box
        className={styles.container}
        sx={{
          textAlign: 'right',
          minHeight: 'calc(100dvh - 68px)',
          overflowY: 'auto',
          pb: 14,
          pt: 2.5,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'transparent',
          direction: 'rtl',
        }}
      >
        <Box sx={{ px: 2, flex: 1 }}>
          {isLoading ? (
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: '20px' }}>
              <Typography sx={{ color: '#65746c', fontFamily: 'IranYekan, sans-serif' }}>در حال بارگذاری...</Typography>
            </Card>
          ) : orders.length === 0 ? (
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: '20px' }}>
              <ReceiptLongOutlined sx={{ color: '#08784f', fontSize: 34, mb: 1 }} />
              <Typography sx={{ color: '#17231e', fontWeight: 800, fontFamily: 'IranYekan, sans-serif' }}>هنوز سفارشی ثبت نکرده‌اید</Typography>
              <Typography sx={{ color: '#65746c', fontSize: 12, mt: 0.75, fontFamily: 'IranYekan, sans-serif' }}>با ثبت اولین مرسوله، وضعیت آن را همین‌جا دنبال کنید.</Typography>
            </Card>
          ) : (
            orders.map((order) => (
              <Card
                key={order.id}
                elevation={8}
                sx={{
                  borderRadius: '22px',
                  background: '#ffffff',
                  color: '#17231e',
                  overflow: 'hidden',
                  mb: 1.5,
                }}
              >
                <CardContent sx={{ p: 2.25 }}>
                  {/* Header Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, gap: 1 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: '#65746c', mb: 0.5, fontSize: 11, fontFamily: 'IranYekan, sans-serif' }}>
                        مرسوله
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#17231e', fontWeight: 800 }}>
                        #p-{order.id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '11px', color: '#65746c', fontFamily: 'IranYekan, sans-serif', textAlign: 'left' }}>
                        {formatPersianDate(order.created_at)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Order Details */}
                  <Box sx={{ mb: 2.5, textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '12px', color: '#34483e', lineHeight: 1.9, fontFamily: 'IranYekan, sans-serif' }}>
                      آدرس: {order.address_details}
                      {order.address_alley && <span> کوچه {order.address_alley.replace('کوچه', '')}</span>}
                      {order.address_plate && <span> پلاک  {order.address_plate.replace('پلاک', '')}</span>}
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: '12px', color: '#65746c', fontFamily: 'IranYekan, sans-serif' }}>
                      حمل و نقل: {order?.vehicle_type_name || 'نامشخص'}
                    </Typography>
                  </Box>

                  {/* پس از تأیید جمع‌آوری، تا زمان جمع‌آوریِ واقعی شمارش معکوس نشان داده می‌شود */}
                  {order.status === 'collected' && (
                    <PickupCountdown collectedAt={order.collected_at} />
                  )}

                  {/* Progress Stepper */}
                  <Box
                    sx={{
                      mb: 3,
                      direction: 'rtl',
                      px: 1,
                      backgroundColor: '#f4f8f5',
                      p: '12px 8px',
                      border: '1px solid #e1eae5',
                      borderRadius: '18px',
                    }}
                  >
                    <Stepper
                      activeStep={getActiveStep(order.status)}
                      alternativeLabel
                      connector={<CustomConnector />}
                      sx={{
                        direction: 'rtl',
                        '& .MuiStepLabel-root': {
                          position: 'relative',
                        },
                        '& .MuiStepLabel-label': {
                          color: '#65746c',
                          fontWeight: 500,
                          fontSize: '0.58rem',
                          mt: 1.5,
                          textAlign: 'center',
                          maxWidth: '80px',
                          lineHeight: 1.2,
                          fontFamily: 'IranYekan, sans-serif',
                        },
                        '& .MuiStepLabel-label.Mui-completed': {
                          color: '#08784f',
                          fontWeight: 600,
                        },
                        '& .MuiStepLabel-label.Mui-active': {
                          color: '#08784f',
                          fontWeight: 600,
                        },
                        '& .MuiStep-root': {
                          flex: 1,
                          position: 'relative',
                        },
                        '& .MuiStep-root:first-of-type .MuiStepConnector-root': {
                          display: 'none',
                        },
                        '& .MuiStepConnector-root': {
                          position: 'absolute',
                          top: 12,
                          right: 'calc(-50% + 12px)',
                          left: 'calc(50% + 12px)',
                        },
                      }}
                    >
                      {steps.map((label, index) => (
                        <Step key={label} completed={index < getActiveStep(order.status)}>
                          <StepLabel StepIconComponent={(props) => <StepIcon {...props} isCanceled={order.status === 'canceled' && index === 4} />}>
                            {label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  {/* Bottom Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap', color: '#08784f', fontFamily: 'IranYekan, sans-serif' }}>
                        {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={() => handleDetailsClick(order.id, order.status)}
                        sx={{
                          bgcolor: '#08784f',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '13px',
                          whiteSpace: 'nowrap',
                          px: 2,
                          py: 1.2,
                          borderRadius: 8,
                          boxShadow: 3,
                          '&:hover': {
                            bgcolor: '#075c3e',
                            transform: 'translateY(-2px)',
                            boxShadow: 6,
                          },
                          transition: 'all 0.2s ease',
                          fontFamily: 'IranYekan, sans-serif',
                        }}
                      >
                        جزئیات بیشتر
                      </Button>
                      {/* لغو فقط تا قبل از تأیید جمع‌آوری ممکن است — سرور هم همین را اعمال می‌کند */}
                      {order.status === 'pending' && (
                        <Button
                          variant="outlined"
                          onClick={() => handleCancelClick(order.id)}
                          disabled={isLoading}
                          sx={{
                            bgcolor: '#ffffff',
                            borderColor: '#dc2626',
                            color: '#dc2626',
                            fontWeight: 600,
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                            px: 2,
                            py: 1.2,
                            borderRadius: 8,
                            '&:hover': {
                              bgcolor: '#fff5f5',
                              borderColor: '#b91c1c',
                              color: '#b91c1c',
                              transform: 'translateY(-2px)',
                              boxShadow: 3,
                            },
                            transition: 'all 0.2s ease',
                            fontFamily: 'IranYekan, sans-serif',
                          }}
                        >
                          لغو سفارش
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
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

        {/* نمایش خطا به صورت Toast */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={error.includes('خطا') ? 'error' : 'success'}
            sx={{
              fontFamily: 'IranYekan, sans-serif',
              bgcolor: error.includes('خطا') ? '#ffebee' : '#e8f5e9',
              color: error.includes('خطا') ? '#c62828' : '#2e7d32',
              '& .MuiAlert-icon': {
                color: error.includes('خطا') ? '#c62828' : '#2e7d32',
              },
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
      <CustomBottomNavigation />
    </AppFrame>
  );
}
