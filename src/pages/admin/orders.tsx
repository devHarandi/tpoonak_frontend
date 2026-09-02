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
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check } from '@mui/icons-material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getAllOrders, settingOrder, updateOrderStatus, changeSettingOrder } from '@/services/order';
import { Order } from '@/types/order';
import styles from '../../components/feature/styles/Home.module.css';
import PersianDate from 'persian-date';
import SignatureCanvas from 'react-signature-canvas';

// تابع برای تبدیل تاریخ به شمسی
const formatPersianDate = (dateStr: string) => {
  try {
    const date = new PersianDate(new Date(dateStr));
    return date.format('D MMMM YYYY HH:mm');
  } catch {
    return dateStr;
  }
};

// تعریف مراحل استپر
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
    backgroundColor: '#4caf50',
  },
  '&.Mui-active .MuiStepConnector-line': {
    backgroundColor: status === 'canceled' ? '#dc2626' : '#4caf50',
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
  backgroundColor: isCanceled ? '#dc2626' : completed || active ? '#4caf50' : '#e0e0e0',
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
      {completed && !isCanceled ? <Check style={{ fontSize: '14px' }} /> : isCanceled ? '✕' : null}
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
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);
  const signatureRef = useRef<any>(null);
  const router = useRouter();
  const [isActiveOrder, setIsActiveOrder] = useState<boolean>(true);

  // بارگذاری سفارشات و تنظیمات اولیه
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await getAllOrders(statusFilter || undefined);
        const responseSetting = await settingOrder();
        setIsActiveOrder(responseSetting.data.can_create_order);
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

  // هندلر تغییر وضعیت سوئیچ
  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.checked;
    try {
      setIsLoading(true);
      await changeSettingOrder({ can_create_order: newStatus });
      setIsActiveOrder(newStatus);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('شما اجازه انجام این دستور را ندارید.');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'خطا در تغییر وضعیت سفارشات');
        setOpenSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  // هندلر باز کردن مدال لغو
  const handleOpenCancelModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setOpenCancelModal(true);
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

  const handleCloseCancelModal = () => {
    setOpenCancelModal(false);
    setSelectedOrderId(null);
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
      const response = await updateOrderStatus(selectedOrderId, 'transferred_to_tipax');
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
      const signatureData = signatureRef.current.toDataURL();
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

  // هندلر لغو سفارش
  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;

    try {
      setIsLoading(true);
      const response = await updateOrderStatus(selectedOrderId, 'canceled');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrderId ? { ...order, status: response.data.status } : order
        )
      );
      setOpenSnackbar(true);
      setError('سفارش با موفقیت لغو شد.');
      handleCloseCancelModal();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('شما اجازه انجام این دستور را ندارید.');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'خطا در لغو سفارش');
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
    { value: 'transferred_to_tipax', label: 'تحویل به تیپاکس پونک' },
    { value: 'delivered', label: 'تحویل به شرکت' },
    { value: 'canceled', label: 'لغو شده' },
  ];

  return (
    <AppFrame>
      <Header title="تیپاکس پونک - همه سفارشات" />
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, p: 1.5, bgcolor: '#fff', border: '1px solid #e1eae5', borderRadius: '16px' }}>
            <Typography variant="body1" sx={{ flex: 1, fontFamily: 'IranYekan, sans-serif' }}>
              {isActiveOrder ? 'سفارشات به صورت کلی باز است' : 'سفارشات به صورت کلی بسته است'}
            </Typography>
            <Switch
              checked={isActiveOrder}
              onChange={handleSwitchChange}
              disabled={isLoading}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#08784f',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#08784f',
                },
                '& .MuiSwitch-switchBase.Mui-disabled': {
                  color: '#cccccc',
                },
                '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                  backgroundColor: '#cccccc',
                },
              }}
            />
          </Box>

          {/* فیلتر وضعیت */}
          <Box sx={{ mb: 2.5 }}>
            <FormControl sx={{ minWidth: '100%', backgroundColor: '#fff', borderRadius: '14px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dce8e1' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#08784f' } }}>
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
            <Card sx={{ borderRadius: '18px', textAlign: 'center' }}><CardContent sx={{ py: 5 }}><Typography sx={{ color: '#65746c', fontFamily: 'IranYekan, sans-serif' }}>در حال بارگذاری...</Typography></CardContent></Card>
          ) : orders.length === 0 ? (
            <Card sx={{ borderRadius: '18px', textAlign: 'center' }}><CardContent sx={{ py: 5 }}><Typography sx={{ color: '#65746c', fontFamily: 'IranYekan, sans-serif' }}>سفارشی یافت نشد</Typography></CardContent></Card>
          ) : (
            orders.map((order) => (
              <Card
                key={order.id}
                elevation={8}
                sx={{
                  borderRadius: '22px',
                  background: '#fff',
                  color: '#17231e',
                  overflow: 'hidden',
                  mb: 1.5,
                }}
              >
                <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                  {/* Header Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: '#65746c', mb: 0.5, fontFamily: 'IranYekan, sans-serif' }}>
                        مرسوله ارسالی
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#17231e', fontWeight: 800 }}>
                        #p-{order.id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '12px', color: '#65746c', fontFamily: 'IranYekan, sans-serif' }}>
                        {formatPersianDate(order.created_at)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Order Details */}
                  <Box sx={{ mb: 2.5, textAlign: 'right', gap: 0.75, display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontSize: '13px', lineHeight: 1.9, color: '#65746c', fontFamily: 'IranYekan, sans-serif' }}>
                      آدرس: {order.address_details}{' '}
                      {order.address_alley && <span> کوچه {order.address_alley.replace('کوچه', '')}</span>}
                      {order.address_plate && <span> پلاک {order.address_plate.replace('پلاک', '')}</span>}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#65746c', fontFamily: 'IranYekan, sans-serif' }}>
                      حمل و نقل: {order?.vehicle_type_name || 'نامشخص'}
                    </Typography>
                  </Box>

                  {/* Progress Stepper */}
                  <Box
                    sx={{
                      mb: 3,
                      direction: 'rtl',
                      px: 2,
                      backgroundColor: '#f4f8f5',
                      p: '12px 8px',
                      border: '1px solid #e1ece5',
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
                          fontSize: '0.6rem',
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
                      <Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#08784f', fontFamily: 'IranYekan, sans-serif' }}>
                        مبلغ {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {order.status === 'pending' && (
                        <>
                          <Button
                            variant="contained"
                            onClick={() => handleOpenCollectModal(order.id)}
                            sx={{
                              bgcolor: '#08784f',
                              color: '#fff',
                              fontWeight: 600,
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: '#075c3e',
                              },
                              transition: 'all 0.2s ease',
                              fontFamily: 'IranYekan, sans-serif',
                            }}
                          >
                            تأیید جمع‌آوری
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenCancelModal(order.id)}
                            sx={{
                              borderColor: '#dc2626',
                              color: '#dc2626',
                              fontWeight: 600,
                              px: 2,
                              py: 1,
                              borderRadius: 8,
                              '&:hover': {
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
                        </>
                      )}
                      {order.status === 'collected' && (
                        <Button
                          variant="contained"
                          onClick={() => handleOpenPackroModal(order.id)}
                          sx={{
                            bgcolor: '#f4c400',
                            color: '#17231e',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: '#ddb000',
                            },
                            transition: 'all 0.2s ease',
                            fontFamily: 'IranYekan, sans-serif',
                          }}
                        >
                          تأیید تحویل به تیپاکس پونک
                        </Button>
                      )}
                      {order.status === 'transferred_to_tipax' && (
                        <Button
                          variant="contained"
                          onClick={() => handleOpenCarrierModal(order.id)}
                          sx={{
                            bgcolor: '#f4c400',
                            color: '#17231e',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: '#ddb000',
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
                          bgcolor: '#fff',
                          color: '#08784f',
                          fontWeight: 600,
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#e6f4ee',
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

        {/* مدال تأیید لغو سفارش */}
        <Dialog
          open={openCancelModal}
          onClose={handleCloseCancelModal}
          sx={{ direction: 'rtl' }}
        >
          <DialogTitle>تأیید لغو سفارش</DialogTitle>
          <DialogContent>
            <DialogContentText>
              آیا از لغو سفارش مطمئن هستید؟
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCancelModal} color="primary">
              خیر
            </Button>
            <Button onClick={handleConfirmCancel} color="error" autoFocus>
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
