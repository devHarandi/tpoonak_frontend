import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import Header from '@/components/common/Header';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import AppFrame from '@/components/common/AppFrame';
import { getAllTransactions, getUsers } from '@/services/user';
import { GetAllTransactionsResponse, User } from '@/types/user';
import PersianDate from 'persian-date';
import { AccountBalance } from '@mui/icons-material';

// تابع برای تبدیل تاریخ به شمسی
const formatPersianDate = (dateStr: string): string => {
  try {
    const date = new PersianDate(new Date(dateStr));
    return date.format('D MMMM YYYY HH:mm'); // مثلاً: ۱۷ تیر ۱۴۰۴ ۱۵:۴۰
  } catch {
    return dateStr;
  }
};

export default function Transactions() {
  const [transactionsResponse, setTransactionsResponse] = useState<GetAllTransactionsResponse['data'] | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // بارگذاری تراکنش‌ها و کاربران
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [transactionsResponse, usersResponse] = await Promise.all([
          getAllTransactions(),
          getUsers()
        ]);
        setTransactionsResponse(transactionsResponse.data);
        setUsers(usersResponse.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setSnackbar({ open: true, message: 'شما اجازه انجام این دستور را ندارید.', severity: 'error' });
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در بارگذاری تراکنش‌ها', severity: 'error' });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // مدیریت بستن Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // نام نمایشی کاربر
  const getDisplayName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    if (!user) return 'کاربر سیستم';
    const { first_name, last_name } = user.profile;
    return first_name || last_name ? `${first_name} ${last_name}`.trim() : 'کاربر سیستم';
  };

  if (isLoading) {
    return (
      <AppFrame>
        <Header title="تیپاکس پونک - همه تراکنش‌ها" />
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
      <Header title="تیپاکس پونک - همه تراکنش‌ها" />
      
      <Box sx={{
        textAlign: 'right',
        minHeight: '100%',
        overflowY: 'auto',
        pb: 10,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        direction: 'rtl',
        pt: 2,
        pr: 2,
        pl: 2,
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'IranYekan, sans-serif',
            color: '#00784a',
            fontWeight: 'bold',
            textAlign: 'right',
            mb: 3
          }}
        >
          لیست همه تراکنش‌ها
        </Typography>
        <Typography 
          sx={{ 
            fontFamily: 'IranYekan, sans-serif',
            color: '#00784a',
            fontWeight: 'bold',
            textAlign: 'right',
            mb: 3
          }}
        >
          مجموع بدهی: {transactionsResponse?.total_debt ? Number(transactionsResponse.total_debt).toLocaleString('fa-IR') : '0'} تومان
        </Typography>

        {transactionsResponse?.transactions.length === 0 ? (
          <Typography sx={{ textAlign: 'right', fontFamily: 'IranYekan, sans-serif', color: '#00784a' }}>
            تراکنشی یافت نشد
          </Typography>
        ) : (
          transactionsResponse?.transactions.map((transaction) => (
            <Card
              key={transaction.id}
              elevation={8}
              sx={{
                borderRadius: 4,
                background: 'linear-gradient(180deg,rgb(108, 124, 139) 0%, #00784a 100%)',
                color: 'white',
                mb: 3,
                overflow: 'visible',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', fontWeight: 'bold', textAlign: 'right' }}>
                      شناسه تراکنش: #{transaction.id}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', textAlign: 'right' }}>
                      {formatPersianDate(transaction.created_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', textAlign: 'right' }}>
                      کاربر: {getDisplayName(transaction.wallet_balance.user)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance sx={{ color: transaction.wallet_balance.role.name === 'Customer' ? '#4caf50' : transaction.wallet_balance.role.name === 'Collector' ? '#fbd700' : '#00784a', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', textAlign: 'right' }}>
                      نقش: {transaction.wallet_balance.role.name === 'Customer' ? 'مشتری' : transaction.wallet_balance.role.name === 'Collector' ? 'حمل‌کننده' : 'ادمین'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', fontWeight: 'bold', textAlign: 'right' }}>
                      مبلغ: {Number(transaction.amount).toLocaleString('fa-IR')} تومان
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', textAlign: 'right' }}>
                      نوع تراکنش: {transaction.transaction_type === 'deposit' ? 'واریز' : 'پرداخت'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', textAlign: 'right' }}>
                      توضیحات: {transaction.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#fff', textAlign: 'right' }}>
                      موجودی کیف پول: {Number(transaction.wallet_balance.balance).toLocaleString('fa-IR')} تومان
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      <CustomBottomNavigation />

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
    </AppFrame>
  );
}