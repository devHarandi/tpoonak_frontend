import { useEffect, useState, type ReactNode } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';

type SectionId = 'hero' | 'services' | 'process' | 'features' | 'contact';

type NavItem = {
  label: string;
  id: SectionId;
};

type IconItem = {
  icon: ReactNode;
  title: string;
  description: string;
};

const navItems: NavItem[] = [
  { label: 'خانه', id: 'hero' },
  { label: 'خدمات', id: 'services' },
  { label: 'نحوه کار', id: 'process' },
  { label: 'مزیت‌ها', id: 'features' },
  { label: 'تماس با ما', id: 'contact' },
];

const services: IconItem[] = [
  {
    icon: <Inventory2OutlinedIcon />,
    title: 'ثبت مرسوله آنلاین',
    description: 'اطلاعات ارسال را در چند قدم کوتاه ثبت کنید و درخواست خود را به‌سادگی مدیریت کنید.',
  },
  {
    icon: <LocalShippingOutlinedIcon />,
    title: 'هماهنگی جمع‌آوری',
    description: 'بعد از ثبت درخواست، فرآیند جمع‌آوری و ارسال با هماهنگی روشن دنبال می‌شود.',
  },
  {
    icon: <TrackChangesOutlinedIcon />,
    title: 'پیگیری تا تحویل',
    description: 'وضعیت مرسوله را از شروع مسیر تا رسیدن به مقصد، شفاف و قابل پیگیری ببینید.',
  },
];

const benefits: IconItem[] = [
  {
    icon: <ShieldOutlinedIcon />,
    title: 'شفافیت در هر مرحله',
    description: 'اطلاعات و وضعیت مرسوله در طول مسیر، قابل مشاهده و قابل اتکا می‌ماند.',
  },
  {
    icon: <ScheduleOutlinedIcon />,
    title: 'فرآیند ساده و سریع',
    description: 'برای ثبت و مدیریت ارسال، مسیر ساده‌ای طراحی شده تا وقت شما گرفته نشود.',
  },
  {
    icon: <SupportAgentOutlinedIcon />,
    title: 'پشتیبانی در مسیر',
    description: 'هر زمان نیاز به راهنمایی داشته باشید، تیم پشتیبانی کنار شماست.',
  },
  {
    icon: <BusinessOutlinedIcon />,
    title: 'مناسب خانه و کسب‌وکار',
    description: 'ارسال‌های شخصی و شرکتی را با یک تجربه‌ی یکپارچه مدیریت کنید.',
  },
];

const processSteps = [
  { number: '۱', title: 'درخواستت را ثبت کن', description: 'مبدا، مقصد و مشخصات مرسوله را وارد کن.' },
  { number: '۲', title: 'جمع‌آوری هماهنگ می‌شود', description: 'جزئیات درخواستت بررسی و روند جمع‌آوری پیگیری می‌شود.' },
  { number: '۳', title: 'تا تحویل همراهت هستیم', description: 'وضعیت مرسوله را دنبال کن و با خیال راحت منتظر تحویل باش.' },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Box sx={{ maxWidth: 690, mb: { xs: 5, md: 7 } }}>
      <Typography sx={{ color: 'primary.main', fontSize: 13, fontWeight: 800, letterSpacing: 0.2, mb: 1.5 }}>
        {eyebrow}
      </Typography>
      <Typography component="h2" sx={{ color: '#17231e', fontSize: { xs: 28, md: 40 }, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.35, mb: 1.5 }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#65746c', fontSize: { xs: 15, md: 17 }, lineHeight: 1.95 }}>
        {description}
      </Typography>
    </Box>
  );
}

function IconTile({ icon }: { icon: ReactNode }) {
  return (
    <Box sx={{ alignItems: 'center', bgcolor: '#e6f4ee', borderRadius: 3, color: 'primary.main', display: 'flex', height: 54, justifyContent: 'center', width: 54, '& svg': { fontSize: 27 } }}>
      {icon}
    </Box>
  );
}

