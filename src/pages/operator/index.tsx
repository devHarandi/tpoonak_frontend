import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getProfile } from '@/services/auth';
import {
  changeSettingOrder,
  getAllOrders,
  manageOrder,
  settingOrder,
} from '@/services/order';
import { createUser, getRoles, getUsers, getAllTransactions } from '@/services/user';
import { ProfileResponse } from '@/types/auth';
import { ManageOrderRequest, Order, GetSystemSetting } from '@/types/order';
import { Role, Transaction, User } from '@/types/user';
import OperatorLayout, { OperatorSection } from '@/components/operator/OperatorLayout';

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  collected: 'تأیید جمع‌آوری',
  transferred_to_tipax: 'تحویل به پکرو',
  delivered: 'تحویل به شرکت',
  canceled: 'لغو شده',
};

const STATUS_COLORS: Record<string, { background: string; color: string }> = {
  pending: { background: '#fff8df', color: '#8a6900' },
  collected: { background: '#e4f4ec', color: '#08784f' },
  transferred_to_tipax: { background: '#e9f1ff', color: '#315ea8' },
  delivered: { background: '#e6f7f5', color: '#087c72' },
  canceled: { background: '#fff0ef', color: '#b42318' },
};

const NEXT_STATUSES: Record<string, Array<{ value: string; label: string }>> = {
  pending: [
    { value: 'collected', label: 'تأیید جمع‌آوری' },
    { value: 'canceled', label: 'لغو سفارش' },
  ],
  collected: [{ value: 'transferred_to_tipax', label: 'تحویل به پکرو' }],
  transferred_to_tipax: [{ value: 'delivered', label: 'تحویل به شرکت' }],
  delivered: [],
  canceled: [],
};

const isOperatorSection = (value: string | null): value is OperatorSection =>
  value === 'dashboard' ||
  value === 'orders' ||
  value === 'users' ||
  value === 'transactions' ||
  value === 'settings';

const formatMoney = (amount: string | number | null | undefined) => {
  const value = Number(amount || 0);
  return Number.isFinite(value) ? value.toLocaleString('fa-IR') : '۰';
};

