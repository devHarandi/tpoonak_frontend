import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

const CustomBottomNavigation = () => {
  const router = useRouter();
  const currentRoute = router.pathname.split('/').pop() || 'home';

  const handleNavigation = (route: string) => {
    router.push(`/${route}`);
  };

  const navItems = [
    { label: 'خانه', icon: '/images/home.svg', route: 'home', position: 'right' },
    { label: 'سفارشات', icon: '/images/orders.svg', route: 'myorders', position: 'right' },
    { label: 'ثبت مرسوله', icon: '/images/pack.svg', route: 'createorder', position: 'left' },
    { label: 'پروفایل', icon: '/images/profile.svg', route: 'editprofile', position: 'left' },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '80px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '95%',
          height: '70px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#00784a',
          borderRadius: '16px',
          mx: '10px',
          padding: '0 20px',
        }}
      >
        {/* آیتم‌های سمت چپ */}
        <Box sx={{ display: 'flex', gap: '40px', direction: 'rtl' }}>
          {navItems
            .filter((item) => item.position === 'left')
            .map((item) => (
              <Box
                key={item.route}
                onClick={() => handleNavigation(item.route)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: currentRoute === item.route ? '#fff' : '#b0b0b0',
                  transition: 'color 0.3s',
                }}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  style={{ marginBottom: '4px' }}
                />
                <Typography sx={{ fontSize: '12px', fontWeight: currentRoute === item.route ? 'bold' : 'normal' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
        </Box>

        {/* لوگوی مرکزی */}
        <Box
          sx={{
            width: '60px',
            height: '60px',
            overflow: 'hidden',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '-20px',
            zIndex: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: '50%',
          }}
        >
          <Image
            src="/images/logo.svg"
            alt="لوگوی تیپاکس پونک"
            width={60}
            height={55}
            style={{
              borderRadius: '50%',
              position: 'absolute',
              animation: 'spin 1s linear infinite',
              animationDelay: '5s',
              animationIterationCount: 1,
              animationFillMode: 'forwards',
            }}
          />
        </Box>

        {/* آیتم‌های سمت راست */}
        <Box sx={{ display: 'flex', gap: '40px', direction: 'rtl' }}>
          {navItems
            .filter((item) => item.position === 'right')
            .map((item) => (
              <Box
                key={item.route}
                onClick={() => handleNavigation(item.route)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: currentRoute === item.route ? '#fff' : '#b0b0b0',
                  transition: 'color 0.3s',
                }}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  style={{ marginBottom: '4px' }}
                />
                <Typography sx={{ fontSize: '12px', fontWeight: currentRoute === item.route ? 'bold' : 'normal' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
};

// افزودن انیمیشن CSS
const styles = `
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// افزودن استایل به سند
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default CustomBottomNavigation;