export default function Home() {
  const [currentSection, setCurrentSection] = useState<SectionId>('hero');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) setCurrentSection(visibleEntry.target.id as SectionId);
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.15, 0.4] }
    );

    const sections = document.querySelectorAll<HTMLElement>('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: SectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const drawer = (
    <Box role="presentation" sx={{ bgcolor: '#ffffff', direction: 'rtl', minHeight: '100%', p: 2, width: { xs: 292, sm: 340 } }}>
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <img src="/images/logo.svg" alt="لوگوی تیپاکس پونک" style={{ height: 31, width: 31 }} />
          <Typography sx={{ color: '#075c3e', fontSize: 17, fontWeight: 800 }}>تیپاکس پونک</Typography>
        </Box>
        <IconButton aria-label="بستن منو" onClick={() => setMobileOpen(false)}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.75 }}>
        {navItems.map((item) => (
          <Button key={item.id} onClick={() => scrollToSection(item.id)} sx={{ color: currentSection === item.id ? '#075c3e' : '#65746c', justifyContent: 'flex-start', minHeight: 48, px: 1.5, textAlign: 'right', '&:hover': { bgcolor: '#e6f4ee' } }}>
            {item.label}
          </Button>
        ))}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Button fullWidth variant="contained" href="/login" endIcon={<ArrowBackRoundedIcon />}>
        ورود به حساب
      </Button>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f3f7f4', color: '#17231e', direction: 'rtl', overflow: 'hidden' }}>
      <AppBar position="sticky" elevation={0} sx={{ backdropFilter: 'blur(18px)', bgcolor: 'rgba(255,255,255,0.88)', borderBottom: '1px solid rgba(225,234,229,0.9)', color: '#17231e', zIndex: 20 }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: { xs: 70, md: 78 } }}>
            <Box component="a" href="/" sx={{ alignItems: 'center', display: 'flex', gap: 1.1, textDecoration: 'none' }}>
              <img src="/images/logo.svg" alt="لوگوی تیپاکس پونک" style={{ height: 36, width: 36 }} />
              <Box>
                <Typography sx={{ color: '#075c3e', fontSize: { xs: 16, md: 18 }, fontWeight: 900, lineHeight: 1.15 }}>تیپاکس پونک</Typography>
                <Typography sx={{ color: '#65746c', fontSize: 10.5, mt: 0.35 }}>ارسال مطمئن، مسیر روشن</Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }} />
            <Box sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    color: currentSection === item.id ? '#075c3e' : '#65746c',
                    fontSize: 14,
                    fontWeight: currentSection === item.id ? 800 : 600,
                    minHeight: 42,
                    px: 1.45,
                    position: 'relative',
                    '&::after': currentSection === item.id ? { bgcolor: '#f4c400', borderRadius: 99, bottom: 3, content: '""', height: 3, left: '35%', position: 'absolute', right: '35%' } : undefined,
                    '&:hover': { bgcolor: '#e6f4ee', color: '#075c3e' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <Button variant="contained" href="/login" endIcon={<ArrowBackRoundedIcon />} sx={{ display: { xs: 'none', md: 'inline-flex' }, minWidth: 142 }}>
              ثبت مرسوله
            </Button>
            <IconButton aria-label="باز کردن منو" onClick={() => setMobileOpen(true)} sx={{ color: '#075c3e', display: { xs: 'inline-flex', md: 'none' } }}>
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}>
        {drawer}
      </Drawer>

      <Box id="hero" data-section component="section" sx={{ bgcolor: '#f3f8f5', minHeight: { xs: 'auto', md: 'calc(100svh - 78px)' }, position: 'relative', '&::before': { background: 'radial-gradient(circle, rgba(8,120,79,0.14) 0, rgba(8,120,79,0) 70%)', content: '""', height: 580, position: 'absolute', right: '-14rem', top: '-10rem', width: 580 } }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ alignItems: 'center', display: 'grid', gap: { xs: 5, md: 7 }, gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' }, minHeight: { xs: 'auto', md: 'calc(100svh - 78px)' }, pb: { xs: 7, md: 5 }, pt: { xs: 5, md: 3 } }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Chip icon={<CheckCircleRoundedIcon />} label="سامانه ثبت و پیگیری مرسوله" sx={{ bgcolor: '#e6f4ee', color: '#075c3e', fontSize: 12, fontWeight: 800, mb: 2.5, '& .MuiChip-icon': { color: '#08784f', fontSize: 18 } }} />
              <Typography component="h1" sx={{ color: '#13251d', fontSize: { xs: 34, sm: 42, md: 56 }, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: { xs: 1.35, md: 1.3 }, maxWidth: 650, mb: 2.5, mx: { xs: 'auto', md: 0 } }}>
                ارسال مرسوله، با خیال راحت و یک قدم ساده
              </Typography>
              <Typography sx={{ color: '#5f7168', fontSize: { xs: 16, md: 18 }, lineHeight: 2, maxWidth: 590, mb: 3.5, mx: { xs: 'auto', md: 0 } }}>
                از ثبت درخواست تا هماهنگی جمع‌آوری و تحویل، همه‌چیز شفاف و قابل پیگیری است؛ برای خانه و کسب‌وکار.
              </Typography>
              <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Button variant="contained" href="/login" endIcon={<ArrowBackRoundedIcon />} sx={{ minWidth: 158, py: 1.35 }}>ثبت مرسوله</Button>
                <Button variant="outlined" onClick={() => scrollToSection('services')} endIcon={<KeyboardArrowDownRoundedIcon />} sx={{ borderColor: '#b8cec2', color: '#075c3e', minWidth: 158, py: 1.35, '&:hover': { bgcolor: '#e6f4ee', borderColor: '#08784f' } }}>آشنایی با خدمات</Button>
              </Box>
              <Button href="/intro" endIcon={<ArrowOutwardRoundedIcon />} sx={{ color: '#65746c', fontSize: 13, mt: 2, px: 0, '&:hover': { bgcolor: 'transparent', color: '#08784f' } }}>راهنمای شروع برای کاربران جدید</Button>
              <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: { xs: 'center', md: 'flex-start' }, mt: 3 }}>
                {['ثبت آنلاین', 'پیگیری ساده', 'پشتیبانی پاسخ‌گو'].map((item) => (
                  <Box key={item} sx={{ alignItems: 'center', color: '#5f7168', display: 'flex', fontSize: 13, gap: 0.65 }}><CheckCircleRoundedIcon sx={{ color: '#08784f', fontSize: 17 }} />{item}</Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: { xs: 350, md: 500 }, position: 'relative' }}>
              <Box sx={{ bgcolor: '#dcefe5', borderRadius: { xs: '34px', md: '48px' }, height: { xs: 300, md: 430 }, position: 'absolute', right: { xs: '5%', md: '4%' }, top: { xs: 25, md: 20 }, transform: 'rotate(5deg)', width: { xs: '90%', md: '88%' } }} />
              <Box sx={{ alignItems: 'center', bgcolor: '#ffffff', border: '1px solid #d8e9df', borderRadius: { xs: '34px', md: '48px' }, boxShadow: '0 28px 70px rgba(22, 67, 46, 0.13)', display: 'flex', height: { xs: 300, md: 430 }, justifyContent: 'center', overflow: 'hidden', position: 'relative', width: { xs: '90%', md: '88%' } }}>
                <Box sx={{ bgcolor: '#f4c400', borderRadius: 99, height: 12, position: 'absolute', right: 36, top: 30, width: 12 }} />
                <img src="/images/delivery.png" alt="تصویر ارسال مرسوله در تیپاکس پونک" style={{ animation: 'landingFloat 6s ease-in-out infinite', maxWidth: '86%', position: 'relative', width: 390 }} />
              </Box>
              <Card sx={{ alignItems: 'center', border: '1px solid #e1eae5', borderRadius: 3, display: 'flex', gap: 1.2, left: { xs: 0, md: -12 }, p: 1.5, position: 'absolute', top: { xs: 20, md: 58 } }}>
                <Box sx={{ alignItems: 'center', bgcolor: '#e6f4ee', borderRadius: 2, color: '#08784f', display: 'flex', height: 38, justifyContent: 'center', width: 38 }}><TrackChangesOutlinedIcon sx={{ fontSize: 21 }} /></Box>
                <Box><Typography sx={{ color: '#17231e', fontSize: 12, fontWeight: 800 }}>پیگیری تا تحویل</Typography><Typography sx={{ color: '#65746c', fontSize: 10.5, mt: 0.25 }}>مسیر مرسوله شفاف می‌ماند</Typography></Box>
              </Card>
              <Card sx={{ alignItems: 'center', border: '1px solid #e1eae5', borderRadius: 3, bottom: { xs: 18, md: 52 }, display: 'flex', gap: 1.2, p: 1.5, position: 'absolute', right: { xs: 0, md: -16 } }}>
                <Box sx={{ alignItems: 'center', bgcolor: '#fff8d9', borderRadius: 2, color: '#a27d00', display: 'flex', height: 38, justifyContent: 'center', width: 38 }}><LocalShippingOutlinedIcon sx={{ fontSize: 21 }} /></Box>
                <Box><Typography sx={{ color: '#17231e', fontSize: 12, fontWeight: 800 }}>آماده‌ی حرکت</Typography><Typography sx={{ color: '#65746c', fontSize: 10.5, mt: 0.25 }}>هماهنگی ساده و روشن</Typography></Box>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Card sx={{ borderRadius: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, mb: { xs: 8, md: 12 }, mt: { xs: 0, md: -3 }, overflow: 'hidden' }}>
          {[
            { icon: <Inventory2OutlinedIcon />, title: 'فرآیند روشن', text: 'از ثبت تا تحویل' },
            { icon: <TrackChangesOutlinedIcon />, title: 'پیگیری آنلاین', text: 'وضعیت قابل مشاهده' },
            { icon: <SupportAgentOutlinedIcon />, title: 'پشتیبانی پاسخ‌گو', text: 'همراه شما در مسیر' },
          ].map((item, index) => (
            <Box key={item.title} sx={{ alignItems: 'center', borderLeft: { xs: 'none', sm: index < 2 ? '1px solid #e1eae5' : 'none' }, borderBottom: { xs: index < 2 ? '1px solid #e1eae5' : 'none', sm: 'none' }, display: 'flex', gap: 1.5, minHeight: 94, p: { xs: 2.5, sm: 2 } }}>
              <Box sx={{ alignItems: 'center', bgcolor: '#e6f4ee', borderRadius: 2.5, color: '#08784f', display: 'flex', flexShrink: 0, height: 42, justifyContent: 'center', width: 42 }}>{item.icon}</Box>
              <Box><Typography sx={{ color: '#17231e', fontSize: 14, fontWeight: 800 }}>{item.title}</Typography><Typography sx={{ color: '#65746c', fontSize: 12.5, mt: 0.4 }}>{item.text}</Typography></Box>
            </Box>
          ))}
        </Card>
      </Container>

      <Box id="services" data-section component="section" sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <SectionHeading eyebrow="یک تجربه‌ی یکپارچه برای ارسال" title="همه‌چیز برای یک ارسال مطمئن آماده است" description="تیپاکس پونک مسیر ارسال را کوتاه و قابل فهم می‌کند؛ از اولین کلیک تا لحظه‌ای که مرسوله به مقصد می‌رسد." />
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            {services.map((service, index) => (
              <Card component="article" key={service.title} sx={{ borderRadius: 3.5, minHeight: 248, p: { xs: 2.75, md: 3.25 }, position: 'relative', transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease', '&:hover': { borderColor: '#a9cbbb', boxShadow: '0 18px 40px rgba(22, 67, 46, 0.12)', transform: 'translateY(-6px)' }, '&::before': { bgcolor: index === 1 ? '#f4c400' : '#08784f', borderRadius: 99, content: '""', height: 4, position: 'absolute', right: 26, top: 0, width: 42 } }}>
                <IconTile icon={service.icon} />
                <Typography sx={{ color: '#17231e', fontSize: 18, fontWeight: 800, mt: 2.5 }}>{service.title}</Typography>
                <Typography sx={{ color: '#65746c', fontSize: 14, lineHeight: 1.95, mt: 1.2 }}>{service.description}</Typography>
                <ArrowOutwardRoundedIcon sx={{ bottom: 24, color: '#a2b7ab', fontSize: 20, left: 24, position: 'absolute', transform: 'rotate(90deg)' }} />
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="process" data-section component="section" sx={{ bgcolor: '#e6f4ee', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ alignItems: 'center', display: 'grid', gap: { xs: 5, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' } }}>
            <Box sx={{ order: { xs: 2, md: 1 } }}>
              <Box sx={{ bgcolor: '#075c3e', borderRadius: 5, boxShadow: '0 24px 60px rgba(7,92,62,0.2)', minHeight: { xs: 360, md: 450 }, overflow: 'hidden', p: { xs: 3, md: 4 }, position: 'relative' }}>
                <Box sx={{ bgcolor: 'rgba(244,196,0,0.2)', borderRadius: '50%', height: 300, position: 'absolute', right: -100, top: -90, width: 300 }} />
                <Typography sx={{ color: '#cce8d9', fontSize: 13, fontWeight: 700, position: 'relative' }}>مسیر ارسال تو، روشن و قابل پیگیری</Typography>
                <Box sx={{ alignItems: 'center', display: 'flex', height: 245, justifyContent: 'center', position: 'relative' }}><img src="/images/boxes.png" alt="تصویر بسته‌های آماده ارسال" style={{ maxWidth: 210, width: '55%' }} /></Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 3, p: 2, position: 'relative' }}><Box sx={{ alignItems: 'center', display: 'flex', gap: 1.2 }}><CheckCircleRoundedIcon sx={{ color: '#f4c400', fontSize: 22 }} /><Typography sx={{ color: '#ffffff', fontSize: 13, fontWeight: 700 }}>هر مرحله، یک قدم نزدیک‌تر به مقصد</Typography></Box></Box>
              </Box>
            </Box>
            <Box sx={{ order: { xs: 1, md: 2 } }}>
              <SectionHeading eyebrow="از ثبت تا تحویل" title="ساده شروع کن، شفاف ادامه بده" description="در تیپاکس پونک لازم نیست بین چند ابزار و پیام مختلف جابه‌جا شوی. مسیر ارسال از ابتدا تا انتها یک‌جا و قابل فهم دنبال می‌شود." />
              <Box sx={{ display: 'grid', gap: 2.5 }}>
                {processSteps.map((step, index) => (
                  <Box key={step.number} sx={{ alignItems: 'flex-start', display: 'flex', gap: 2.2, position: 'relative' }}>
                    {index < processSteps.length - 1 && <Box sx={{ bgcolor: '#b7d9c5', bottom: -28, height: 32, position: 'absolute', right: 19, width: 1 }} />}
                    <Box sx={{ alignItems: 'center', bgcolor: index === 1 ? '#f4c400' : '#075c3e', borderRadius: 2.5, color: index === 1 ? '#17231e' : '#ffffff', display: 'flex', flexShrink: 0, fontSize: 16, fontWeight: 900, height: 40, justifyContent: 'center', width: 40 }}>{step.number}</Box>
                    <Box><Typography sx={{ color: '#17231e', fontSize: 16, fontWeight: 800 }}>{step.title}</Typography><Typography sx={{ color: '#65746c', fontSize: 13.5, lineHeight: 1.8, mt: 0.45 }}>{step.description}</Typography></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box id="features" data-section component="section" sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gap: { xs: 5, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.2fr' } }}>
            <Box sx={{ bgcolor: '#075c3e', borderRadius: 5, color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: { xs: 290, md: 420 }, overflow: 'hidden', p: { xs: 3.5, md: 4.5 }, position: 'relative' }}>
              <Box sx={{ bgcolor: 'rgba(244,196,0,0.18)', borderRadius: '50%', height: 220, position: 'absolute', right: -70, top: -75, width: 220 }} />
              <Box sx={{ position: 'relative' }}><Typography sx={{ color: '#f4c400', fontSize: 13, fontWeight: 800, mb: 2 }}>برای هر نوع ارسال</Typography><Typography component="h2" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.5, maxWidth: 300 }}>تجربه‌ای که با نیاز تو هماهنگ می‌شود</Typography></Box>
              <Box sx={{ position: 'relative' }}><Typography sx={{ color: '#cce8d9', fontSize: 14, lineHeight: 1.9, mb: 2.5, maxWidth: 330 }}>چه برای یک بسته‌ی شخصی و چه برای ارسال‌های کاری، همه‌چیز را ساده و قابل مدیریت نگه داشته‌ایم.</Typography><Button href="/login" variant="contained" endIcon={<ArrowBackRoundedIcon />} sx={{ bgcolor: '#ffffff', color: '#075c3e', '&:hover': { bgcolor: '#f4c400' } }}>ورود به پنل</Button></Box>
            </Box>
            <Box>
              <SectionHeading eyebrow="چرا تیپاکس پونک؟" title="جزئیات کمتر، اطمینان بیشتر" description="هر بخش از تجربه‌ی تیپاکس پونک برای این طراحی شده که ارسال مرسوله، قابل پیش‌بینی و بدون پیچیدگی باشد." />
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                {benefits.map((benefit) => (
                  <Card key={benefit.title} sx={{ borderRadius: 3, minHeight: 174, p: 2.25 }}><IconTile icon={benefit.icon} /><Typography sx={{ color: '#17231e', fontSize: 15, fontWeight: 800, mt: 1.8 }}>{benefit.title}</Typography><Typography sx={{ color: '#65746c', fontSize: 12.5, lineHeight: 1.85, mt: 0.7 }}>{benefit.description}</Typography></Card>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box id="cta" component="section" sx={{ bgcolor: '#f4c400', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg"><Box sx={{ alignItems: { xs: 'flex-start', md: 'center' }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'space-between' }}><Box><Typography component="h2" sx={{ color: '#17231e', fontSize: { xs: 23, md: 30 }, fontWeight: 900, letterSpacing: '-0.03em' }}>آماده‌ای مسیر ارسال را ساده‌تر کنی؟</Typography><Typography sx={{ color: '#4c4b25', fontSize: 14, lineHeight: 1.9, mt: 0.7 }}>همین حالا وارد پنل شو و ثبت مرسوله را شروع کن.</Typography></Box><Button href="/login" variant="contained" endIcon={<ArrowBackRoundedIcon />} sx={{ bgcolor: '#075c3e', minWidth: 170, '&:hover': { bgcolor: '#0b7650' } }}>شروع ارسال</Button></Box></Container>
      </Box>

      <Box id="contact" data-section component="footer" sx={{ bgcolor: '#0d2d22', color: '#ffffff', pt: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gap: { xs: 4, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' }, pb: 6 }}>
            <Box><Box sx={{ alignItems: 'center', display: 'flex', gap: 1.1, mb: 2 }}><img src="/images/logo.svg" alt="لوگوی تیپاکس پونک" style={{ filter: 'brightness(0) invert(1)', height: 36, width: 36 }} /><Typography sx={{ fontSize: 19, fontWeight: 900 }}>تیپاکس پونک</Typography></Box><Typography sx={{ color: '#b9d1c3', fontSize: 14, lineHeight: 2, maxWidth: 360 }}>یک تجربه‌ی ساده و شفاف برای ثبت، پیگیری و مدیریت ارسال مرسوله.</Typography></Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
              <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 1.2 }}><LocationOnOutlinedIcon sx={{ color: '#f4c400', fontSize: 22, mt: 0.3 }} /><Box><Typography sx={{ color: '#ffffff', fontSize: 13, fontWeight: 800 }}>آدرس</Typography><Typography sx={{ color: '#b9d1c3', fontSize: 12, lineHeight: 1.9, mt: 0.7 }}>جنت‌آباد، شاهین شمالی، لاله هشتم، کوچه شبنم، پلاک ۴</Typography></Box></Box>
              <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 1.2 }}><PhoneInTalkOutlinedIcon sx={{ color: '#f4c400', fontSize: 22, mt: 0.3 }} /><Box><Typography sx={{ color: '#ffffff', fontSize: 13, fontWeight: 800 }}>شماره تماس</Typography><Typography component="a" href="tel:+982144411332" sx={{ color: '#b9d1c3', direction: 'ltr', display: 'block', fontSize: 13, mt: 0.7, textDecoration: 'none' }}>۰۲۱-۴۴۴۱۱۳۳۲</Typography></Box></Box>
              <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 1.2 }}><EmailOutlinedIcon sx={{ color: '#f4c400', fontSize: 22, mt: 0.3 }} /><Box><Typography sx={{ color: '#ffffff', fontSize: 13, fontWeight: 800 }}>ایمیل</Typography><Typography component="a" href="mailto:info@tpoonak.com.ir" sx={{ color: '#b9d1c3', direction: 'ltr', display: 'block', fontSize: 12, mt: 0.7, textDecoration: 'none', wordBreak: 'break-word' }}>info@tpoonak.com.ir</Typography></Box></Box>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(207,231,216,0.16)' }} />
          <Box sx={{ alignItems: 'center', color: '#8eaea0', display: 'flex', flexWrap: 'wrap', fontSize: 11.5, gap: 1, justifyContent: 'space-between', py: 2.5 }}><span>© {new Date().getFullYear()} تیپاکس پونک؛ همه حقوق محفوظ است.</span><Typography component="a" href="/login" sx={{ color: '#b9d1c3', fontSize: 12, textDecoration: 'none' }}>ورود به پنل کاربری</Typography></Box>
        </Container>
      </Box>

      <style jsx global>{`
        @keyframes landingFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </Box>
  );
}
