import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check } from '@mui/icons-material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import Image from 'next/image';
import { getOrder, uploadOrderImage, updateOrderStatus } from '@/services/order';
import { getProfile } from '@/services/user';
import { Order } from '@/types/order';
import { GetProfileResponse } from '@/types/user';
import styles from '../../components/feature/styles/Home.module.css';
import PersianDate from 'persian-date';

// تصاویر رسانه‌ای از ریشه‌ی API می‌آیند، نه از مسیر قدیمی /rest.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'https://api.tpoonak.com')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

const resolveMediaUrl = (value?: string | null) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
};

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
const CustomStepIcon = styled('div')<{ ownerState: { completed?: boolean; active?: boolean; isCanceled?: boolean } }>(
  ({ theme, ownerState }) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ownerState.isCanceled ? '#dc2626' : ownerState.completed || ownerState.active ? '#4caf50' : '#e0e0e0',
    color: ownerState.completed || ownerState.active || ownerState.isCanceled ? '#fff' : '#999',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    boxShadow: theme.shadows[2],
    transition: 'all 0.3s ease',
    zIndex: 2,
    position: 'relative',
  })
);

// کامپوننت StepIcon
function StepIcon(props: { completed?: boolean; active?: boolean; isCanceled?: boolean }) {
  const { completed, active, isCanceled } = props;

  return (
    <CustomStepIcon ownerState={{ completed, active, isCanceled }}>
      {completed && !isCanceled ? <Check sx={{ fontSize: '14px' }} /> : isCanceled ? '✕' : null}
    </CustomStepIcon>
  );
}

