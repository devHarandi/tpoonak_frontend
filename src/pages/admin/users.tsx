import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { Add, Person, Phone, AccountBalance, Payment, Receipt, Search } from '@mui/icons-material';
import Header from '@/components/common/Header';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import AppFrame from '@/components/common/AppFrame';
import { getUsers, getRoles, createUser, assignRole, removeRole, settleBalance } from '@/services/user';
import { User, Role, CreateUserRequest, AssignRoleRequest, RemoveRoleRequest, SettleBalanceRequest } from '@/types/user';
import { CustomerType } from '@/types/auth';
import PersianDate from 'persian-date';

// تابع برای تبدیل تاریخ به شمسی
const formatPersianDate = (dateStr: string) => {
  try {
    const date = new PersianDate(new Date(dateStr));
    return date.format('D MMMM YYYY'); // مثلاً: سوم خرداد ۱۴۰۴
  } catch {
    return dateStr; // در صورت خطا، تاریخ اصلی
  }
};

const getRoleLabel = (roleName: string) => {
  if (roleName === 'Customer') return 'مشتری';
  if (roleName === 'Collector') return 'حمل‌کننده';
  if (roleName === 'Operator') return 'اپراتور';
  if (roleName === 'Admin') return 'مدیر سیستم';
  return roleName;
};

