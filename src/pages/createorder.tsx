import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Switch,
  Modal,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Header from '@/components/common/Header';
import AppFrame from '@/components/common/AppFrame';
import CustomBottomNavigation from '@/components/common/CustomBottomNavigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { getCarrierTypes } from '@/services/carrier';
import { getPackages } from '@/services/package';
import { getAddresses, createAddress } from '@/services/address';
import { canCreateOrder, createOrder, getVehicle, settingOrder } from '@/services/order';
import { CreateOrderRequest, VehicleType } from '@/types/order';
import styles from '../components/feature/styles/Home.module.css';
import { CarrierType } from '@/types/carrier';
import { Package } from '@/types/package';
import { Address, CreateAddressRequest } from '@/types/address';

export default function CreateOrder() {
  const [carrierTypes, setCarrierTypes] = useState<CarrierType[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [selectedCarrierType, setSelectedCarrierType] = useState<number | ''| undefined>('');
  const [carrierTypeText, setCarrierTypeText] = useState<string>(''); // برای "سایر"
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | ''>('');
  const [selectedAddress, setSelectedAddress] = useState<number | ''>('');
  const [isSameDayDelivery] = useState<boolean>(false); // همیشه غیرفعال
  const [isInPersonPickup, setIsInPersonPickup] = useState<boolean>(false); // گزینه مراجعه حضوری
  const [description, setDescription] = useState<string>('');
  const [packageQuantities, setPackageQuantities] = useState<{ [key: number]: { quantity: number; packaging_quantity: number } }>({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [OpenModalCloseOrder, setOpenModalCloseOrder] = useState<boolean>(false);
  const [openBranchModal, setOpenBranchModal] = useState<boolean>(false); // مدال اطلاعات شعبه
  const [newAddress, setNewAddress] = useState<{ name: string; address: string; location: string; alley: string; plate: string }>({
  name: '', address: '', location: '', alley: '', plate: ''
});

  const [error, setError] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const [canCreateOrderStatus, setCanCreateOrderStatus] = useState<boolean | null>(null); // وضعیت canCreateOrder

useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [carrierTypesData, packagesData, addressesData, vehicleTypeResponse, 
        canCreateOrderResponse,settingOrderResponse] = await Promise.all([
        getCarrierTypes(),
        getPackages(),
        getAddresses(),
        getVehicle(),
        canCreateOrder(),
        settingOrder()
      ]);


      if(settingOrderResponse.data.can_create_order === false)
      {
       setOpenModalCloseOrder(true); // باز کردن مدال اگر امکان ثبت سفارش نباشد 
      }
      
      if (canCreateOrderResponse.data.can_create === false) 
      {
        setOpenModalCloseOrder(true); // باز کردن مدال اگر امکان ثبت سفارش نباشد
      }

      // بقیه داده‌ها
      setCarrierTypes(carrierTypesData.filter((type) => type.is_active));
      const firstActiveCarrierType = carrierTypesData.find((type) => type.is_active);
      setSelectedCarrierType(firstActiveCarrierType?.id)
      setPackages(packagesData.filter((pkg) => pkg.is_active));
      setAddresses(addressesData);
      setVehicles(vehicleTypeResponse.data);
      const initialQuantities = packagesData.reduce(
        (acc, pkg) => ({
          ...acc,
          [pkg.id]: { quantity: 0, packaging_quantity: 0 },
        }),
        {}
      );
      setPackageQuantities(initialQuantities);
      setCanCreateOrderStatus(true); // نشان می‌دهیم که درخواست با موفقیت انجام شد
    }
     catch (err: any) 
    {
      setCanCreateOrderStatus(false); // در صورت خطا
      setError(err.response?.data?.message || 'خطا در بارگذاری داده‌ها');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);



  // محاسبه جمع کل هزینه‌ها
  const totalCost = useMemo(() => {
    return packages.reduce((total, pkg) => {
      const { quantity, packaging_quantity } = packageQuantities[pkg.id] || { quantity: 0, packaging_quantity: 0 };
      const price = parseFloat(pkg.price) * quantity;
      const packagingPrice = parseFloat(pkg.packaging_price) * packaging_quantity;
      return total + price + packagingPrice;
    }, 0);
  }, [packages, packageQuantities]);

  // هندلر انتخاب نوع باربری
  const handleCarrierTypeSelect = (carrierTypeId: number) => {
    setSelectedCarrierType(carrierTypeId);
    setCarrierTypeText('');
  };

  // هندلر انتخاب ناوگان
  const handleVehicleTypeSelect = (vehicleTypeId: number) => {
    setSelectedVehicleType(vehicleTypeId);
  };

  // هندلر افزایش/کاهش تعداد
  const handleIncrement = (packageId: number, field: 'quantity' | 'packaging_quantity') => {
    setPackageQuantities((prev) => ({
      ...prev,
      [packageId]: {
        ...prev[packageId],
        [field]: prev[packageId][field] + 1,
      },
    }));
  };

  const handleDecrement = (packageId: number, field: 'quantity' | 'packaging_quantity') => {
    setPackageQuantities((prev) => ({
      ...prev,
      [packageId]: {
        ...prev[packageId],
        [field]: prev[packageId][field] > 0 ? prev[packageId][field] - 1 : 0,
        ...(field === 'quantity' && prev[packageId][field] === 1 ? { packaging_quantity: 0 } : {}),
      },
    }));
  };

  // هندلر تغییر آدرس
  const handleAddressChange = (event: any) => {
    setSelectedAddress(event.target.value as number);
  };

  // مدیریت باز و بسته شدن مدال آدرس
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewAddress({ name: '', address: '', location: '' ,alley:'',plate:''});
  };

  // مدیریت باز و بسته شدن مدال اطلاعات شعبه
  const handleBranchModalClose = () => {
    setOpenBranchModal(false);
    setIsInPersonPickup(false); // خاموش کردن سوئیچ هنگام بستن مدال
  };

  // مدیریت سوئیچ مراجعه حضوری
  const handleInPersonPickupChange = (checked: boolean) => {
    setIsInPersonPickup(checked);
    setOpenBranchModal(checked); // باز کردن مدال هنگام فعال شدن سوئیچ
  };

  // مدیریت انتخاب لوکیشن از MapComponent
  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    setNewAddress((prev) => ({
      ...prev,
      location: JSON.stringify({ latitude: location.latitude, longitude: location.longitude }),
      address: location.address || prev.address || '',
    }));
  };

  // مدیریت افزودن آدرس جدید
  const handleAddAddress = async () => {
  if (!newAddress.name || !newAddress.address || !newAddress.location || !newAddress.alley || !newAddress.plate) {
    setError('لطفاً تمام فیلدهای آدرس و لوکیشن را پر کنید');
    setOpenSnackbar(true);
    return;
  }
  
  let location;
  try {
    location = JSON.parse(newAddress.location);
  } catch {
    setError('لوکیشن نامعتبر است');
    setOpenSnackbar(true);
    return;
  }

  const addressData: CreateAddressRequest = {
    name: newAddress.name,
    address: newAddress.address,
    alley: newAddress.alley,
    plate: newAddress.plate,
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
  };

  setIsLoading(true);
  setError('');

  try {
    const response = await createAddress(addressData);
    setAddresses([...addresses, response.data]);
    setSelectedAddress(response.data.id);
    handleCloseModal();
  } catch (err: any) {
    setError(err.response?.data?.message || 'خطا در افزودن آدرس');
    setOpenSnackbar(true);
  } finally {
    setIsLoading(false);
  }
};


  // ثبت سفارش
  const handleCreateOrder = async () => {
    if (isInPersonPickup) {
      setError('امکان ثبت سفارش در حالت مراجعه حضوری وجود ندارد');
      setOpenSnackbar(true);
      return;
    }

    if (!selectedCarrierType) {
      setError('لطفاً نوع باربری را انتخاب کنید');
      setOpenSnackbar(true);
      return;
    }
    const isOtherCarrier = carrierTypes.find((type) => type.id === selectedCarrierType)?.title === 'سایر';
    if (isOtherCarrier && !carrierTypeText.trim()) {
      setError('لطفاً نام شرکت پستی را وارد کنید');
      setOpenSnackbar(true);
      return;
    }
    if (!selectedVehicleType) {
      setError('لطفاً یک ناوگان انتخاب کنید');
      setOpenSnackbar(true);
      return;
    }
    if (!selectedAddress) {
      setError('لطفاً آدرس را انتخاب کنید');
      setOpenSnackbar(true);
      return;
    }
    const selectedPackages = packages
      .filter((pkg) => packageQuantities[pkg.id]?.quantity > 0 || packageQuantities[pkg.id]?.packaging_quantity > 0)
      .map((pkg) => ({
        package_id: pkg.id,
        quantity: packageQuantities[pkg.id].quantity,
        packaging_quantity: packageQuantities[pkg.id].packaging_quantity,
      }));
    if (selectedPackages.length === 0) {
      setError('لطفاً حداقل یک بسته انتخاب کنید');
      setOpenSnackbar(true);
      return;
    }

    const orderData: CreateOrderRequest = {
      carrier_type_id: selectedCarrierType,
      vehicle_type_id: selectedVehicleType,
      address_id: selectedAddress,
      is_same_day_delivery: isSameDayDelivery,
      is_in_person_pickup: isInPersonPickup,
      description,
      packages: selectedPackages,
      ...(isOtherCarrier && { carrier_type_text: carrierTypeText.trim() }),
    };

    setIsLoading(true);
    setError('');

    try {
      const response = await createOrder(orderData);
      router.push(`/searching/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ثبت سفارش');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // مدیریت بستن Toast
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError('');
  };

  // بارگذاری دینامیک MapComponent
  const Map = useMemo(
    () =>
      dynamic(
        () =>
          import('@/components/common/MapComponent').then((mod) => mod.default),
        {
          loading: () => <p>نقشه در حال بارگذاری است...</p>,
          ssr: false,
        }
      ),
    []
  );

  // اطلاعات شعبه (به صورت استاتیک برای نمونه)
  const branchInfo = {
    address: ' جنت آباد - شاهین شمالی - جنب معاینه فنی آبشناسان - لاله هشتم - کوچه شبنم - پلاک ۴',
    phone: '۰۲۱-۴۴۴۱۱۳۳۲',
    location: 'https://maps.google.com/?q=35.766317, 51.312771',
  };

  return (
    <AppFrame>
      <Header title="ایجاد سفارش" />
      <Box
        className={styles.container}
        sx={{
          direction: 'rtl',
          textAlign: 'right',
          minHeight: 'calc(100dvh - 68px)',
          overflowY: 'auto',
          pb: 14,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'transparent',
        }}
      >
        <Box sx={{ p: 2, flexGrow: 1 }}>
          {/* Same Day Delivery Switch */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ flex: 1, fontFamily: 'IranYekan, sans-serif' }}>
              ارسال فوری
            </Typography>
            <Switch
              checked={isSameDayDelivery}
              disabled
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#00784a',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#00784a',
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

          {/* Carrier Type Section */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
            نوع باربری
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {carrierTypes.map((type) => (
              <Button
                key={type.id}
                variant="outlined"
                onClick={() => handleCarrierTypeSelect(type.id)}
                disabled={isLoading}
                sx={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${selectedCarrierType === type.id ? '#00784a' : '#E0E0E0'}`,
                  borderRadius: '8px',
                  color: selectedCarrierType === type.id ? '#00784a' : '#000',
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  fontFamily: 'IranYekan, sans-serif',
                  '&:hover': {
                    border: '1px solid #00784a',
                    backgroundColor: '#F5F5F5',
                  },
                  '&:disabled': {
                    border: '1px solid #cccccc',
                    color: '#cccccc',
                  },
                }}
              >
                {type.title}
              </Button>
            ))}
          </Box>

          {/* Other Carrier TextField */}
          {carrierTypes.find((type) => type.id === selectedCarrierType)?.title === 'سایر' && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontFamily: 'IranYekan, sans-serif' }}>
                نام شرکت پستی
              </Typography>
              <TextField
                fullWidth
                placeholder="نام شرکت پستی را اینجا بنویسید"
                value={carrierTypeText}
                onChange={(e) => setCarrierTypeText(e.target.value)}
                variant="outlined"
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00784a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00784a',
                    },
                  },
                  '& input': {
                    textAlign: 'right',
                    fontFamily: 'IranYekan, sans-serif',
                  },
                }}
              />
            </Box>
          )}

          {/* Vehicle Type Selection Section */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
            انتخاب ناوگان
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666', fontFamily: 'IranYekan, sans-serif', fontSize: 18 }}>
            در صورتی که وزن یا ابعاد مرسوله شما بزرگ است، لطفاً گزینه وانت را انتخاب کنید.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {vehicles.map((vehicle) => {
              const vehicleImage =
                vehicle.id === 1
                  ? '/images/motor-delivery.png'
                  : vehicle.id === 2
                  ? '/images/truck-delivery.png'
                  : '/images/motor-delivery.png';
              return (
                <Button
                  key={vehicle.id}
                  variant="outlined"
                  onClick={() => handleVehicleTypeSelect(vehicle.id)}
                  disabled={isLoading}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    border: `2px solid ${selectedVehicleType === vehicle.id ? '#00784a' : '#E0E0E0'}`,
                    borderRadius: '12px',
                    color: selectedVehicleType === vehicle.id ? '#00784a' : '#000',
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    fontFamily: 'IranYekan, sans-serif',
                    fontWeight: selectedVehicleType === vehicle.id ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      border: '2px solid #00784a',
                      backgroundColor: '#F5F5F5',
                    },
                    '&:disabled': {
                      border: '2px solid #cccccc',
                      color: '#cccccc',
                    },
                  }}
                >
                  <Image
                    src={vehicleImage}
                    alt={vehicle.name}
                    width={32}
                    height={32}
                    style={{ objectFit: 'contain' }}
                  />
                  <Typography sx={{ fontWeight: selectedVehicleType === vehicle.id ? 'bold' : 'normal' }}>
                    {vehicle.name}
                  </Typography>
                </Button>
              );
            })}
          </Box>

          {/* In-Person Pickup Switch */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ flex: 1, fontFamily: 'IranYekan, sans-serif' }}>
              مراجعه حضوری
            </Typography>
            <Switch
              checked={isInPersonPickup}
              onChange={(e) => handleInPersonPickupChange(e.target.checked)}
              disabled={isLoading}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#00784a',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#00784a',
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

          {/* Address Selection Section */}
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
              انتخاب آدرس
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, mb: 2 }}>
              <FormControl sx={{ flex: 2 }}>
                <InputLabel sx={{ fontFamily: 'IranYekan, sans-serif' }}>انتخاب آدرس</InputLabel>
                <Select
                  value={selectedAddress}
                  label="انتخاب آدرس"
                  onChange={handleAddressChange}
                  disabled={isLoading}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    textAlign: 'right',
                    '& .MuiSelect-select': {
                      textAlign: 'right',
                      fontFamily: 'IranYekan, sans-serif',
                    },
                  }}
                >
                  {addresses.length === 0 ? (
                    <MenuItem disabled>آدرسی موجود نیست</MenuItem>
                  ) : (
                    addresses.map((addr) => (
                      <MenuItem key={addr.id} value={addr.id} sx={{ fontFamily: 'IranYekan, sans-serif' }}>
                        {addr.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleOpenModal}
                disabled={isLoading}
                sx={{
                  backgroundColor: '#00784a',
                  color: '#fff',
                  flex: 1,
                  padding: '16px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontFamily: 'IranYekan, sans-serif',
                  '&:hover': {
                    backgroundColor: '#00784a',
                  },
                }}
              >
                افزودن آدرس
              </Button>
            </Box>
          </>

          {/* Packages Section */}
          {packages.map((pkg) => {
            const isPackageSelected = packageQuantities[pkg.id]?.quantity > 0;
            return (
              <Box
                key={pkg.id}
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
                    <Typography variant="h6" sx={{ mb: 1, fontFamily: 'IranYekan, sans-serif' }}>
                      {pkg.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#666', fontFamily: 'IranYekan, sans-serif' }}>
                      تعداد بسته‌ها را وارد کنید
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => handleDecrement(pkg.id, 'quantity')}
                        disabled={isLoading}
                        sx={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBCBCB',
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          '&:hover': {
                            backgroundColor: '#F5F5F5',
                            borderColor: '#00784a',
                          },
                        }}
                      >
                        <RemoveIcon sx={{ color: '#00784a' }} />
                      </IconButton>
                      <TextField
                        value={packageQuantities[pkg.id]?.quantity || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = Number(e.target.value);
                          if (value >= 0) {
                            setPackageQuantities((prev) => ({
                              ...prev,
                              [pkg.id]: { ...prev[pkg.id], quantity: value, packaging_quantity: value === 0 ? 0 : prev[pkg.id].packaging_quantity },
                            }));
                          }
                        }}
                        variant="outlined"
                        placeholder="تعداد"
                        type="number"
                        disabled={isLoading}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            height: 32,
                            '& fieldset': {
                              borderColor: '#CBCBCB',
                            },
                            '&:hover fieldset': {
                              borderColor: '#00784a',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#00784a',
                            },
                          },
                          '& input': {
                            textAlign: 'center',
                            padding: '0 8px',
                            fontFamily: 'IranYekan, sans-serif',
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => handleIncrement(pkg.id, 'quantity')}
                        disabled={isLoading}
                        sx={{
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          backgroundColor: '#00784a',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: '#00784a',
                            color: '#fff',
                          },
                        }}
                      >
                        <AddIcon sx={{ color: '#fff' }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontFamily: 'IranYekan, sans-serif' }}>
                      بسته‌بندی {pkg.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#666', fontFamily: 'IranYekan, sans-serif' }}>
                      تعداد بسته‌بندی‌ها را وارد کنید
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => handleDecrement(pkg.id, 'packaging_quantity')}
                        disabled={isLoading || !isPackageSelected}
                        sx={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBCBCB',
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          '&:hover': {
                            backgroundColor: '#F5F5F5',
                            borderColor: '#00784a',
                          },
                          '&:disabled': {
                            backgroundColor: '#f5f5f5',
                            borderColor: '#cccccc',
                          },
                        }}
                      >
                        <RemoveIcon sx={{ color: isPackageSelected ? '#00784a' : '#cccccc' }} />
                      </IconButton>
                      <TextField
                        value={packageQuantities[pkg.id]?.packaging_quantity || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = Number(e.target.value);
                          if (value >= 0 && isPackageSelected) {
                            setPackageQuantities((prev) => ({
                              ...prev,
                              [pkg.id]: { ...prev[pkg.id], packaging_quantity: value },
                            }));
                          }
                        }}
                        variant="outlined"
                        placeholder="تعداد"
                        type="number"
                        disabled={isLoading || !isPackageSelected}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            height: 32,
                            '& fieldset': {
                              borderColor: '#CBCBCB',
                            },
                            '&:hover fieldset': {
                              borderColor: isPackageSelected ? '#00784a' : '#cccccc',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: isPackageSelected ? '#00784a' : '#cccccc',
                            },
                            '&.Mui-disabled': {
                              backgroundColor: '#f5f5f5',
                            },
                          },
                          '& input': {
                            textAlign: 'center',
                            padding: '0 8px',
                            fontFamily: 'IranYekan, sans-serif',
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => handleIncrement(pkg.id, 'packaging_quantity')}
                        disabled={isLoading || !isPackageSelected}
                        sx={{
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          backgroundColor: isPackageSelected ? '#00784a' : '#cccccc',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: isPackageSelected ? '#00784a' : '#cccccc',
                            color: '#fff',
                          },
                        }}
                      >
                        <AddIcon sx={{ color: '#fff' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '0 0 30%', sm: '0 0 30%' }, display: 'flex', justifyContent: 'center' }}>
                  <Image
                    src={pkg.name === 'بسته بزرگ' ? '/images/boxes.png' : '/images/small-box.png'}
                    alt={`بسته و بسته‌بندی ${pkg.name}`}
                    width={100}
                    height={100}
                    style={{ borderRadius: '8px', objectFit: 'contain' }}
                  />
                </Box>
              </Box>
            );
          })}

          {/* Description TextArea */}
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif' }}>
            توضیحات
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="توضیحات خود را اینجا بنویسید"
            variant="outlined"
            disabled={isLoading}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: '#00784a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00784a',
                },
              },
              '& textarea': {
                textAlign: 'right',
                fontFamily: 'IranYekan, sans-serif',
              },
            }}
          />

          {/* Total Cost Box */}
          <Box
            sx={{
              backgroundColor: '#FBFBFB',
              boxShadow: '0px 4px 16px 0px rgba(18, 18, 18, 0.24)',
              borderRadius: '16px',
              p: 2,
              mt: 2,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'IranYekan, sans-serif', color: '#00784a' }}>
              جمع کل هزینه: {totalCost.toLocaleString('fa-IR')} تومان
            </Typography>
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleCreateOrder}
            disabled={isLoading || isInPersonPickup}
            sx={{
              mt: 2,
              backgroundColor: '#00784a',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'IranYekan, sans-serif',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#0f9f68ff',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
              },
            }}
          >
            {isLoading ? 'در حال ثبت...' : 'ثبت سفارش'}
          </Button>

          {/* Modal for Adding Address */}
          <Modal open={openModal} onClose={handleCloseModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 400 },
                height:"80%",
                bgcolor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: 24,
                p: 3,
                direction: 'rtl',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif' }}>
                افزودن آدرس جدید
              </Typography>
              <TextField
                fullWidth
                label="نام"
                value={newAddress.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAddress({ ...newAddress, name: e.target.value })
                }
                variant="outlined"
                sx={{
                  mb: 2,
                  fontFamily: 'IranYekan, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '8px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#0f9f68ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0f9f68ff',
                    },
                  },
                  '& input': {
                    textAlign: 'right',
                    fontFamily: 'IranYekan, sans-serif',
                  },
                }}
              />
              <TextField
                fullWidth
                label="آدرس"
                value={newAddress.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
                multiline
                rows={4}
                variant="outlined"
                sx={{
                  mb: 2,
                  fontFamily: 'IranYekan, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '8px',
                    },
                    '&:hover fieldset': {
                      borderColor: '#0f9f68ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0f9f68ff',
                    },
                  },
                  '& input': {
                    textAlign: 'right',
                    fontFamily: 'IranYekan, sans-serif',
                  },
                }}
              />
             <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="کوچه"
                  value={newAddress.alley}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewAddress({ ...newAddress, alley: e.target.value })
                  }
                  variant="outlined"
                  required
                  sx={{
                    flex: 1,
                    fontFamily: 'IranYekan, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#0f9f68ff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0f9f68ff',
                      },
                    },
                    '& input': {
                      textAlign: 'right',
                      fontFamily: 'IranYekan, sans-serif',
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="پلاک"
                  value={newAddress.plate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewAddress({ ...newAddress, plate: e.target.value })
                  }
                  variant="outlined"
                  required
                  sx={{
                    flex: 1,
                    fontFamily: 'IranYekan, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderRadius: '8px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#0f9f68ff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0f9f68ff',
                      },
                    },
                    '& input': {
                      textAlign: 'right',
                      fontFamily: 'IranYekan, sans-serif',
                    },
                  }}
                />
              </Box>

              <Map onLocationSelect={handleLocationSelect} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseModal}
                  sx={{ borderColor: '#E0E0E0', color: '#000', fontFamily: 'IranYekan, sans-serif' }}
                >
                  لغو
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddAddress}
                  sx={{ backgroundColor: '#00784a', color: '#fff', fontFamily: 'IranYekan, sans-serif' }}
                  disabled={!newAddress.name || !newAddress.address || !newAddress.location}
                >
                  افزودن
                </Button>
              </Box>
            </Box>
          </Modal>

          <Modal open={OpenModalCloseOrder}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: 400,
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: 24,
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={100}
                  height={80}
                  style={{ marginBottom: '20px' }}
                />
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif', direction: "rtl" }}>
                  با عرض پوزش امروز امکان جمع‌آوری وجود ندارد
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif', direction: "rtl" }}>
                  لطفاً برای ارسال مرسوله خود تا ساعت ۱۸ و در روزهای پنج‌شنبه تا ساعت ۱۴ به صورت حضوری به شعبه مراجعه فرمایید.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif', direction: "rtl" }}>
                  آدرس: {branchInfo.address}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontFamily: 'IranYekan, sans-serif', direction: "rtl" }}>
                  تلفن: <span dir="ltr">{branchInfo.phone}</span>
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    href={branchInfo.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontFamily: 'IranYekan, sans-serif',
                      color: '#0f9f68ff',
                      borderColor: '#0f9f68ff',
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                        borderColor: '#0f9f68ff',
                      },
                    }}
                  >
                    مشاهده در نقشه
                  </Button>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    href="/home"
                    sx={{
                      fontFamily: 'IranYekan, sans-serif',
                      backgroundColor: '#00784a',
                      color: '#fff',
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#006438',
                      },
                    }}
                  >
                بازگشت به صفحه اصلی
                  </Button>
                </Box>
              </Box>
            </Modal>



          {/* Modal for Branch Information */}
          <Modal open={openBranchModal} onClose={handleBranchModalClose}>
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
                اطلاعات شعبه
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: 'IranYekan, sans-serif' }}>
                <strong>آدرس:</strong> {branchInfo.address}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: 'IranYekan, sans-serif' }}>
                <strong>تلفن:</strong> {branchInfo.phone}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  href={branchInfo.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontFamily: 'IranYekan, sans-serif',
                    color: '#0f9f68ff',
                    borderColor: '#0f9f68ff',
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                      borderColor: '#0f9f68ff',
                    },
                  }}
                >
                  مشاهده در نقشه
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleBranchModalClose}
                  sx={{ backgroundColor: '#00784a', color: '#fff', fontFamily: 'IranYekan, sans-serif' }}
                >
                  بستن
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>

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