export default function OrderDetail() {
  const [order, setOrder] = useState<Order | null>(null);
  const [canUpload, setCanUpload] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const router = useRouter();
  const params = useParams();
  const orderId = params && typeof params.id === 'string' && !isNaN(parseInt(params.id, 10)) ? parseInt(params.id, 10) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // محاسبه زمان باقی‌مانده برای شمارش معکوس
  useEffect(() => {
    if (order && order.collected_at) {
      const collectedDate = new Date(order.collected_at).getTime();
      const threeHours = 3 * 60 * 60 * 1000;
      const endTime = collectedDate + threeHours;

      const updateTimer = () => {
        const now = new Date().getTime();
        const remaining = endTime - now;
        if (remaining <= 0) {
          setTimeRemaining(0);
          setIsOverdue(true);
        } else {
          setTimeRemaining(remaining);
          setIsOverdue(false);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [order]);

  // فرمت زمان باقی‌مانده به صورت ساعت:دقیقه:ثانیه
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // بارگذاری جزئیات سفارش و بررسی نقش کاربر
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
        const [orderResponse, profileResponse] = await Promise.all([
          getOrder(orderId),
          getProfile(),
        ]);
        setOrder(orderResponse.data);
        const roles = profileResponse.data.profile.roles;
        const hasCollectorOrAdmin = roles.some((role) => role.name === 'Collector' || role.name === 'Admin');
        setCanUpload(hasCollectorOrAdmin);
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
  }, [orderId, router]);

  // مدیریت بستن Toast
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  // هندلر تماس با جمع‌آورنده
  // پاسخ سرور برای مشتری فقط {first_name,last_name} دارد و برای حمل‌کننده/ادمین
  // ساختار کامل profile را — هر دو حالت را پوشش می‌دهیم.
  const carrierFirstName = order?.carrier?.profile?.first_name ?? order?.carrier?.first_name ?? '';
  const carrierLastName = order?.carrier?.profile?.last_name ?? order?.carrier?.last_name ?? '';
  const carrierDisplayName = `${carrierFirstName} ${carrierLastName}`.trim() || 'نامشخص';
  const carrierMobile = order?.carrier?.profile?.mobile ?? order?.carrier?.mobile ?? '';
  const carrierImage = resolveMediaUrl(order?.carrier?.profile_image ?? order?.carrier?.profile?.profile_image);

  const handleCallCollector = () => {
    const mobile = order?.carrier?.profile?.mobile ?? order?.carrier?.mobile;
    if (mobile) {
      window.location.href = `tel:${mobile}`;
    } else {
      setError('شماره تماس در دسترس نیست');
      setOpenSnackbar(true);
    }
  };

  // هندلر تماس با فرستنده
  const handleCallOwner = () => {
    const mobile = order?.user_mobile;
    if (mobile) {
      window.location.href = `tel:${mobile}`;
    } else {
      setError('شماره تماس در دسترس نیست');
      setOpenSnackbar(true);
    }
  };

  // هندلر آپلود عکس
  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!orderId || !event.target.files || event.target.files.length === 0) {
      setError('لطفاً یک تصویر انتخاب کنید');
      setOpenSnackbar(true);
      return;
    }

    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) {
      setError('فقط فایل‌های تصویری مجاز هستند');
      setOpenSnackbar(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await uploadOrderImage(orderId, file);
      setOrder(response.data);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('شما اجازه انجام این دستور را ندارید.');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'خطا در آپلود تصویر');
        setOpenSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر باز کردن مدال تصویر
  const handleOpenImageModal = (image: string) => {
    setSelectedImage(image);
    setOpenImageModal(true);
  };

  // هندلر بستن مدال تصویر
  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setSelectedImage(null);
  };

  // هندلر باز کردن مدال لغو
  const handleOpenCancelModal = () => {
    setOpenCancelModal(true);
  };

  // هندلر بستن مدال لغو
  const handleCloseCancelModal = () => {
    setOpenCancelModal(false);
  };

  // هندلر لغو سفارش
  const handleConfirmCancel = async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      const response = await updateOrderStatus(orderId, 'canceled');
      setOrder({ ...order!, status: response.data.status });
      setOpenSnackbar(true);
      setError('سفارش با موفقیت لغو شد.');
      handleCloseCancelModal();
      setTimeout(() => {
        router.push('/orders');
      }, 2000);
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

  if (isLoading) {
    return (
      <AppFrame>
        <Box
          className={styles.container}
          sx={{
            textAlign: 'center',
            minHeight: 'calc(100dvh - 68px)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'transparent',
            direction: 'rtl',
          }}
        >
          <Header title="تیپاکس پونک - جزئیات سفارش" />
          <Typography sx={{ flex: 1, fontFamily: 'IranYekan, sans-serif' }}>
            در حال بارگذاری...
          </Typography>
          <CustomBottomNavigation />
        </Box>
      </AppFrame>
    );
  }

  if (!order) {
    return (
      <AppFrame>
        <Box
          className={styles.container}
          sx={{
            textAlign: 'center',
            minHeight: 'calc(100dvh - 68px)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'transparent',
            direction: 'rtl',
          }}
        >
          <Header title="تیپاکس پونک - جزئیات سفارش" />
          <Typography sx={{ flex: 1, fontFamily: 'IranYekan, sans-serif' }}>
            سفارشی یافت نشد
          </Typography>
          <CustomBottomNavigation />
        </Box>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <Header title="تیپاکس پونک - جزئیات سفارش" />
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
          <Card
            elevation={8}
            sx={{
              borderRadius: '22px',
              background: '#fff',
              color: '#17231e',
              overflow: 'hidden',
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

              {/* تایمر شمارش معکوس */}
              {order.collected_at && (order.status === 'pending' || order.status === 'collected') && (
                <Box
                  sx={{
                    backgroundColor: '#00784a',
                    color: 'white',
                    p: 2,
                    borderRadius: '16px',
                    textAlign: 'center',
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'IranYekan, sans-serif' }}>
                    زمان باقی‌مانده: {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : 'در حال محاسبه...'}
                  </Typography>
                  {isOverdue && (
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', mt: 1 }}>
                      با عرض پوزش بابت تاخیر به وجود آمده مرسولات شما حداکثر تا ساعت ۱۶ جمع آوری خواهد شد
                    </Typography>
                  )}
                </Box>
              )}

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

              {/* Packages */}
              {order.packages && order.packages.length > 0 ? (
                order.packages.map((pkg) => (
                  <Box
                    key={pkg.package_id}
                    sx={{
                      backgroundColor: '#FBFBFB',
                      boxShadow: '0px 4px 16px 0px rgba(18, 18, 18, 0.24)',
                      borderRadius: '16px',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 2,
                      width: '100%',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: { xs: '0 0 55%', sm: '0 0 60%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: '#000', fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
                          {pkg.package_name}: {pkg.quantity} عدد
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: '#000', fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
                          بسته‌بندی {pkg.package_name}: {pkg.packaging_quantity} عدد
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: { xs: '0 0 30%', sm: '0 0 30%' }, display: 'flex', justifyContent: 'center' }}>
                      <Image
                        src={pkg.package_name === 'بسته بزرگ' ? '/images/small-box.png' : '/images/boxes.png'}
                        alt={`بسته و بسته‌بندی ${pkg.package_name}`}
                        width={100}
                        height={100}
                        style={{ borderRadius: '8px', objectFit: 'contain' }}
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: '#000', fontFamily: 'IranYekan, sans-serif', textAlign: 'center', mt: 2 }}>
                  بسته‌ای یافت نشد
                </Typography>
              )}

              {/* Info Boxes */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {/* نوع مرسوله */}
                <Box
                  sx={{
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    نوع مرسوله
                  </Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    {order.carrier_type_title}
                  </Typography>
                </Box>

                {/* مجموع مبلغ */}
                <Box
                  sx={{
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    مجموع مبلغ
                  </Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                  </Typography>
                </Box>

                {/* فرستنده */}
                <Box
                  sx={{
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    فرستنده: {order.user_first_name} {order.user_last_name}
                  </Typography>
                  <Typography
                    sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}
                    onClick={() => handleCallOwner()}
                  >
                    موبایل: {order.user_mobile}
                  </Typography>
                </Box>

                {/* جمع‌آورنده */}
                <Box
                  sx={{
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={carrierImage || undefined}
                      alt={`تصویر ${carrierDisplayName}`}
                      sx={{ width: 42, height: 42, bgcolor: '#dcefe8', color: '#00784a', fontWeight: 700 }}
                    >
                      {`${carrierFirstName.charAt(0)}${carrierLastName.charAt(0)}` || 'ج'}
                    </Avatar>
                    <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                      جمع‌آورنده: {carrierDisplayName}
                    </Typography>
                  </Box>
                  {/* شماره‌ی جمع‌آورنده فقط برای حمل‌کننده و ادمین. سرور هم آن را
                      برای مشتری اصلاً نمی‌فرستد؛ این شرط فقط لایه‌ی دوم است. */}
                  {canUpload && carrierMobile && (
                    <Typography
                      sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}
                      onClick={() => handleCallCollector()}
                    >
                      موبایل: {carrierMobile}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    ناوگان:
                  </Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    {order.vehicle_type_name}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    آدرس: 
                    {order.address_details} 
                    {order.address_alley && <span> کوچه {order.address_alley.replace('کوچه', '')}</span>}
                    {order.address_plate && <span> پلاک {order.address_plate.replace('پلاک', '')}</span>}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    تحویل حضوری:
                  </Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    {order.is_in_person_pickup ? 'بله' : 'خیر'}
                  </Typography>
                </Box>

                {order.carrier_type_title === 'سایر' && order.carrier_type_text_display && (
                  <Box
                    sx={{
                      backgroundColor: '#FBFBFB',
                      borderRadius: '20px',
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                      سایر
                    </Typography>
                    <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                      {order.carrier_type_text_display}
                    </Typography>
                  </Box>
                )}

                {/* توضیحات */}
                {order.description && (
                  <Box
                    sx={{
                      backgroundColor: '#FBFBFB',
                      borderRadius: '20px',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                      توضیحات
                    </Typography>
                    <Typography sx={{ color: '#000', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                      {order.description}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* لیست عکس‌های بارگذاری‌شده */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography sx={{ color: '#08784f', fontWeight: 800, fontSize: '16px', mb: 2, fontFamily: 'IranYekan, sans-serif' }}>
                  لیست عکس‌های بارگذاری‌شده
                </Typography>
                {order.images && order.images.length > 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {order.images.map((img, index) => (
                      <Box
                        key={index}
                        sx={{
                          backgroundColor: '#FBFBFB',
                          borderRadius: '20px',
                          p: 1,
                          minWidth: '100px',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenImageModal(img.image)}
                      >
                        <Image
                          src={resolveMediaUrl(img.image)}
                          alt={`عکس ${index + 1}`}
                          width={80}
                          height={80}
                          style={{ borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <Typography sx={{ color: '#000', fontSize: '12px', fontFamily: 'IranYekan, sans-serif', mt: 1 }}>
                          عکس {index + 1}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: '#000', fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                    بدون تصویر
                  </Typography>
                )}

                {/* دکمه آپلود عکس (فقط برای Collector و Admin) */}
                {canUpload && (
                  <Box sx={{ mt: 2 }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleUploadImage}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        backgroundColor: '#f4c400',
                        color: '#17231e',
                        borderRadius: '20px',
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        fontFamily: 'IranYekan, sans-serif',
                        '&:hover': {
                          backgroundColor: '#ddb000',
                        },
                      }}
                    >
                      📁 آپلود عکس
                    </Button>
                  </Box>
                )}
              </Box>

              {/* دکمه‌های پایین */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                {canUpload && carrierMobile && (
                  <Button
                    variant="contained"
                    onClick={handleCallCollector}
                    sx={{
                      backgroundColor: '#08784f',
                      color: '#fff',
                      borderRadius: '20px',
                      py: 2,
                      fontWeight: 'bold',
                      fontSize: '16px',
                      fontFamily: 'IranYekan, sans-serif',
                      '&:hover': {
                        backgroundColor: '#075c3e',
                      },
                    }}
                  >
                    📞 تماس با جمع‌آورنده
                  </Button>
                )}
                {order.status === 'pending' && (
                  <Button
                    variant="outlined"
                    onClick={handleOpenCancelModal}
                    sx={{
                      borderColor: '#dc2626',
                      color: '#dc2626',
                      borderRadius: '20px',
                      py: 2,
                      fontWeight: 'bold',
                      fontSize: '16px',
                      fontFamily: 'IranYekan, sans-serif',
                      '&:hover': {
                        borderColor: '#b91c1c',
                        color: '#b91c1c',
                      },
                    }}
                  >
                    لغو سفارش
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* مدال بزرگ‌نمایی تصویر */}
        <Modal open={openImageModal} onClose={handleCloseImageModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 600 },
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: 24,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {selectedImage && (
              <Image
                src={resolveMediaUrl(selectedImage)}
                alt="تصویر بزرگ‌شده"
                width={500}
                height={500}
                style={{ borderRadius: '8px', objectFit: 'contain', maxWidth: '100%', maxHeight: '70vh' }}
              />
            )}
            <Button
              onClick={handleCloseImageModal}
              sx={{
                mt: 2,
                backgroundColor: '#E0E0E0',
                color: '#000',
                borderRadius: '8px',
                fontFamily: 'IranYekan, sans-serif',
                '&:hover': {
                  backgroundColor: '#D0D0D0',
                },
              }}
            >
              بستن
            </Button>
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
