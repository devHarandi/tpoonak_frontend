import { useState, useEffect, useRef } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check } from '@mui/icons-material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getAllOrders, updateOrderStatus } from '@/services/order';
import { Order } from '@/types/order';
import styles from '../components/feature/styles/Home.module.css';
import PersianDate from 'persian-date';
import SignatureCanvas from 'react-signature-canvas';

// تابع برای تبدیل تاریخ به شمسی
const formatPersianDate = (dateStr: string) => {
  try {
    const date = new PersianDate(new Date(dateStr));
    return date.format('D MMMM YYYY'); // مثلاً: سوم خرداد ۱۴۰۴
  } catch {
    return dateStr; // در صورت خطا، تاریخ اصلی
  }
};

// تعریف مراحل استپر
const steps = ['ثبت مرسوله', 'تایید جمع‌آوری', 'تحویل به تیپاکس پونک', 'تحویل به شرکت'];

const getActiveStep = (status: string): number => {
  const statusMap: { [key: string]: number } = {
    pending: 0,
    collected: 1,
    transferred_to_pakro: 2,
    delivered: 3,
  };
  return statusMap[status] || 0; // پیش‌فرض: pending
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
    backgroundColor: '#4caf50',
  },
  '&.Mui-active .MuiStepConnector-line': {
    backgroundColor: '#4caf50',
  },
  '&.MuiStepConnector-root': {
    right: 'calc(-50% + 12px)',
    left: 'calc(50% + 12px)',
    top: 12,
  },
}));

// Custom Step Icon
const CustomStepIcon = styled('div')<{ active?: boolean; completed?: boolean }>(({ theme, active, completed }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed || active ? '#4caf50' : '#e0e0e0',
  color: completed || active ? '#fff' : '#999',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  zIndex: 2,
  position: 'relative',
}));

