import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Snackbar,
  Alert,
  Avatar,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PhotoCamera } from '@mui/icons-material';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import { getProfile, updateProfile} from '@/services/auth';
import styles from '../components/feature/styles/Home.module.css';
import { CustomerType, ProfileResponse } from '@/types/auth';

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
  const [customerType, setCustomerType] = useState<CustomerType>('individual');
  const [companyName, setCompanyName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // بعد از ثبت‌نام با welcome=1 وارد این صفحه می‌شویم
  const isWelcome = searchParams?.get('welcome') === '1';

  // دریافت داده‌های اولیه پروفایل
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
        setFirstName(response.data.profile.first_name);
        setLastName(response.data.profile.last_name);
        const savedCompanyName = response.data.profile.company_name || '';
        setCompanyName(savedCompanyName);
        setCustomerType(
          response.data.profile.customer_type || (savedCompanyName ? 'company' : 'individual')
        );
        setMobile(response.data.profile.mobile);
        setProfileImage(response.data.profile.profile_image || null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در دریافت اطلاعات پروفایل');
        setOpenSnackbar(true);
      }
    };

    fetchProfile();
  }, []);

  // مدیریت ذخیره پروفایل
  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !mobile) {
      setError('لطفاً تمام فیلدها را پر کنید');
      setOpenSnackbar(true);
      return;
    }

    if (customerType === 'company' && !companyName.trim()) {
      setError('برای حساب شرکتی وارد کردن نام شرکت الزامی است');
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
      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('customer_type', customerType);
      formData.append('company_name', customerType === 'company' ? companyName.trim() : '');
      formData.append('mobile', mobile);
      if (profileImageFile) {
        formData.append('profile_image', profileImageFile);
      }

      await updateProfile(formData);
      router.push(isWelcome ? '/home' : '/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در به‌روزرسانی پروفایل');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری انتخاب کنید');
      setOpenSnackbar(true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
      setOpenSnackbar(true);
      return;
    }

    setProfileImageFile(file);
    setProfileImage(URL.createObjectURL(file));
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
        <ProfileCard >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Avatar
              src={profileImage || undefined}
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
              {`${firstName.charAt(0)}${lastName.charAt(0)}` || 'ت'}
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
              {isWelcome
                ? 'خوش آمدید! لطفاً حساب کاربری خود را تکمیل کنید.'
                : profile
                ? `${profile.profile.first_name} ${profile.profile.last_name} عزیز خوش آمدید`
                : 'در حال بارگذاری...'}
            </Typography>
          </CardContent>
        </ProfileCard>

        {/* Profile Edit Form */}
        <Box sx={{ px: 2, mt: 2 }}>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel
              component="legend"
              sx={{
                mb: 1.25,
                color: '#222',
                fontWeight: 700,
                fontFamily: 'IranYekan, sans-serif',
                '&.Mui-focused': { color: '#00784a' },
              }}
            >
              نوع حساب <span style={{ color: '#d32f2f' }}>*</span>
            </FormLabel>
            <RadioGroup
              row
              value={customerType}
              onChange={(event) => setCustomerType(event.target.value as CustomerType)}
              sx={{ gap: 1, flexWrap: 'wrap' }}
            >
              <FormControlLabel
                value="individual"
                control={<Radio sx={{ color: '#8aa1bc', '&.Mui-checked': { color: '#00784a' } }} />}
                label="کاربر خانگی"
                disabled={isLoading}
                sx={{
                  m: 0,
                  px: 1.5,
                  py: 0.75,
                  border: customerType === 'individual' ? '1px solid #00784a' : '1px solid #d8dee5',
                  borderRadius: 2,
                  backgroundColor: customerType === 'individual' ? '#eefaf5' : '#fff',
                  '& .MuiFormControlLabel-label': { fontFamily: 'IranYekan, sans-serif', fontSize: 14 },
                }}
              />
              <FormControlLabel
                value="company"
                control={<Radio sx={{ color: '#8aa1bc', '&.Mui-checked': { color: '#00784a' } }} />}
                label="شرکت"
                disabled={isLoading}
                sx={{
                  m: 0,
                  px: 1.5,
                  py: 0.75,
                  border: customerType === 'company' ? '1px solid #00784a' : '1px solid #d8dee5',
                  borderRadius: 2,
                  backgroundColor: customerType === 'company' ? '#eefaf5' : '#fff',
                  '& .MuiFormControlLabel-label': { fontFamily: 'IranYekan, sans-serif', fontSize: 14 },
                }}
              />
            </RadioGroup>
            <Typography
              variant="caption"
              sx={{ mt: 1, color: '#6b7280', fontFamily: 'IranYekan, sans-serif' }}
            >
              اگر سفارش به نام شرکت ثبت می‌شود، گزینه «شرکت» را انتخاب کنید.
            </Typography>
          </FormControl>

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
          {customerType === 'company' && (
            <>
              <Typography sx={{ mb: 2, fontSize: '14px', fontFamily: 'IranYekan, sans-serif' }}>
                * نام شرکت
              </Typography>
              <TextField
                fullWidth
                required
                label="نام شرکت"
                variant="outlined"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                error={!companyName.trim()}
                helperText={!companyName.trim() ? 'برای حساب شرکتی وارد کردن نام شرکت الزامی است.' : ''}
                sx={{
                  mb: 2,
                  direction: 'rtl',
                  '& .MuiFormHelperText-root': {
                    fontFamily: 'IranYekan, sans-serif',
                    fontSize: '12px',
                    textAlign: 'right',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderRadius: '16px' },
                    '&:hover fieldset': { borderRadius: '16px' },
                    '&.Mui-focused fieldset': { borderRadius: '16px' },
                  },
                }}
              />
            </>
          )}
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

          <Box
            sx={{
              mt: 1,
              mb: 3,
              p: 2,
              borderRadius: 3,
              border: '1px solid #d8dee5',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              src={profileImage || undefined}
              alt="تصویر پروفایل"
              sx={{ width: 56, height: 56, bgcolor: '#eefaf5', color: '#00784a' }}
            >
              <PhotoCamera />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: 'IranYekan, sans-serif' }}>
                تصویر پروفایل <span style={{ color: '#6b7280', fontWeight: 400 }}>(اختیاری)</span>
              </Typography>
              <Typography sx={{ color: '#6b7280', fontSize: 12, mt: 0.5, fontFamily: 'IranYekan, sans-serif' }}>
                جمع‌آورنده هم می‌تواند تصویرش را برای نمایش به مشتری بارگذاری کند.
              </Typography>
            </Box>
            <Button
              component="label"
              variant="outlined"
              disabled={isLoading}
              sx={{
                borderColor: '#00784a',
                color: '#00784a',
                borderRadius: 2,
                minWidth: 88,
                fontFamily: 'IranYekan, sans-serif',
              }}
            >
              انتخاب
              <input hidden accept="image/*" type="file" onChange={handleProfileImageChange} />
            </Button>
          </Box>
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
