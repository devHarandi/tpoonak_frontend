import { Box, Typography, Card, CardContent, Stepper, Step, StepLabel, StepConnector, Button } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { Check } from '@mui/icons-material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import styles from '../components/feature/styles/Home.module.css';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import Image from 'next/image';

// تایپ برای propsهای StepIcon
interface StepIconProps {
  completed?: boolean;
  active?: boolean;
}

// تایپ برای ownerState در CustomStepIcon
interface CustomStepIconProps {
  ownerState: {
    completed?: boolean;
    active?: boolean;
  };
}

// Custom Stepper Connector
const CustomConnector = styled(StepConnector)(({ theme }: { theme: Theme }) => ({
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
const CustomStepIcon = styled('div')<CustomStepIconProps>(({ theme, ownerState }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: ownerState.completed || ownerState.active ? '#4caf50' : '#e0e0e0',
  color: ownerState.completed || ownerState.active ? '#fff' : '#999',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  zIndex: 2,
  position: 'relative',
}));

// کامپوننت StepIcon
function StepIcon(props: StepIconProps) {
  const { completed, active } = props;

  return (
    <CustomStepIcon ownerState={{ completed, active }}>
      {completed ? <Check sx={{ fontSize: '14px' }} /> : null}
    </CustomStepIcon>
  );
}

export default function OrderDetail() {
  // تایپ برای steps
  const steps : string[] = ['ثبت درخواست', 'تایید جمع‌آوری', 'جمع آوری شده', 'تحویل به نمایندگی'];
  // تایپ برای activeStep
  const activeStep: number = 4;

  return (
    <AppFrame>
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
        <Header title="تیپاکس پونک - سفارشات من" />

        {/* Order Tracking Card */}
        <Box sx={{ p: 1, flex: 1 }}>
          <Card
            elevation={8}
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(180deg, #E5E9ED 0%, #00784a 100%)',
              color: 'white',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: 1 }}>
              {/* Header Section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: '#595959', mb: 0.5 }}>
                    مرسوله ارسالی
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#000000' }}>
                    #p-J9189198
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '14px', color: '#000000' }}>
                    تاریخ سوم خرداد ۱۴۰۴
                  </Typography>
                </Box>
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
                  activeStep={activeStep}
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
                    <Step key={label} completed={index < activeStep}>
                      <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Box 1: Large Package and Large Packing */}
              <Box
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
                    <Typography variant="body2" sx={{ mb: 1, color: '#000', fontWeight: 'bold' }}>
                      بسته‌های بزرگ: ۱۰ عدد
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#000', fontWeight: 'bold' }}>
                      بسته‌بندی‌های بزرگ: ۱۰ عدد
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '0 0 30%', sm: '0 0 30%' }, display: 'flex', justifyContent: 'center' }}>
                  <Image
                    src="/images/cube-logo.svg"
                    alt="بسته و بسته‌بندی بزرگ"
                    width={100}
                    height={100}
                    style={{ borderRadius: '8px', objectFit: 'contain' }}
                  />
                </Box>
              </Box>

              {/* Box 2: Small Package and Small Packing */}
              <Box
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
                    <Typography variant="body2" sx={{ mb: 1, color: '#000', fontWeight: 'bold' }}>
                      بسته‌های کوچک: ۱۰ عدد
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#000', fontWeight: 'bold' }}>
                      بسته‌بندی‌های کوچک: ۱۰ عدد
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '0 0 30%', sm: '0 0 30%' }, display: 'flex', justifyContent: 'center' }}>
                  <Image
                    src="/images/small-cube.svg"
                    alt="بسته و بسته‌بندی کوچک"
                    width={100}
                    height={100}
                    style={{ borderRadius: '8px', objectFit: 'contain' }}
                  />
                </Box>
              </Box>

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
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>نوع مرسوله</Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>چابار</Typography>
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
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                    مجموع مبلغ
                  </Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                    ۳۰,۰۰۰ تومان
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
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                    فرستنده: محمدرضا هرندی
                  </Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                    موبایل: ۰۹۱۲۵۹۴۹۵۱۴
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
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                    جمع‌آورنده: رضا محمدی
                  </Typography>
                  <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                    موبایل: ۰۹۱۲۵۹۴۹۵۱۴
                  </Typography>
                </Box>
              </Box>

              {/* لیست عکس‌های بارگذاری‌شده */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px', mb: 2 }}>
                  لیست عکس‌های بارگذاری‌شده
                </Typography>

                {/* عکس‌ها */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      backgroundColor: '#FBFBFB',
                      borderRadius: '20px',
                      p: 3,
                      minWidth: '80px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '16px' }}>عکس ۱</Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: '#FBFBFB',
                      borderRadius: '20px',
                      p: 3,
                      minWidth: '80px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '16px' }}>عکس ۲</Typography>
                  </Box>
                </Box>

                {/* دکمه ایجاد عکس */}
                <Button
                  sx={{
                    backgroundColor: '#FBFBFB',
                    color: '#000',
                    borderRadius: '20px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    mb: 2,
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                >
                  📁 ایجاد عکس
                </Button>
              </Box>

              {/* دکمه‌های پایین */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                {/* دکمه تماس با جمع‌آوری */}
                <Button
                  sx={{
                    backgroundColor: '#FBFBFB',
                    color: '#000',
                    borderRadius: '20px',
                    py: 2,
                    fontWeight: 'bold',
                    fontSize: '16px',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                >
                  📞 تماس با جمع‌آوری
                </Button>

                {/* دکمه لینک پیگیری */}
                <Button
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    borderRadius: '20px',
                    py: 2,
                    fontWeight: 'bold',
                    fontSize: '16px',
                    '&:hover': {
                      backgroundColor: '#45A049',
                    },
                  }}
                >
                  🔗 لینک پیگیری
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <CustomBottomNavigation />
      </Box>
    </AppFrame>
  );
}