// کامپوننت StepIcon
function StepIcon(props: { active?: boolean; completed?: boolean; className?: string }) {
  const { completed, active, className } = props;

  return (
    <CustomStepIcon active={active} completed={completed} className={className}>
      {completed ? <Check style={{ fontSize: '14px' }} /> : null}
    </CustomStepIcon>
  );
}

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openCollectModal, setOpenCollectModal] = useState<boolean>(false);
  const [openPackroModal, setOpenPackroModal] = useState<boolean>(false);
  const [openCarrierModal, setOpenCarrierModal] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);
  const signatureRef = useRef<any>(null);
  const router = useRouter();

  // بارگذاری سفارشات
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await getAllOrders(statusFilter || undefined);
        setOrders(response.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('شما اجازه انجام این دستور را ندارید.');
          setOpenSnackbar(true);
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setError(err.response?.data?.message || 'خطا در بارگذاری سفارشات');
          setOpenSnackbar(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, router]);

  // مدیریت بستن Toast
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  // هندلر باز کردن مدال تأیید جمع‌آوری
  const handleOpenCollectModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setOpenCollectModal(true);
  };

  // هندلر باز کردن مدال تحویل به تیپاکس پونک
  const handleOpenPackroModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setOpenPackroModal(true);
  };

  // هندلر باز کردن مدال تحویل به مقصد
  const handleOpenCarrierModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setOpenCarrierModal(true);
  };

  // مدیریت بستن مدال‌ها
  const handleCloseCollectModal = () => {
    setOpenCollectModal(false);
    setSelectedOrderId(null);
  };

  const handleClosePackroModal = () => {
    setOpenPackroModal(false);
    setSelectedOrderId(null);
  };

  const handleCloseCarrierModal = () => {
    setOpenCarrierModal(false);
    setSelectedOrderId(null);
    setSignature(null);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  // هندلر تأیید جمع‌آوری
  const handleConfirmCollect = async () => {
    if (!selectedOrderId) return;

    try {
      setIsLoading(true);
      const response = await updateOrderStatus(selectedOrderId, 'collected');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrderId ? { ...order, status: response.data.status } : order
        )
      );
      handleCloseCollectModal();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('شما اجازه انجام این دستور را ندارید.');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'خطا در به‌روزرسانی وضعیت سفارش');
        setOpenSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر تأیید تحویل به تیپاکس پونک
  const handleConfirmPackro = async () => {
    if (!selectedOrderId) return;

    try {
      setIsLoading(true);
      const response = await updateOrderStatus(selectedOrderId, 'transferred_to_pakro');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrderId ? { ...order, status: response.data.status } : order
        )
      );
      handleClosePackroModal();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('شما اجازه انجام این دستور را ندارید.');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'خطا در به‌روزرسانی وضعیت سفارش');
        setOpenSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر تأیید تحویل به مقصد
  const handleConfirmCarrier = async () => {
    if (!selectedOrderId) return;
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError('لطفاً امضا کنید');
      setOpenSnackbar(true);
      return;
    }

    try {
      setIsLoading(true);
      const signatureData = signatureRef.current.toDataURL(); // ذخیره امضا به صورت Base64
      setSignature(signatureData);
      const response = await updateOrderStatus(selectedOrderId, 'delivered');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrderId ? { ...order, status: response.data.status } : order
        )
      );
      handleCloseCarrierModal();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('شما اجازه انجام این دستور را ندارید.');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'خطا در به‌روزرسانی وضعیت سفارش');
        setOpenSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر کلیک روی دکمه جزئیات
  const handleDetailsClick = (orderId: number) => {
    router.push(`/orderdetail/${orderId}`);
  };

  // هندلر تغییر فیلتر وضعیت
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value as string);
  };

  // گزینه‌های فیلتر وضعیت
  const statusOptions = [
    { value: '', label: 'همه' },
    { value: 'pending', label: 'در انتظار' },
    { value: 'collected', label: 'جمع‌آوری‌شده' },
    { value: 'transferred_to_pakro', label: 'تحویل به تیپاکس پونک' },
    { value: 'delivered', label: 'تحویل به شرکت' },
  ];

  return (
    <AppFrame>
     <Header title="تیپاکس پونک - همه سفارشات" />
      <Box
        className={styles.container}
        sx={{
          textAlign: 'right',
          minHeight: '100%',
          overflowY: 'auto',
          pb: 10,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
          direction: 'rtl',
        }}
      >

        <Box sx={{ p: 1, flex: 1 }}>
          {/* فیلتر وضعیت */}
          <Box sx={{ mb: 2 }}>
            <FormControl sx={{ minWidth: '100%', backgroundColor: '#FFFFFF', borderRadius: '8px' }}>
              <InputLabel sx={{ fontFamily: 'IranYekan, sans-serif' }}>وضعیت</InputLabel>
              <Select
                value={statusFilter}
                label="وضعیت"
                onChange={handleStatusFilterChange}
                sx={{
                  textAlign: 'right',
                  fontFamily: 'IranYekan, sans-serif',
                  '& .MuiSelect-select': {
                    textAlign: 'right',
                  },
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontFamily: 'IranYekan, sans-serif' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {isLoading ? (
            <Typography sx={{ textAlign: 'center', fontFamily: 'IranYekan, sans-serif' }}>
              در حال بارگذاری...
            </Typography>
          ) : orders.length === 0 ? (
            <Typography sx={{ textAlign: 'center', fontFamily: 'IranYekan, sans-serif' }}>
              سفارشی یافت نشد
            </Typography>
          ) : (
            orders.map((order) => (
              <Card
                key={order.id}
                elevation={8}
                sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(180deg, #E5E9ED 0%, #00784a 100%)',
                  color: 'white',
                  overflow: 'visible',
                  mb: 2,
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  {/* Header Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: '#595959', mb: 0.5, fontFamily: 'IranYekan, sans-serif' }}>
                        مرسوله ارسالی
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#000000' }}>
                        #p-{order.id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '14px', color: '#000000', fontFamily: 'IranYekan, sans-serif' }}>
                        {formatPersianDate(order.created_at)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Order Details */}
                  <Box sx={{ mb: 4, textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                      آدرس: {order.address_details}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                       حمل و نقل: {order?.vehicle_type_name || 'نامشخص'}
                    </Typography>
                  </Box>

                  {/* Progress Stepper */}
                  <Box
                    sx={{
                      mb: 6,
                      direction: 'rtl',
                      px: 2,
                      backgroundColor: '#00784aED',
                      p: '10px',
                      borderRadius: '26px',
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
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.6rem',
                          mt: 1.5,
                          textAlign: 'center',
                          maxWidth: '80px',
                          lineHeight: 1.2,
                          fontFamily: 'IranYekan, sans-serif',
                        },
                        '& .MuiStepLabel-label.Mui-completed': {
                          color: 'white',
                          fontWeight: 600,
                        },
                        '& .MuiStepLabel-label.Mui-active': {
                          color: 'white',
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
                          <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  {/* Bottom Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'IranYekan, sans-serif' }}>
                        مبلغ {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {order.status === 'pending' && (
                        <Button
                          variant="contained"
                          onClick={() => handleOpenCollectModal(order.id)}
                          sx={{
                            bgcolor: '#4caf50',
                            color: '#fff',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            borderRadius: 8,
                            boxShadow: 3,
                            '&:hover': {
                              bgcolor: '#45a049',
                              transform: 'translateY(-2px)',
                              boxShadow: 6,
                            },
                            transition: 'all 0.2s ease',
                            fontFamily: 'IranYekan, sans-serif',
                          }}
                        >
                          تأیید جمع‌آوری
                        </Button>
                      )}
                      {order.status === 'collected' && (
                        <Button
                          variant="contained"
                          onClick={() => handleOpenPackroModal(order.id)}
                          sx={{
                            bgcolor: '#FFC107',
                            color: '#fff',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            borderRadius: 8,
                            boxShadow: 3,
                            '&:hover': {
                              bgcolor: '#FFB300',
                              transform: 'translateY(-2px)',
                              boxShadow: 6,
                            },
                            transition: 'all 0.2s ease',
                            fontFamily: 'IranYekan, sans-serif',
                          }}
                        >
                          تأیید تحویل به تیپاکس پونک
                        </Button>
                      )}
                      {order.status === 'transferred_to_pakro' && (
                        <Button
                          variant="contained"
                          onClick={() => handleOpenCarrierModal(order.id)}
                          sx={{
                            bgcolor: '#fbd700',
                            color: '#fff',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            borderRadius: 8,
                            boxShadow: 3,
                            '&:hover': {
                              bgcolor: '#fbd700',
                              transform: 'translateY(-2px)',
                              boxShadow: 6,
                            },
                            transition: 'all 0.2s ease',
                            fontFamily: 'IranYekan, sans-serif',
                          }}
                        >
                          تحویل به مقصد
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        onClick={() => handleDetailsClick(order.id)}
                        sx={{
                          bgcolor: 'white',
                          color: '#1e293b',
                          fontWeight: 600,
                          px: 2,
                          py: 1,
                          borderRadius: 8,
                          boxShadow: 3,
                          '&:hover': {
                            bgcolor: '#f8fafc',
                            transform: 'translateY(-2px)',
                            boxShadow: 6,
                          },
                          transition: 'all 0.2s ease',
                          fontFamily: 'IranYekan, sans-serif',
                        }}
                      >
                        جزئیات بیشتر
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>

        {/* مدال تأیید جمع‌آوری */}
        <Modal open={openCollectModal} onClose={handleCloseCollectModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: 24,
              p: 3,
              direction: 'rtl',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif' }}>
              تأیید جمع‌آوری سفارش
            </Typography>
            <Typography sx={{ mb: 3, fontFamily: 'IranYekan, sans-serif' }}>
              آیا مطمئن هستید که می‌خواهید این سفارش را به عنوان جمع‌آوری‌شده تأیید کنید؟
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCloseCollectModal}
                sx={{ borderColor: '#E0E0E0', color: '#000', fontFamily: 'IranYekan, sans-serif' }}
              >
                خیر
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmCollect}
                sx={{ backgroundColor: '#4caf50', color: '#fff', fontFamily: 'IranYekan, sans-serif' }}
                disabled={isLoading}
              >
                بله
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* مدال تأیید تحویل به تیپاکس پونک */}
        <Modal open={openPackroModal} onClose={handleClosePackroModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: 24,
              p: 3,
              direction: 'rtl',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif' }}>
              تأیید تحویل به تیپاکس پونک
            </Typography>
            <Typography sx={{ mb: 3, fontFamily: 'IranYekan, sans-serif' }}>
              آیا مطمئن هستید که می‌خواهید این سفارش را به عنوان تحویل‌شده به تیپاکس پونک تأیید کنید؟
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleClosePackroModal}
                sx={{ borderColor: '#E0E0E0', color: '#000', fontFamily: 'IranYekan, sans-serif' }}
              >
                خیر
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmPackro}
                sx={{ backgroundColor: '#FFC107', color: '#fff', fontFamily: 'IranYekan, sans-serif' }}
                disabled={isLoading}
              >
                بله
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* مدال تحویل به مقصد با امضا */}
        <Modal open={openCarrierModal} onClose={handleCloseCarrierModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: 24,
              p: 3,
              direction: 'rtl',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif' }}>
              تحویل به مقصد
            </Typography>
            <Typography sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif' }}>
              لطفاً امضای خود را در کادر زیر وارد کنید:
            </Typography>
            <Box
              sx={{
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                mb: 3,
                height: '150px',
                backgroundColor: '#F5F5F5',
              }}
            >
              <SignatureCanvas
                ref={signatureRef}
                penColor="black"
                canvasProps={{ width: 360, height: 150, style: { width: '100%', height: '150px' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCloseCarrierModal}
                sx={{ borderColor: '#E0E0E0', color: '#000', fontFamily: 'IranYekan, sans-serif' }}
              >
                لغو
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmCarrier}
                sx={{ backgroundColor: 'rgba(0, 26, 57, 0.93)', color: '#fff', fontFamily: 'IranYekan, sans-serif' }}
                disabled={isLoading}
              >
                تأیید
              </Button>
            </Box>
          </Box>
        </Modal>



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
      </Box>

              <CustomBottomNavigation />
    </AppFrame>
  );
}