const formatDate = (value: string | undefined) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const displayName = (user?: User | null) => {
  if (!user) return 'کاربر سیستم';
  const name = `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
  return name || user.mobile || 'کاربر سیستم';
};

const orderCustomerName = (order: Order) => {
  const name = `${order.user_first_name || ''} ${order.user_last_name || ''}`.trim();
  return name || order.user_mobile || 'کاربر سیستم';
};

const statusLabel = (status: string) => STATUS_LABELS[status] || status || 'نامشخص';

function StatusChip({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || { background: '#eef3f0', color: '#56665e' };
  return (
    <Chip
      size="small"
      label={statusLabel(status)}
      sx={{
        backgroundColor: colors.background,
        color: colors.color,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    />
  );
}

function StatCard({
  title,
  value,
  helper,
  icon,
  accent,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card sx={{ height: '100%', borderRadius: 4 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#74867b', fontSize: 12, fontWeight: 700 }}>{title}</Typography>
            <Typography sx={{ color: '#17231e', fontSize: 28, fontWeight: 900, mt: 0.5 }}>{value}</Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              color: accent,
              backgroundColor: `${accent}18`,
              flex: '0 0 auto',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography sx={{ color: '#8b9b92', fontSize: 11, mt: 2 }}>{helper}</Typography>
      </CardContent>
    </Card>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
      <Box>
        <Typography sx={{ color: '#08784f', fontSize: 11, fontWeight: 800 }}>{eyebrow}</Typography>
        <Typography component="h1" sx={{ color: '#17231e', fontSize: { xs: 22, md: 28 }, fontWeight: 900, mt: 0.5 }}>
          {title}
        </Typography>
        {description && <Typography sx={{ color: '#718278', fontSize: 12, mt: 0.7 }}>{description}</Typography>}
      </Box>
      {action}
    </Box>
  );
}

function OrdersTable({
  orders,
  onOpen,
  compact = false,
}: {
  orders: Order[];
  onOpen: (order: Order) => void;
  compact?: boolean;
}) {
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid #deebe3', borderRadius: 3, boxShadow: 'none' }}>
      <Table size="small" sx={{ minWidth: compact ? 760 : 980 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f7faf8' }}>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>سفارش</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>مشتری</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>نوع حمل</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>وضعیت</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>مبلغ</TableCell>
            {!compact && <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>آخرین تغییر</TableCell>}
            <TableCell align="center" sx={{ fontWeight: 900, color: '#63766b' }}>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={compact ? 6 : 7} align="center" sx={{ py: 5, color: '#84958b' }}>
                سفارشی با این مشخصات پیدا نشد.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography sx={{ color: '#17231e', fontWeight: 900, fontSize: 13 }}>#{order.id}</Typography>
                  <Typography sx={{ color: '#8b9b92', fontSize: 11, mt: 0.3 }}>{formatDate(order.created_at)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: '#34483e', fontWeight: 800, fontSize: 13 }}>{orderCustomerName(order)}</Typography>
                  {order.user_company_name && (
                    <Typography sx={{ color: '#08784f', fontSize: 11, mt: 0.3 }}>{order.user_company_name}</Typography>
                  )}
                  <Typography dir="ltr" sx={{ color: '#8b9b92', fontSize: 11, mt: 0.3, textAlign: 'right' }}>{order.user_mobile}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: '#34483e', fontSize: 12, fontWeight: 700 }}>{order.vehicle_type_name || '—'}</Typography>
                  <Typography sx={{ color: '#8b9b92', fontSize: 11, mt: 0.3 }}>{order.total_quantity || 0} بسته</Typography>
                </TableCell>
                <TableCell><StatusChip status={order.status} /></TableCell>
                <TableCell>
                  <Typography sx={{ color: '#08784f', fontWeight: 900, fontSize: 13 }}>{formatMoney(order.total_amount)} تومان</Typography>
                </TableCell>
                {!compact && <TableCell sx={{ color: '#718278', fontSize: 12 }}>{formatDate(order.updated_at)}</TableCell>}
                <TableCell align="center">
                  <Tooltip title="مشاهده و مدیریت">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onOpen(order)}
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 17 }} />}
                      sx={{ borderColor: '#b9d7c7', color: '#08784f', minWidth: 118, whiteSpace: 'nowrap' }}
                    >
                      جزئیات
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function UsersTable({
  users,
  onTransactions,
}: {
  users: User[];
  onTransactions: (user: User) => void;
}) {
  const roleTitle = (role: string) => {
    if (role === 'Customer') return 'مشتری';
    if (role === 'Collector') return 'جمع‌آوری‌کننده';
    if (role === 'Operator') return 'اپراتور';
    if (role === 'Admin') return 'مدیر سیستم';
    return role;
  };

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid #deebe3', borderRadius: 3, boxShadow: 'none' }}>
      <Table size="small" sx={{ minWidth: 950 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f7faf8' }}>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>کاربر</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>شماره موبایل</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>نوع حساب</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>نقش‌ها</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>موجودی کل</TableCell>
            <TableCell align="center" sx={{ fontWeight: 900, color: '#63766b' }}>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: '#84958b' }}>کاربری با این مشخصات پیدا نشد.</TableCell></TableRow>
          ) : users.map((user) => {
            const balance = user.balances.reduce((sum, item) => sum + Number(item.balance || 0), 0);
            return (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={user.profile.profile_image || undefined} sx={{ width: 34, height: 34, bgcolor: '#e6f4ee', color: '#08784f', fontSize: 13, fontWeight: 900 }}>
                      {displayName(user).charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: '#34483e', fontWeight: 800, fontSize: 13 }}>{displayName(user)}</Typography>
                      {user.profile.company_name && <Typography sx={{ color: '#08784f', fontSize: 11 }}>{user.profile.company_name}</Typography>}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell dir="ltr" sx={{ textAlign: 'right', color: '#63766b', fontSize: 13 }}>{user.mobile}</TableCell>
                <TableCell>
                  <Chip size="small" label={user.profile.customer_type === 'company' ? 'شرکتی' : 'خانگی'} sx={{ backgroundColor: user.profile.customer_type === 'company' ? '#e9f1ff' : '#f2f5f3', color: user.profile.customer_type === 'company' ? '#315ea8' : '#63766b', fontWeight: 800 }} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {user.profile.roles.map((role) => <Chip key={role.id} size="small" label={roleTitle(role.name)} sx={{ backgroundColor: '#eef7f2', color: '#08784f', fontSize: 11 }} />)}
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: balance < 0 ? '#b42318' : '#08784f', fontWeight: 900 }}>{formatMoney(balance)} تومان</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" onClick={() => onTransactions(user)} sx={{ borderColor: '#d0ded6', color: '#506159', whiteSpace: 'nowrap' }}>تراکنش‌ها</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TransactionsTable({ transactions, users }: { transactions: Transaction[]; users: User[] }) {
  const transactionTitle = (type: string) => {
    if (type === 'deposit') return 'واریز';
    if (type === 'withdraw') return 'برداشت';
    if (type === 'payment') return 'پرداخت';
    return type;
  };
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid #deebe3', borderRadius: 3, boxShadow: 'none' }}>
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f7faf8' }}>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>شناسه</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>کاربر</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>نقش کیف پول</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>نوع</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>مبلغ</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>تاریخ</TableCell>
            <TableCell sx={{ fontWeight: 900, color: '#63766b' }}>توضیح</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: '#84958b' }}>تراکنشی با این مشخصات پیدا نشد.</TableCell></TableRow>
          ) : transactions.map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell sx={{ color: '#34483e', fontWeight: 800 }}>#{transaction.id}</TableCell>
              <TableCell sx={{ color: '#506159', fontSize: 12 }}>{displayName(users.find((user) => user.id === transaction.wallet_balance.user))}</TableCell>
              <TableCell><Chip size="small" label={transaction.wallet_balance.role.name === 'Customer' ? 'مشتری' : transaction.wallet_balance.role.name === 'Collector' ? 'جمع‌آوری‌کننده' : transaction.wallet_balance.role.name} sx={{ backgroundColor: '#eef7f2', color: '#08784f', fontSize: 11 }} /></TableCell>
              <TableCell sx={{ color: '#63766b' }}>{transactionTitle(transaction.transaction_type)}</TableCell>
              <TableCell sx={{ color: Number(transaction.amount) < 0 ? '#b42318' : '#08784f', fontWeight: 900 }}>{formatMoney(transaction.amount)} تومان</TableCell>
              <TableCell sx={{ color: '#718278', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(transaction.created_at)}</TableCell>
              <TableCell sx={{ color: '#718278', fontSize: 12, maxWidth: 230 }}>{transaction.description || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function OperatorPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySection = searchParams?.get('section') || null;
  const [activeSection, setActiveSection] = useState<OperatorSection>('dashboard');
  const [profile, setProfile] = useState<ProfileResponse['data'] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalDebt, setTotalDebt] = useState('0');
  const [systemSettings, setSystemSettings] = useState<GetSystemSetting['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [transactionQuery, setTransactionQuery] = useState('');
  const [orderPage, setOrderPage] = useState(0);
  const [orderRowsPerPage, setOrderRowsPerPage] = useState(10);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionRowsPerPage, setTransactionRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCarrierId, setSelectedCarrierId] = useState<number | ''>('');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    customer_type: 'individual' as 'individual' | 'company',
    company_name: '',
    role: 'Customer' as 'Customer' | 'Collector',
  });

  useEffect(() => {
    if (isOperatorSection(querySection)) setActiveSection(querySection);
  }, [querySection]);

  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      const profileResponse = await getProfile();
      const profileData = profileResponse.data;
      const hasAccess = profileData.profile.roles.some(
        (role) => role.name === 'Operator' || role.name === 'Admin'
      );
      if (!hasAccess) {
        setAccessDenied(true);
        return;
      }
      setProfile(profileData);

      const [ordersResult, usersResult, transactionsResult, settingsResult, rolesResult] = await Promise.allSettled([
        getAllOrders(),
        getUsers(),
        getAllTransactions(),
        settingOrder(),
        getRoles(),
      ]);

      if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value.data);
      if (usersResult.status === 'fulfilled') setUsers(usersResult.value.data);
      if (transactionsResult.status === 'fulfilled') {
        setTransactions(transactionsResult.value.data.transactions);
        setTotalDebt(transactionsResult.value.data.total_debt);
      }
      if (settingsResult.status === 'fulfilled') setSystemSettings(settingsResult.value.data);
      if (rolesResult.status === 'fulfilled') setRoles(rolesResult.value.data);

      const failed = [ordersResult, usersResult, transactionsResult].some((result) => result.status === 'rejected');
      if (failed) setError('بخشی از اطلاعات پنل دریافت نشد. اتصال API و دسترسی اپراتور را بررسی کنید.');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAccessDenied(true);
      } else {
        setError(err.response?.data?.message || 'خطا در دریافت اطلاعات پنل عملیات.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const carriers = useMemo(
    () => users.filter((user) => user.profile.roles.some((role) => role.name === 'Collector')),
    [users]
  );

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const carrierName = order.carrier ? `${order.carrier.first_name || ''} ${order.carrier.last_name || ''}` : '';
      return [
        String(order.id),
        orderCustomerName(order),
        order.user_mobile,
        order.user_company_name,
        order.vehicle_type_name,
        carrierName,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [orders, orderQuery, orderStatusFilter]);

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const roleNames = user.profile.roles.map((role) => role.name).join(' ');
      return [displayName(user), user.mobile, user.profile.company_name, roleNames]
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [users, userQuery]);

  const filteredTransactions = useMemo(() => {
    const query = transactionQuery.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((transaction) => {
      const user = users.find((item) => item.id === transaction.wallet_balance.user);
      return [
        String(transaction.id),
        transaction.description,
        transaction.transaction_type,
        transaction.wallet_balance.role.name,
        user ? displayName(user) : '',
        user?.mobile || '',
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [transactions, transactionQuery, users]);

  const stats = useMemo(() => ({
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    activeOrders: orders.filter((order) => ['collected', 'transferred_to_tipax'].includes(order.status)).length,
    totalUsers: users.length,
  }), [orders, users]);

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus('');
    setSelectedCarrierId(order.carrier?.id || '');
    setOrderDialogOpen(true);
  };

  const closeOrder = () => {
    setOrderDialogOpen(false);
    setSelectedOrder(null);
    setSelectedStatus('');
    setSelectedCarrierId('');
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;
    const originalCarrierId = selectedOrder.carrier?.id || '';
    const payload: ManageOrderRequest = {};
    if (selectedCarrierId !== originalCarrierId) payload.carrier_id = selectedCarrierId || null;
    if (selectedStatus) payload.status = selectedStatus;
    if (!payload.status && payload.carrier_id === undefined) {
      setError('تغییری برای ذخیره انتخاب نشده است.');
      return;
    }

    try {
      setIsSaving(true);
      await manageOrder(selectedOrder.id, payload);
      const ordersResponse = await getAllOrders();
      setOrders(ordersResponse.data);
      setNotice('سفارش با موفقیت به‌روزرسانی شد.');
      closeOrder();
    } catch (err: any) {
      setError(err.response?.data?.message || 'به‌روزرسانی سفارش انجام نشد.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!/^09\d{9}$/.test(newUser.mobile) || !newUser.first_name.trim() || !newUser.last_name.trim()) {
      setError('نام، نام خانوادگی و شماره موبایل معتبر را وارد کنید.');
      return;
    }
    if (newUser.customer_type === 'company' && !newUser.company_name.trim()) {
      setError('برای حساب شرکتی نام شرکت الزامی است.');
      return;
    }
    const roleId = roles.find((role) => role.name === newUser.role)?.id;
    if (!roleId) {
      setError('نقش‌های سیستم دریافت نشده‌اند. صفحه را تازه‌سازی کنید.');
      return;
    }
    try {
      setIsSaving(true);
      await createUser({
        mobile: newUser.mobile,
        first_name: newUser.first_name.trim(),
        last_name: newUser.last_name.trim(),
        customer_type: newUser.customer_type,
        company_name: newUser.customer_type === 'company' ? newUser.company_name.trim() : '',
        role_ids: [roleId],
      });
      const usersResponse = await getUsers();
      setUsers(usersResponse.data);
      setNotice('کاربر جدید با موفقیت ایجاد شد.');
      setCreateDialogOpen(false);
      setNewUser({ mobile: '', first_name: '', last_name: '', customer_type: 'individual', company_name: '', role: 'Customer' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'ایجاد کاربر انجام نشد.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const canCreate = event.target.checked;
    try {
      setIsSaving(true);
      const response = await changeSettingOrder({ can_create_order: canCreate });
      setSystemSettings((current) => current ? { ...current, can_create_order: response.data.can_create_order } : current);
      setNotice(canCreate ? 'ثبت سفارش برای کاربران فعال شد.' : 'ثبت سفارش برای کاربران متوقف شد.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'تغییر تنظیمات انجام نشد.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserTransactions = (user: User) => {
    setTransactionQuery(user.mobile);
    setTransactionPage(0);
    setActiveSection('transactions');
    router.push('/operator/?section=transactions');
  };

  const renderDashboard = () => (
    <>
      <SectionHeading
        eyebrow="مرکز کنترل"
        title="صبح بخیر، عملیات آماده است"
        description="وضعیت لحظه‌ای سفارش‌ها، مشتریان و جریان مالی را در یک نگاه ببینید."
        action={<Button variant="outlined" onClick={() => loadData(true)} disabled={isRefreshing} startIcon={<RefreshRoundedIcon />} sx={{ borderColor: '#b9d7c7', color: '#08784f' }}>{isRefreshing ? 'در حال بروزرسانی' : 'بروزرسانی داده‌ها'}</Button>}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2.5 }}>
        <StatCard title="کل سفارش‌ها" value={formatMoney(stats.totalOrders)} helper="تمام سفارش‌های ثبت‌شده" icon={<LocalShippingOutlinedIcon />} accent="#08784f" />
        <StatCard title="در انتظار اقدام" value={formatMoney(stats.pendingOrders)} helper="سفارش‌های نیازمند پیگیری" icon={<CheckCircleOutlineIcon />} accent="#c79e00" />
        <StatCard title="در جریان ارسال" value={formatMoney(stats.activeOrders)} helper="جمع‌آوری‌شده یا تحویل پکرو" icon={<LocalShippingOutlinedIcon />} accent="#315ea8" />
        <StatCard title="کاربران سامانه" value={formatMoney(stats.totalUsers)} helper="مشتری، جمع‌آوری‌کننده و تیم عملیات" icon={<PeopleOutlineIcon />} accent="#8b5fc2" />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.6fr) minmax(300px, .8fr)' }, gap: 2 }}>
        <Paper sx={{ border: '1px solid #deebe3', borderRadius: 4, p: { xs: 1.5, md: 2.5 }, boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box><Typography sx={{ fontWeight: 900, fontSize: 17 }}>آخرین سفارش‌ها</Typography><Typography sx={{ color: '#84958b', fontSize: 11, mt: .4 }}>آخرین تغییرات سامانه</Typography></Box>
            <Button size="small" onClick={() => { setActiveSection('orders'); router.push('/operator/?section=orders'); }} sx={{ color: '#08784f' }}>مشاهده همه</Button>
          </Box>
          <OrdersTable orders={orders.slice(0, 6)} onOpen={openOrder} compact />
        </Paper>
        <Paper sx={{ border: '1px solid #deebe3', borderRadius: 4, p: 2.5, boxShadow: 'none', background: 'linear-gradient(145deg, #075c3e, #08784f)', color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Typography sx={{ fontWeight: 900, fontSize: 17 }}>خلاصه مالی</Typography><AccountBalanceWalletOutlinedIcon sx={{ opacity: .8 }} /></Box>
          <Typography sx={{ opacity: .74, fontSize: 12, mt: 3 }}>مجموع بدهی ثبت‌شده</Typography>
          <Typography sx={{ fontSize: 29, fontWeight: 900, mt: .5 }}>{formatMoney(totalDebt)} <Typography component="span" sx={{ fontSize: 12, opacity: .75 }}>تومان</Typography></Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,.2)', my: 2.5 }} />
          <Typography sx={{ opacity: .78, fontSize: 12, lineHeight: 2 }}>جزئیات تراکنش‌ها، نقش کیف پول و گردش مالی را از بخش تراکنش‌ها دنبال کن.</Typography>
          <Button onClick={() => { setActiveSection('transactions'); router.push('/operator/?section=transactions'); }} sx={{ mt: 2, color: '#17231e', background: '#f4c400', '&:hover': { background: '#ffd633' } }}>گزارش مالی</Button>
        </Paper>
      </Box>
    </>
  );

  const renderOrders = () => {
    const visibleOrders = filteredOrders.slice(orderPage * orderRowsPerPage, orderPage * orderRowsPerPage + orderRowsPerPage);
    return (
      <>
        <SectionHeading eyebrow="مدیریت سفارش‌ها" title="همه سفارش‌ها" description="جست‌وجو، فیلتر، مشاهده جزئیات و کنترل جریان تحویل در یک جدول واحد." action={<Button variant="outlined" onClick={() => loadData(true)} disabled={isRefreshing} startIcon={<RefreshRoundedIcon />} sx={{ borderColor: '#b9d7c7', color: '#08784f' }}>تازه‌سازی</Button>} />
        <Paper sx={{ border: '1px solid #deebe3', borderRadius: 4, p: { xs: 1.5, md: 2 }, boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', mb: 2 }}>
            <TextField value={orderQuery} onChange={(event) => { setOrderQuery(event.target.value); setOrderPage(0); }} placeholder="جست‌وجوی شماره، مشتری، شرکت یا موبایل" size="small" sx={{ flex: '1 1 310px', minWidth: 240 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#8a9a90' }} /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 190 }}><InputLabel>فیلتر وضعیت</InputLabel><Select value={orderStatusFilter} label="فیلتر وضعیت" onChange={(event) => { setOrderStatusFilter(event.target.value); setOrderPage(0); }}><MenuItem value="">همه وضعیت‌ها</MenuItem>{Object.entries(STATUS_LABELS).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl>
            <Chip label={`${formatMoney(filteredOrders.length)} نتیجه`} sx={{ alignSelf: 'center', backgroundColor: '#eef7f2', color: '#08784f', fontWeight: 800 }} />
          </Box>
          <OrdersTable orders={visibleOrders} onOpen={openOrder} />
          <TablePagination component="div" count={filteredOrders.length} page={orderPage} onPageChange={(_, page) => setOrderPage(page)} rowsPerPage={orderRowsPerPage} onRowsPerPageChange={(event) => { setOrderRowsPerPage(Number(event.target.value)); setOrderPage(0); }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="تعداد در صفحه" labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`} />
        </Paper>
      </>
    );
  };

  const renderUsers = () => {
    const visibleUsers = filteredUsers.slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage);
    return (
      <>
        <SectionHeading eyebrow="مدیریت کاربران" title="مشتریان و تیم اجرایی" description="اطلاعات حساب، نوع مشتری، نقش‌ها و موجودی هر کاربر را سریع بررسی کن." action={<Button variant="contained" onClick={() => setCreateDialogOpen(true)} startIcon={<PersonAddAlt1OutlinedIcon />} sx={{ backgroundColor: '#08784f', '&:hover': { backgroundColor: '#075c3e' } }}>ایجاد کاربر</Button>} />
        <Paper sx={{ border: '1px solid #deebe3', borderRadius: 4, p: { xs: 1.5, md: 2 }, boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', mb: 2 }}>
            <TextField value={userQuery} onChange={(event) => { setUserQuery(event.target.value); setUserPage(0); }} placeholder="جست‌وجوی نام، شرکت، موبایل یا نقش" size="small" sx={{ flex: '1 1 340px', minWidth: 240 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#8a9a90' }} /></InputAdornment> }} />
            <Chip label={`${formatMoney(filteredUsers.length)} کاربر`} sx={{ alignSelf: 'center', backgroundColor: '#eef7f2', color: '#08784f', fontWeight: 800 }} />
          </Box>
          <UsersTable users={visibleUsers} onTransactions={handleUserTransactions} />
          <TablePagination component="div" count={filteredUsers.length} page={userPage} onPageChange={(_, page) => setUserPage(page)} rowsPerPage={userRowsPerPage} onRowsPerPageChange={(event) => { setUserRowsPerPage(Number(event.target.value)); setUserPage(0); }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="تعداد در صفحه" labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`} />
        </Paper>
      </>
    );
  };

  const renderTransactions = () => {
    const visibleTransactions = filteredTransactions.slice(transactionPage * transactionRowsPerPage, transactionPage * transactionRowsPerPage + transactionRowsPerPage);
    return (
      <>
        <SectionHeading eyebrow="گزارش مالی" title="تراکنش‌های سیستم" description="گردش کیف پول کاربران را با فیلتر و جزئیات کامل بررسی کن." action={<Button variant="outlined" onClick={() => loadData(true)} disabled={isRefreshing} startIcon={<RefreshRoundedIcon />} sx={{ borderColor: '#b9d7c7', color: '#08784f' }}>تازه‌سازی</Button>} />
        <Paper sx={{ border: '1px solid #deebe3', borderRadius: 4, p: { xs: 1.5, md: 2 }, boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
            <TextField value={transactionQuery} onChange={(event) => { setTransactionQuery(event.target.value); setTransactionPage(0); }} placeholder="جست‌وجوی کاربر، شناسه یا توضیح" size="small" sx={{ flex: '1 1 340px', minWidth: 240 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#8a9a90' }} /></InputAdornment> }} />
            <Card sx={{ borderRadius: 3, boxShadow: 'none', backgroundColor: '#eef7f2' }}><CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}><Typography sx={{ color: '#718278', fontSize: 11 }}>مجموع بدهی</Typography><Typography sx={{ color: '#08784f', fontSize: 16, fontWeight: 900 }}>{formatMoney(totalDebt)} تومان</Typography></CardContent></Card>
          </Box>
          <TransactionsTable transactions={visibleTransactions} users={users} />
          <TablePagination component="div" count={filteredTransactions.length} page={transactionPage} onPageChange={(_, page) => setTransactionPage(page)} rowsPerPage={transactionRowsPerPage} onRowsPerPageChange={(event) => { setTransactionRowsPerPage(Number(event.target.value)); setTransactionPage(0); }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="تعداد در صفحه" labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`} />
        </Paper>
      </>
    );
  };

  const renderSettings = () => (
    <>
      <SectionHeading eyebrow="تنظیمات سیستم" title="کنترل دسترسی سامانه" description="تنظیمات عملیاتی را بدون ورود به پنل فنی تغییر بده." />
      <Paper sx={{ maxWidth: 720, border: '1px solid #deebe3', borderRadius: 4, p: { xs: 2, md: 3 }, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 17 }}>ثبت سفارش کاربران</Typography>
            <Typography sx={{ color: '#718278', fontSize: 12, mt: .8, lineHeight: 2 }}>با خاموش کردن این گزینه، کاربران امکان ثبت سفارش جدید را نخواهند داشت؛ سفارش‌های قبلی همچنان قابل پیگیری هستند.</Typography>
          </Box>
          <SettingsOutlinedIcon sx={{ color: '#08784f', fontSize: 30 }} />
        </Box>
        <Divider sx={{ my: 2.5, borderColor: '#e3ece7' }} />
        {systemSettings ? (
          <FormControlLabel
            control={<Switch checked={systemSettings.can_create_order} onChange={handleSettingChange} disabled={isSaving} color="primary" />}
            label={systemSettings.can_create_order ? 'ثبت سفارش فعال است' : 'ثبت سفارش متوقف است'}
            sx={{ m: 0, color: systemSettings.can_create_order ? '#08784f' : '#b42318', fontWeight: 900, '& .MuiFormControlLabel-label': { fontWeight: 800 } }}
          />
        ) : (
          <Alert severity="warning">تنظیمات سیستمی یافت نشد. ابتدا رکورد تنظیمات را در سرور ایجاد کنید.</Alert>
        )}
      </Paper>
    </>
  );

  if (isLoading && !profile) {
    return <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', bgcolor: '#f3f7f4' }}><CircularProgress sx={{ color: '#08784f' }} /></Box>;
  }

  if (accessDenied || !profile) {
    return (
      <Box dir="rtl" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', bgcolor: '#f3f7f4', p: 3 }}>
        <Paper sx={{ maxWidth: 470, width: '100%', p: 4, textAlign: 'center', border: '1px solid #deebe3', borderRadius: 4 }}>
          <Typography sx={{ color: '#b42318', fontSize: 20, fontWeight: 900 }}>دسترسی پنل محدود است</Typography>
          <Typography sx={{ color: '#718278', fontSize: 13, lineHeight: 2, mt: 1.5 }}>این صفحه فقط برای کاربران دارای نقش اپراتور یا مدیر سیستم فعال است.</Typography>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}><Button variant="contained" onClick={() => router.push('/login')} sx={{ backgroundColor: '#08784f' }}>ورود دوباره</Button><Button variant="outlined" onClick={() => router.push('/home')} sx={{ borderColor: '#b9d7c7', color: '#08784f' }}>بازگشت</Button></Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <OperatorLayout profile={profile.profile} activeSection={activeSection} onSectionChange={setActiveSection}>
      {isRefreshing && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300, bgcolor: '#d9eee3', '& .MuiLinearProgress-bar': { bgcolor: '#08784f' } }} />}
      {activeSection === 'dashboard' && renderDashboard()}
      {activeSection === 'orders' && renderOrders()}
      {activeSection === 'users' && renderUsers()}
      {activeSection === 'transactions' && renderTransactions()}
      {activeSection === 'settings' && renderSettings()}

      <Dialog open={orderDialogOpen} onClose={closeOrder} fullWidth maxWidth="sm" dir="rtl">
        <DialogTitle sx={{ fontWeight: 900, color: '#17231e' }}>مدیریت سفارش #{selectedOrder?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f7faf8' }}><Typography sx={{ color: '#8b9b92', fontSize: 11 }}>مشتری</Typography><Typography sx={{ fontWeight: 800, mt: .5 }}>{orderCustomerName(selectedOrder)}</Typography></Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f7faf8' }}><Typography sx={{ color: '#8b9b92', fontSize: 11 }}>وضعیت فعلی</Typography><Box sx={{ mt: .5 }}><StatusChip status={selectedOrder.status} /></Box></Box>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #e3ece7' }}><Typography sx={{ color: '#8b9b92', fontSize: 11 }}>آدرس دریافت</Typography><Typography sx={{ color: '#34483e', fontSize: 13, mt: .5, lineHeight: 1.9 }}>{selectedOrder.is_in_person_pickup ? 'مراجعه حضوری' : `${selectedOrder.address_details || '—'}${selectedOrder.address_alley ? `، کوچه ${selectedOrder.address_alley}` : ''}${selectedOrder.address_plate ? `، پلاک ${selectedOrder.address_plate}` : ''}`}</Typography></Box>
              <FormControl fullWidth size="small"><InputLabel>جمع‌آوری‌کننده</InputLabel><Select value={selectedCarrierId} label="جمع‌آوری‌کننده" onChange={(event) => setSelectedCarrierId(String(event.target.value) === '' ? '' : Number(event.target.value))}><MenuItem value="">بدون تخصیص</MenuItem>{carriers.map((carrier) => <MenuItem key={carrier.id} value={carrier.id}>{displayName(carrier)} — {carrier.mobile}</MenuItem>)}</Select></FormControl>
              <FormControl fullWidth size="small"><InputLabel>تغییر وضعیت</InputLabel><Select value={selectedStatus} label="تغییر وضعیت" onChange={(event) => setSelectedStatus(event.target.value)}><MenuItem value="">بدون تغییر وضعیت</MenuItem>{NEXT_STATUSES[selectedOrder.status]?.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</Select></FormControl>
              {selectedOrder.description && <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#fffaf0' }}><Typography sx={{ color: '#8b9b92', fontSize: 11 }}>توضیحات مشتری</Typography><Typography sx={{ color: '#63766b', fontSize: 12, mt: .5, lineHeight: 1.8 }}>{selectedOrder.description}</Typography></Box>}
              <Typography sx={{ color: '#8b9b92', fontSize: 11 }}>مبلغ سفارش: <strong style={{ color: '#08784f' }}>{formatMoney(selectedOrder.total_amount)} تومان</strong></Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}><Button onClick={closeOrder} sx={{ color: '#63766b' }}>انصراف</Button><Button variant="contained" onClick={handleSaveOrder} disabled={isSaving} startIcon={<SaveOutlinedIcon />} sx={{ backgroundColor: '#08784f', '&:hover': { backgroundColor: '#075c3e' } }}>{isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</Button></DialogActions>
      </Dialog>

      <Dialog open={createDialogOpen} onClose={() => !isSaving && setCreateDialogOpen(false)} fullWidth maxWidth="sm" dir="rtl">
        <DialogTitle sx={{ fontWeight: 900 }}>ایجاد کاربر جدید</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.8} sx={{ pt: 1 }}>
            <TextField fullWidth label="شماره موبایل" value={newUser.mobile} onChange={(event) => setNewUser((current) => ({ ...current, mobile: event.target.value.replace(/\D/g, '').slice(0, 11) }))} inputProps={{ dir: 'ltr', inputMode: 'numeric' }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}><TextField label="نام" value={newUser.first_name} onChange={(event) => setNewUser((current) => ({ ...current, first_name: event.target.value }))} /><TextField label="نام خانوادگی" value={newUser.last_name} onChange={(event) => setNewUser((current) => ({ ...current, last_name: event.target.value }))} /></Box>
            <FormControl><Typography sx={{ color: '#63766b', fontSize: 12, fontWeight: 800, mb: .5 }}>نوع حساب</Typography><RadioGroup row value={newUser.customer_type} onChange={(event) => setNewUser((current) => ({ ...current, customer_type: event.target.value as 'individual' | 'company' }))}><FormControlLabel value="individual" control={<Radio />} label="کاربر خانگی" /><FormControlLabel value="company" control={<Radio />} label="شرکت" /></RadioGroup></FormControl>
            {newUser.customer_type === 'company' && <TextField required label="نام شرکت" value={newUser.company_name} onChange={(event) => setNewUser((current) => ({ ...current, company_name: event.target.value }))} />}
            <FormControl fullWidth><InputLabel>نقش اولیه</InputLabel><Select value={newUser.role} label="نقش اولیه" onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value as 'Customer' | 'Collector' }))}><MenuItem value="Customer">مشتری</MenuItem><MenuItem value="Collector">جمع‌آوری‌کننده</MenuItem></Select></FormControl>
            <Alert severity="info">اپراتور می‌تواند مشتری یا جمع‌آوری‌کننده بسازد؛ تخصیص نقش‌های حساس فقط توسط مدیر سیستم انجام می‌شود.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}><Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#63766b' }}>انصراف</Button><Button variant="contained" onClick={handleCreateUser} disabled={isSaving} startIcon={<PersonAddAlt1OutlinedIcon />} sx={{ backgroundColor: '#08784f' }}>{isSaving ? 'در حال ایجاد...' : 'ایجاد کاربر'}</Button></DialogActions>
      </Dialog>

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Snackbar>
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}><Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
    </OperatorLayout>
  );
}
