import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// تایپ‌ها
type SectionId = 'hero' | 'services' | 'features' | 'cta' | 'contact';
interface VisibilityState {
  [key: string]: boolean;
}
interface Feature {
  icon: string;
  title: string;
  description: string;
}

export default function Home() {
  const [currentSection, setCurrentSection] = useState<SectionId>('hero');
  const [isVisible, setIsVisible] = useState<VisibilityState>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
            setCurrentSection(entry.target.id as SectionId);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: SectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
    });
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250, direction: 'rtl' }}>
      <List>
        {[
          { text: 'خانه', id: 'hero' },
          { text: 'سرویس‌ها', id: 'services' },
          { text: 'ویژگی‌ها', id: 'features' },
          { text: 'تماس با ما', id: 'contact' },
        ].map((item, index) => (
          <Box key={item.id}>
            <ListItem onClick={() => scrollToSection(item.id as SectionId)}>
              <ListItemText
                primary={item.text}
                sx={{ textAlign: 'right' }}
                primaryTypographyProps={{
                  color: currentSection === item.id ? 'primary' : 'textPrimary',
                  fontWeight: currentSection === item.id ? 'bold' : 'medium',
                }}
              />
            </ListItem>
            {index < 3 && <Divider />}
          </Box>
        ))}
        <Divider />
        <ListItem>
          <Button
            href="/login"
            sx={{
              backgroundColor: '#00784a',
              color: '#fff',
              px: 3,
              py: 1,
              borderRadius: 6,
              boxShadow: 2,
              width: '100%',
              '&:hover': { backgroundColor: '#E5E9ED', transform: 'translateY(-2px)' },
            }}
          >
            ورود
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  const features: Feature[] = [
    {
      icon: '📦',
      title: 'بسته‌بندی حرفه‌ای',
      description: 'بسته‌بندی امن و استاندارد برای تمام انواع محصولات',
    },
    {
      icon: '🔍',
      title: 'ردیابی لحظه‌ای',
      description: 'ردیابی کامل مرسوله از لحظه ارسال تا تحویل',
    },
    {
      icon: '⚡',
      title: 'ارسال سریع',
      description: 'ارسال در کمترین زمان ممکن با بالاترین کیفیت',
    },
    {
      icon: '🛡️',
      title: 'بیمه کامل',
      description: 'بیمه‌نامه کامل برای تمام مرسولات ارسالی',
    },
    {
      icon: '📱',
      title: 'پشتیبانی 24/7',
      description: 'پشتیبانی مداوم و پاسخگویی در تمام ساعات',
    },
    {
      icon: '💰',
      title: 'قیمت مناسب',
      description: 'بهترین قیمت‌ها برای تمام سرویس‌های حمل و نقل',
    },
  ];

  return (
    <Box sx={{ fontFamily: 'iranYekan, sans-serif', direction: 'rtl' }}>
      {/* Navigation */}
      <AppBar
        position="fixed"
        sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: 1 }}
      >
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
            <img src="/images/logo.svg" alt="لوگوی تیپاکس پونک" style={{ height: 32 }} />
            <Typography variant="h6" sx={{ ml: 1, color: '#00784a', fontWeight: 700 }}>
              تیپاکس پونک
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            {[
              { text: 'خانه', id: 'hero' },
              { text: 'سرویس‌ها', id: 'services' },
              { text: 'ویژگی‌ها', id: 'features' },
              { text: 'تماس با ما', id: 'contact' },
            ].map((item) => (
              <Button
                key={item.id}
                color={currentSection === item.id ? 'primary' : 'inherit'}
                onClick={() => scrollToSection(item.id as SectionId)}
                sx={{
                  color: currentSection === item.id ? 'primary.main' : '#00784a',
                  fontWeight: currentSection === item.id ? 'bold' : 'medium',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgba(0, 26, 57, 0.1)' },
                }}
              >
                {item.text}
              </Button>
            ))}
            <Button
              variant="contained"
              href="/login"
              sx={{
                backgroundColor: '#00784a',
                color: '#fff',
                px: 3,
                py: 1,
                borderRadius: 6,
                boxShadow: 2,
                '&:hover': { backgroundColor: '#E5E9ED', transform: 'translateY(-2px)' },
              }}
            >
              ورود
            </Button>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon sx={{ color: '#00784a' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}>
        {drawer}
      </Drawer>

      {/* Hero Section */}
      <Box
        id="hero"
        data-section
        sx={{
          minHeight: '80vh',
          background: 'linear-gradient(180deg, #E5E9ED 0%, #00784a 100%)',
          display: 'flex',
          alignItems: 'center',
          pt: { xs: 10, md: 12 },
          pb: 5,
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }} order={{ xs: 2, md: 1 }} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Box
                sx={{
                  color: '#fff',
                  opacity: isVisible.hero ? 1 : 0,
                  transform: isVisible.hero ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease',
                }}
              >
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: 28, md: 48 } }}>
                  پلتفرم هوشمند حمل و نقل تیپاکس پونک
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, fontSize: { xs: 16, md: 18 } }}>
                  با تیپاکس پونک، حمل بار و ارسال بسته‌های شما با بالاترین کیفیت و سرعت انجام می‌شود.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    href="/intro"
                    startIcon={<span>🚀</span>}
                    sx={{
                      backgroundColor: '#fff',
                      color: '#00784a',
                      px: 4,
                      py: 1.5,
                      borderRadius: 25,
                      fontWeight: 700,
                      boxShadow: 3,
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: 5 },
                      '& .MuiButton-startIcon': { ml: 1 },
                    }}
                  >
                    شروع کنید
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => scrollToSection('services')}
                    startIcon={<span>📋</span>}
                    sx={{
                      borderColor: '#fff',
                      color: '#fff',
                      px: 3,
                      py: 1.5,
                      borderRadius: 25,
                      fontWeight: 600,
                      '&:hover': { backgroundColor: '#fff', color: '#00784a', borderColor: '#fff' },
                      '& .MuiButton-startIcon': { ml: 1 },
                    }}
                  >
                    سرویس‌ها
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} order={{ xs: 1, md: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src="/images/delivery.png"
                alt="تصویر جستجوی حمل‌کننده در تیپاکس پونک"
                style={{
                  width: '100%',
                  maxWidth: 300,
                  height: 'auto',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                  animation: 'float 6s ease-in-out infinite',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box id="services" data-section sx={{ py: 10, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 2, color: '#00784a', fontSize: { xs: 24, md: 36 } }}>
            سرویس‌های ما
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 6, color: '#666', maxWidth: 600, mx: 'auto' }}>
            سرویس تیپاکس پونک برای تمام نیازهای حمل و نقل شما
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: '/images/logo.svg',
                title: 'تیپاکس پونک مستقیم',
                description: 'تیپاکس پونک مستقیماً محصولات را از فرستنده دریافت و به مقصد می‌رساند.',
              },
            ].map((service, index) => (
              <Grid size={{ xs: 12, md: 12 }} key={index}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: 'all 0.4s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 5 },
                    opacity: isVisible.services ? 1 : 0,
                    transform: isVisible.services ? 'translateX(0)' : 'translateX(-20px)',
                  }}
                >
                  <CardMedia component="img" image={service.icon} alt={`آیکون ${service.title}`} sx={{ width: 64, height: 80, mb: 2 }} />
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" sx={{ mb: 1, color: '#00784a' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        data-section
        sx={{ py: 10, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 2, color: '#00784a', fontSize: { xs: 24, md: 36 } }}>
            ویژگی‌های تیپاکس پونک
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 6, color: '#666', maxWidth: 600, mx: 'auto' }}>
            امکانات کاملی که تیپاکس پونک در اختیار شما قرار می‌دهد
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 2,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: 4 },
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#fff',
                  }}
                >
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h3" sx={{ mb: 2, fontSize: 40, color: '#00784a' }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, color: '#00784a', fontWeight: 600, minHeight: 28 }}>
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#666', lineHeight: 1.6, px: 2, minHeight: 48 }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        id="cta"
        data-section
        sx={{ py: 10, background: 'linear-gradient(180deg, #00784a 0%, #E5E9ED 100%)', color: '#fff', textAlign: 'center' }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: 24, md: 36 } }}>
            آماده شروع هستید؟
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            همین الان عضو پلتفرم تیپاکس پونک شوید و از خدمات حمل و نقل هوشمند ما بهره‌مند شوید
          </Typography>
          <Button
            variant="contained"
            href="/login"
            startIcon={<span>🎯</span>}
            sx={{
              backgroundColor: '#fff',
              color: '#00784a',
              px: 4,
              py: 2,
              borderRadius: 25,
              fontSize: 18,
              fontWeight: 700,
              boxShadow: 3,
              '&:hover': { transform: 'translateY(-3px)', boxShadow: 5 },
              '& .MuiButton-startIcon': { ml: 1 },
            }}
          >
            ورود به پنل کاربری
          </Button>
        </Container>
      </Box>

      {/* Contact Us Section */}
      <Box id="contact" data-section sx={{ py: 10, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 2, color: '#00784a', fontSize: { xs: 24, md: 36 } }}>
            تماس با ما
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 6, color: '#666', maxWidth: 600, mx: 'auto' }}>
            با ما در ارتباط باشید تا از خدمات و پشتیبانی تیپاکس پونک بهره‌مند شوید
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                  <LocationOnIcon sx={{ color: '#00784a', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: '#00784a', fontWeight: 600 }}>
                    آدرس
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#666', mb: 4, lineHeight: 1.7, pr: 4.5 }}>
                  جنت آباد - شاهین شمالی - جنب معاینه فنی آبشناسان - لاله هشتم - کوچه شبنم - پلاک ۴
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <PhoneIcon sx={{ color: '#00784a', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: '#00784a', fontWeight: 600 }}>
                    شماره تماس
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#666', direction: 'ltr', pr: 4.5 }}>
                  021-44411332
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <EmailIcon sx={{ color: '#00784a', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: '#00784a', fontWeight: 600 }}>
                    ایمیل
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#666', direction: 'ltr', pr: 4.5 }}>
                  info@tpoonak.com.ir
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </Box>
  );
}