const getRoleColor = (roleName: string) => {
  if (roleName === 'Customer') return '#4caf50';
  if (roleName === 'Collector') return '#fbd700';
  if (roleName === 'Operator' || roleName === 'Admin') return '#315ea8';
  return '#00784a';
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [openAssignDialog, setOpenAssignDialog] = useState<boolean>(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<boolean>(false);
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openSettleDialog, setOpenSettleDialog] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    mobile: '',
    first_name: '',
    last_name: '',
    customer_type: 'individual',
    company_name: '',
    role_ids: [],
  });
  const [settleData, setSettleData] = useState<SettleBalanceRequest>({ user_id: 0, role_id: 0, amount: 0, description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const router = useRouter();

  // جست‌وجو با تأخیر کوتاه تا برای هر کلید یک درخواست به سرور ارسال نشود.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearchQuery(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // بارگذاری فقط صفحه‌ی جاری کاربران و نقش‌ها
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersResponse, rolesResponse] = await Promise.all([
          getUsers({ search: searchQuery, page: page + 1, pageSize }),
          getRoles(),
        ]);
        setUsers(usersResponse.data);
        setTotalUsers(usersResponse.pagination?.total_count ?? usersResponse.data.length);
        setRoles(rolesResponse.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setSnackbar({ open: true, message: 'شما اجازه انجام این دستور را ندارید.', severity: 'error' });
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در بارگذاری داده‌ها', severity: 'error' });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, searchQuery, router]);

  const refreshUsers = async () => {
    const response = await getUsers({ search: searchQuery, page: page + 1, pageSize });
    setUsers(response.data);
    setTotalUsers(response.pagination?.total_count ?? response.data.length);
  };

  // مدیریت بستن Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // هندلر باز کردن مدال‌ها
  const handleOpenAssignDialog = (userId: number) => {
    setSelectedUserId(userId);
    setSelectedRoleId(null);
    setOpenAssignDialog(true);
  };

  const handleOpenRemoveDialog = (userId: number, roleId: number) => {
    setSelectedUserId(userId);
    setSelectedRoleId(roleId);
    setOpenRemoveDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setNewUser({
      mobile: '',
      first_name: '',
      last_name: '',
      customer_type: 'individual',
      company_name: '',
      role_ids: [],
    });
    setOpenCreateDialog(true);
  };

  const handleOpenSettleDialog = (userId: number, roleId: number) => {
    setSelectedUserId(userId);
    setSelectedRoleId(roleId);
    setSettleData({ user_id: userId, role_id: roleId, amount: 0, description: '' });
    setOpenSettleDialog(true);
  };

  // هندلر هدایت به صفحه تراکنش‌ها
  const handleViewTransactions = (userId: number) => {
    router.push(`/admin/users/${userId}/transactions`);
  };

  // مدیریت بستن مدال‌ها
  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedUserId(null);
    setSelectedRoleId(null);
  };

  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setSelectedUserId(null);
    setSelectedRoleId(null);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewUser({
      mobile: '',
      first_name: '',
      last_name: '',
      customer_type: 'individual',
      company_name: '',
      role_ids: [],
    });
  };

  const handleCloseSettleDialog = () => {
    setOpenSettleDialog(false);
    setSelectedUserId(null);
    setSelectedRoleId(null);
    setSettleData({ user_id: 0, role_id: 0, amount: 0, description: '' });
  };

  // هندلر تخصیص نقش
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return;

    try {
      setIsLoading(true);
      const response = await assignRole({ user_id: selectedUserId, role_id: selectedRoleId });
      await refreshUsers();
      setSnackbar({
        open: true,
        message: `نقش "${getRoleLabel(roles.find(r => r.id === selectedRoleId)?.name || '')}" با موفقیت اضافه شد`,
        severity: 'success'
      });
      handleCloseAssignDialog();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setSnackbar({ open: true, message: 'شما اجازه انجام این دستور را ندارید.', severity: 'error' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در تخصیص نقش', severity: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر حذف نقش
  const handleRemoveRole = async () => {
    if (!selectedUserId || !selectedRoleId) return;

    try {
      setIsLoading(true);
      const response = await removeRole({ user_id: selectedUserId, role_id: selectedRoleId });
      await refreshUsers();
      setSnackbar({
        open: true,
        message: `نقش "${getRoleLabel(roles.find(r => r.id === selectedRoleId)?.name || '')}" با موفقیت حذف شد`,
        severity: 'success'
      });
      handleCloseRemoveDialog();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setSnackbar({ open: true, message: 'شما اجازه انجام این دستور را ندارید.', severity: 'error' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در حذف نقش', severity: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر ایجاد کاربر
  const handleCreateUser = async () => {
    if (!newUser.mobile || !newUser.first_name || !newUser.last_name || newUser.role_ids.length === 0) {
      setSnackbar({ open: true, message: 'لطفاً تمام فیلدها را پر کنید', severity: 'error' });
      return;
    }

    if (newUser.customer_type === 'company' && !newUser.company_name?.trim()) {
      setSnackbar({ open: true, message: 'برای حساب شرکتی وارد کردن نام شرکت الزامی است', severity: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await createUser(newUser);
      await refreshUsers();
      setSnackbar({ open: true, message: 'کاربر با موفقیت ایجاد شد', severity: 'success' });
      handleCloseCreateDialog();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setSnackbar({ open: true, message: 'شما اجازه انجام این دستور را ندارید.', severity: 'error' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در ایجاد کاربر', severity: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر تخصیص مبلغ
  const handleSettleBalance = async () => {
    if (!settleData.user_id || !settleData.role_id || settleData.amount <= 0) {
      setSnackbar({ open: true, message: 'لطفاً مبلغ معتبر وارد کنید', severity: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await settleBalance(settleData);
      await refreshUsers();
      setSnackbar({
        open: true,
        message: `مبلغ ${settleData.amount.toLocaleString('fa-IR')} تومان با موفقیت تخصیص یافت`,
        severity: 'success'
      });
      handleCloseSettleDialog();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setSnackbar({ open: true, message: 'شما اجازه انجام این دستور را ندارید.', severity: 'error' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setSnackbar({ open: true, message: err.response?.data?.message || 'خطا در تخصیص مبلغ', severity: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // دریافت نقش‌های موجود برای کاربر
  const getAvailableRolesForUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return roles.filter(role => !user?.profile.roles.some(r => r.id === role.id));
  };

  // نام نمایشی کاربر
  const getDisplayName = (user: User): string => {
    const { first_name, last_name } = user.profile;
    return first_name || last_name ? `${first_name} ${last_name}`.trim() : 'کاربر سیستم';
  };

  if (isLoading) {
    return (
      <AppFrame>
        <Header title="تیپاکس پونک - کاربران" />
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
      <Header title="تیپاکس پونک - کاربران" />
      
      <Box sx={{
          textAlign: 'right',
          minHeight: 'calc(100dvh - 68px)',
          overflowY: 'auto',
          pb: 14,
          pr:2,
          pl:2,
          pt:2.5,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'transparent',
          direction: 'rtl',
        }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, p: 1.5, bgcolor: '#fff', border: '1px solid #e1eae5', borderRadius: '16px', gap: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              color: '#08784f',
              fontWeight: 'bold',
              textAlign: 'right'
            }}
          >
            لیست کاربران سیستم
          </Typography>
          <Button
            onClick={handleOpenCreateDialog}
            variant="contained"
            sx={{
              backgroundColor: '#08784f',
              color: '#fff',
              fontFamily: 'IranYekan, sans-serif',
              borderRadius: '12px',
              '&:hover': { backgroundColor: '#075c3e' }
            }}
          >
            افزودن کاربر
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: '#fff', border: '1px solid #e1eae5', borderRadius: '16px' }}>
          <TextField
            fullWidth
            size="small"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="جست‌وجوی نام، شماره موبایل، شرکت یا نقش"
            sx={{ '& input': { fontFamily: 'IranYekan, sans-serif', textAlign: 'right' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: '#82958a' }} /></InputAdornment>,
            }}
          />
          <Typography sx={{ minWidth: 105, color: '#65746c', fontSize: 13, fontFamily: 'IranYekan, sans-serif', whiteSpace: 'nowrap' }}>
            {totalUsers.toLocaleString('fa-IR')} کاربر
          </Typography>
        </Box>

        {users.length === 0 ? (
          <Typography sx={{ textAlign: 'right', fontFamily: 'IranYekan, sans-serif', color: '#00784a' }}>
            {searchQuery ? 'کاربری با این مشخصات یافت نشد' : 'کاربری یافت نشد'}
          </Typography>
        ) : (
          users.map((user) => (
            <Card
              key={user.id}
              elevation={8}
              sx={{
                borderRadius: '22px',
                background: '#fff',
                color: '#17231e',
                mb: 1.5,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header Section - User Info */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    mb: 3,
                    gap: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 1, sm: 2 } }}>
                    <Phone sx={{ color: '#000000', fontSize: 18 }} />
                    <Typography 
                      sx={{ 
                        fontFamily: 'monospace', 
                        color: '#000000',
                        fontSize: '14px',
                        textAlign: 'right'
                      }}
                    >
                      {user.mobile}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '14px', color: '#000000', fontFamily: 'IranYekan, sans-serif' }}>
                     تاریخ ثبت نام : {formatPersianDate(user.profile.created_at)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 2, sm: 1 } }}>
                    <Person sx={{ color: '#000000', fontSize: 20 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'IranYekan, sans-serif', 
                        color: '#000000',
                        fontWeight: 'bold',
                        textAlign: 'right'
                      }}
                    >
                      {getDisplayName(user)}
                    </Typography>
                  </Box>
                </Box>

                {/* Balance Section */}
                <Box 
                  sx={{ 
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    mb: 2,
                    direction: 'rtl'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {user.balances.map((balance, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalance sx={{ color: getRoleColor(balance.role.name), fontSize: 18 }} />
                          <Typography sx={{ fontSize: '14px', fontFamily: 'IranYekan, sans-serif', color: '#000', fontWeight: 'bold', textAlign: 'right' }}>
                            حساب {getRoleLabel(balance.role.name)}: {Number(balance.balance).toLocaleString('fa-IR')} تومان
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={() => handleOpenSettleDialog(user.id, balance.role.id)}
                          sx={{
                            backgroundColor: '#00784a',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              backgroundColor: '#003087',
                            }
                          }}
                        >
                          <Payment sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Roles Section */}
                <Box 
                  sx={{ 
                    backgroundColor: '#FBFBFB',
                    borderRadius: '20px',
                    p: 2,
                    mb: 2,
                    direction: 'rtl'
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontSize: '14px', 
                      fontFamily: 'IranYekan, sans-serif', 
                      color: '#000', 
                      mb: 1.5,
                      fontWeight: 'bold',
                      textAlign: 'right'
                    }}
                  >
                    نقش‌های کاربر:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {user.profile.roles.map((role) => (
                      <Chip
                        key={role.id}
                        label={getRoleLabel(role.name)}
                        onClick={() => handleOpenRemoveDialog(user.id, role.id)}
                        sx={{
                          backgroundColor: getRoleColor(role.name),
                          color: 'white',
                          fontFamily: 'IranYekan, sans-serif',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          height: 28,
                          px: 1,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                    <IconButton
                      onClick={() => handleOpenAssignDialog(user.id)}
                      sx={{
                        backgroundColor: '#00784a',
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: '#003087',
                        }
                      }}
                    >
                      <Add sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Transactions Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    onClick={() => handleViewTransactions(user.id)}
                    variant="contained"
                    sx={{
                      backgroundColor: '#00784a',
                      color: '#fff',
                      fontFamily: 'IranYekan, sans-serif',
                      borderRadius: '8px',
                      '&:hover': { backgroundColor: '#003087' }
                    }}
                  >
                    <Receipt sx={{ fontSize: 18, mr: 1 }} />
                    تراکنش‌ها
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="تعداد در صفحه"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`}
          sx={{ direction: 'ltr', mt: 1, bgcolor: '#fff', border: '1px solid #e1eae5', borderRadius: '14px' }}
        />
      </Box>

      {/* Assign Role Dialog */}
      <Dialog 
        open={openAssignDialog} 
        onClose={handleCloseAssignDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            direction: 'rtl',
            width: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right', fontWeight: 'bold', color: '#00784a' }}>
          اضافه کردن نقش جدید
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: 'IranYekan, sans-serif', color: '#00784a' }}>انتخاب نقش</InputLabel>
            <Select
              value={selectedRoleId || ''}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              label="انتخاب نقش"
              sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right', color: '#00784a' }}
            >
              {selectedUserId && getAvailableRolesForUser(selectedUserId).map((role) => (
                <MenuItem 
                  key={role.id} 
                  value={role.id}
                  sx={{ fontFamily: 'IranYekan, sans-serif', display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}
                >
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: getRoleColor(role.name)
                    }} 
                  />
                  {getRoleLabel(role.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={handleCloseAssignDialog}
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              color: '#fbd700',
              borderColor: '#fbd700',
              '&:hover': { borderColor: '#D32F2F', color: '#D32F2F' }
            }}
            variant="outlined"
          >
            انصراف
          </Button>
          <Button 
            onClick={handleAssignRole}
            variant="contained"
            disabled={!selectedRoleId}
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              backgroundColor: '#00784a',
              '&:hover': { backgroundColor: '#003087' }
            }}
          >
            اضافه کردن
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Role Dialog */}
      <Dialog 
        open={openRemoveDialog} 
        onClose={handleCloseRemoveDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            direction: 'rtl',
            width: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right', fontWeight: 'bold', color: '#00784a' }}>
          حذف نقش
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontFamily: 'IranYekan, sans-serif', color: '#00784a', textAlign: 'right' }}>
            آیا مطمئن هستید که می‌خواهید نقش "{getRoleLabel(roles.find(r => r.id === selectedRoleId)?.name || '')}" را حذف کنید؟
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={handleCloseRemoveDialog}
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              color: '#fbd700',
              borderColor: '#fbd700',
              '&:hover': { borderColor: '#D32F2F', color: '#D32F2F' }
            }}
            variant="outlined"
          >
            خیر
          </Button>
          <Button 
            onClick={handleRemoveRole}
            variant="contained"
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              backgroundColor: '#fbd700',
              '&:hover': { backgroundColor: '#D32F2F' }
            }}
          >
            بله
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            direction: 'rtl',
            width: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right', fontWeight: 'bold', color: '#00784a' }}>
          ایجاد کاربر جدید
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="شماره موبایل"
            value={newUser.mobile}
            onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            fullWidth
            sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right' }}
            InputProps={{ style: { textAlign: 'right' } }}
          />
          <TextField
            label="نام"
            value={newUser.first_name}
            onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
            fullWidth
            sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right' }}
            InputProps={{ style: { textAlign: 'right' } }}
          />
          <TextField
            label="نام خانوادگی"
            value={newUser.last_name}
            onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
            fullWidth
            sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right' }}
            InputProps={{ style: { textAlign: 'right' } }}
          />
          <FormControl component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{ fontFamily: 'IranYekan, sans-serif', color: '#00784a', mb: 0.5 }}
            >
              نوع حساب
            </FormLabel>
            <RadioGroup
              row
              value={newUser.customer_type || 'individual'}
              onChange={(e) => {
                const customerType = e.target.value as CustomerType;
                setNewUser({
                  ...newUser,
                  customer_type: customerType,
                  company_name: customerType === 'company' ? newUser.company_name || '' : '',
                });
              }}
              sx={{ gap: 1, flexWrap: 'wrap' }}
            >
              <FormControlLabel
                value="individual"
                control={<Radio sx={{ color: '#00784a', '&.Mui-checked': { color: '#00784a' } }} />}
                label="کاربر خانگی"
                sx={{ fontFamily: 'IranYekan, sans-serif', m: 0 }}
              />
              <FormControlLabel
                value="company"
                control={<Radio sx={{ color: '#00784a', '&.Mui-checked': { color: '#00784a' } }} />}
                label="شرکت"
                sx={{ fontFamily: 'IranYekan, sans-serif', m: 0 }}
              />
            </RadioGroup>
          </FormControl>
          {newUser.customer_type === 'company' && (
            <TextField
              label="نام شرکت"
              required
              value={newUser.company_name || ''}
              onChange={(e) => setNewUser({ ...newUser, company_name: e.target.value })}
              fullWidth
              sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right' }}
              InputProps={{ style: { textAlign: 'right' } }}
            />
          )}
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: 'IranYekan, sans-serif', color: '#00784a' }}>نقش‌ها</InputLabel>
            <Select
              multiple
              value={newUser.role_ids}
              onChange={(e) => setNewUser({ ...newUser, role_ids: e.target.value as number[] })}
              label="نقش‌ها"
              sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right', color: '#00784a' }}
            >
              {roles.map((role) => (
                <MenuItem 
                  key={role.id} 
                  value={role.id}
                  sx={{ fontFamily: 'IranYekan, sans-serif', display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}
                >
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: getRoleColor(role.name)
                    }} 
                  />
                  {getRoleLabel(role.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={handleCloseCreateDialog}
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              color: '#fbd700',
              borderColor: '#fbd700',
              '&:hover': { borderColor: '#D32F2F', color: '#D32F2F' }
            }}
            variant="outlined"
          >
            انصراف
          </Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained"
            disabled={
              !newUser.mobile ||
              !newUser.first_name ||
              !newUser.last_name ||
              newUser.role_ids.length === 0 ||
              (newUser.customer_type === 'company' && !newUser.company_name?.trim())
            }
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              backgroundColor: '#00784a',
              '&:hover': { backgroundColor: '#003087' }
            }}
          >
            ایجاد
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settle Balance Dialog */}
      <Dialog 
        open={openSettleDialog} 
        onClose={handleCloseSettleDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            direction: 'rtl',
            width: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right', fontWeight: 'bold', color: '#00784a' }}>
          تخصیص مبلغ
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="مبلغ (تومان)"
            type="number"
            value={settleData.amount}
            onChange={(e) => setSettleData({ ...settleData, amount: Number(e.target.value) })}
            fullWidth
            sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right' }}
            InputProps={{ style: { textAlign: 'right' } }}
          />
          <TextField
            label="توضیحات"
            value={settleData.description}
            onChange={(e) => setSettleData({ ...settleData, description: e.target.value })}
            fullWidth
            sx={{ fontFamily: 'IranYekan, sans-serif', textAlign: 'right' }}
            InputProps={{ style: { textAlign: 'right' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={handleCloseSettleDialog}
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              color: '#fbd700',
              borderColor: '#fbd700',
              '&:hover': { borderColor: '#D32F2F', color: '#D32F2F' }
            }}
            variant="outlined"
          >
            انصراف
          </Button>
          <Button 
            onClick={handleSettleBalance}
            variant="contained"
            disabled={!settleData.amount || settleData.amount <= 0}
            sx={{ 
              fontFamily: 'IranYekan, sans-serif',
              backgroundColor: '#00784a',
              '&:hover': { backgroundColor: '#003087' }
            }}
          >
            تأیید
          </Button>
        </DialogActions>
      </Dialog>

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
