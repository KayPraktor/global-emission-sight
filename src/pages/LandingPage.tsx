import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2,
  LineChart,
  Shield,
  Zap,
  Building2,
  Target,
  ArrowLeft,
  Play
} from 'lucide-react';
import { InteractiveProductTour } from '@/components/ProductTour/InteractiveProductTour';
import { DemoVideoSection } from '@/components/ProductTour/DemoVideoSection';

// Helper to convert numbers to Persian numerals
const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

// Format currency in Persian
const formatPersianCurrency = (num: number): string => {
  return toPersianNumber(num.toLocaleString()) + ' دلار';
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [tourOpen, setTourOpen] = useState(false);
  const [roiInputs, setRoiInputs] = useState({
    consultantFees: 120000,
    fteHours: 40,
    missedDeadlines: 2
  });

  const calculateROI = () => {
    const consultantSavings = roiInputs.consultantFees * 0.6;
    const timeSavings = roiInputs.fteHours * 52 * 75 * 0.6;
    const penaltyAvoidance = roiInputs.missedDeadlines * 50000;
    const totalAnnualSavings = consultantSavings + timeSavings + penaltyAvoidance;
    const platformCost = 25000;
    const netSavings = totalAnnualSavings - platformCost;
    const roi = ((netSavings / platformCost) * 100).toFixed(0);
    const paybackMonths = ((platformCost / totalAnnualSavings) * 12).toFixed(1);
    
    return { totalAnnualSavings, roi, paybackMonths };
  };

  const { totalAnnualSavings, roi, paybackMonths } = calculateROI();

  const painPoints = [
    {
      icon: Clock,
      title: "غرق در صفحات اکسل هستید؟",
      description: "تیم‌های معاونت پایداری بیش از ۴۰ ساعت در ماه را صرف تجمیع دستی داده‌ها و گزارش‌گیری می‌کنند",
      color: "text-destructive"
    },
    {
      icon: AlertCircle,
      title: "از دست دادن ددلاین‌های CDP نگرانتان می‌کند؟",
      description: "شکست ممیزی و جریمه‌های عدم انطباق می‌تواند بیش از ۱۰۰ هزار دلار هزینه و اعتماد ذینفعان را خدشه‌دار کند",
      color: "text-orange-500"
    },
    {
      icon: DollarSign,
      title: "هزینه‌های مشاوران بودجه‌تان را می‌بلعد؟",
      description: "مشاوران خارجی سالانه ۱۲۰ تا ۲۵۰ هزار دلار برای کاری که پلتفرم ما خودکار انجام می‌دهد، هزینه می‌کنند",
      color: "text-destructive"
    },
    {
      icon: Target,
      title: "مدیرعامل از پیشرفت Net Zero می‌پرسد؟",
      description: "داشبوردهای مدیریتی که به سوالات مدیران در چند ثانیه پاسخ می‌دهند، نه چند هفته",
      color: "text-primary"
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "کاهش ۶۰٪ زمان گزارش‌گیری",
      description: "اعتبارسنجی خودکار داده‌ها و تولید گزارش"
    },
    {
      icon: Shield,
      title: "هرگز یک ددلاین انطباق را از دست ندهید",
      description: "پیگیری خودکار CDP، TCFD، CSRD، SBTi"
    },
    {
      icon: Zap,
      title: "تشخیص ناهنجاری با هوش مصنوعی",
      description: "کشف خطاهای داده قبل از تبدیل شدن به مشکلات ممیزی"
    },
    {
      icon: LineChart,
      title: "داشبوردهای مدیریتی",
      description: "دید لحظه‌ای به پیشرفت Net Zero و شاخص‌های کلیدی عملکرد"
    }
  ];

  const complianceLogos = ['CDP', 'TCFD', 'CSRD', 'SBTi', 'GRI', 'ISO 14064'];

  return (
    <div dir="rtl" className="min-h-screen bg-background font-persian">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-heading">کربن‌ترک</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/roi-calculator')}>
                محاسبه‌گر بازگشت سرمایه
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                ورود
              </Button>
              <Button onClick={() => navigate('/auth')}>
                شروع دوره آزمایشی رایگان
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-relaxed">
              دیگر {toPersianNumber(40)} ساعت در ماه برای{' '}
              <span className="gradient-heading">انطباق کربنی</span>
              {' '}وقت نگذارید
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 font-medium leading-relaxed">
              گزارش‌گیری خودکار، جلوگیری از شکست ممیزی، پیگیری پیشرفت Net Zero - همه در یک پلتفرم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg h-12 px-8" onClick={() => navigate('/auth')}>
                شروع دوره آزمایشی رایگان
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => setTourOpen(true)}>
                <Play className="ml-2 h-5 w-5" />
                مشاهده دمو
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              بدون نیاز به کارت اعتباری • {toPersianNumber(14)} روز دوره آزمایشی رایگان
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <DemoVideoSection onOpenTour={() => setTourOpen(true)} />

      {/* Pain Points Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              مشکلاتی که حل می‌کنیم
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              معاونین پایداری در صنایع تولیدی با چالش‌های حیاتی مواجه هستند که منابع را هدر می‌دهد و ریسک ایجاد می‌کند
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((pain, index) => (
              <motion.div
                key={pain.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full card-hover">
                  <pain.icon className={`h-12 w-12 mb-4 ${pain.color}`} />
                  <h3 className="text-xl font-semibold mb-3 leading-relaxed">{pain.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pain.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                صرفه‌جویی بالقوه خود را محاسبه کنید
              </h2>
              <p className="text-lg text-muted-foreground">
                شرکت‌هایی مانند شما به طور میانگین سالانه بیش از {toPersianNumber(80)} هزار دلار صرفه‌جویی می‌کنند
              </p>
            </div>

            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="consultantFees">هزینه سالانه مشاوران (دلار)</Label>
                    <Input
                      id="consultantFees"
                      type="number"
                      value={roiInputs.consultantFees}
                      onChange={(e) => setRoiInputs({ ...roiInputs, consultantFees: Number(e.target.value) })}
                      className="mt-2 text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fteHours">ساعات هفتگی کار تمام‌وقت برای انطباق</Label>
                    <Input
                      id="fteHours"
                      type="number"
                      value={roiInputs.fteHours}
                      onChange={(e) => setRoiInputs({ ...roiInputs, fteHours: Number(e.target.value) })}
                      className="mt-2 text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label htmlFor="missedDeadlines">ددلاین‌های از دست رفته در سال</Label>
                    <Input
                      id="missedDeadlines"
                      type="number"
                      value={roiInputs.missedDeadlines}
                      onChange={(e) => setRoiInputs({ ...roiInputs, missedDeadlines: Number(e.target.value) })}
                      className="mt-2 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">صرفه‌جویی سالانه</div>
                    <div className="text-4xl font-bold text-primary">
                      {formatPersianCurrency(totalAnnualSavings)}
                    </div>
                  </div>
                  <div className="p-6 bg-secondary/5 rounded-lg border border-secondary/20">
                    <div className="text-sm text-muted-foreground mb-2">بازگشت سرمایه ۳ ساله</div>
                    <div className="text-4xl font-bold text-secondary">
                      {toPersianNumber(roi)}٪
                    </div>
                  </div>
                  <div className="p-6 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">دوره بازگشت سرمایه</div>
                    <div className="text-4xl font-bold">
                      {toPersianNumber(paybackMonths)} ماه
                    </div>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={() => navigate('/roi-calculator')}>
                مشاهده تحلیل کامل بازگشت سرمایه
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              چرا تولیدکنندگان پیشرو ما را انتخاب می‌کنند
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full card-hover">
                  <feature.icon className="h-10 w-10 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2 leading-relaxed">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-lg text-muted-foreground mb-8">
              مورد اعتماد بیش از {toPersianNumber(50)} شرکت تولیدی
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {complianceLogos.map((logo) => (
                <div key={logo} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">{logo}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-muted-foreground">
              پشتیبانی از انطباق با تمام چارچوب‌های اصلی
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-bl from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              آماده تحول در مدیریت کربن خود هستید؟
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              به تولیدکنندگان پیشرو بپیوندید و انطباق را خودکار و پیشرفت Net Zero را تسریع کنید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg h-12 px-8" onClick={() => navigate('/auth')}>
                شروع دوره آزمایشی رایگان
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" onClick={() => navigate('/roi-calculator')}>
                محاسبه بازگشت سرمایه
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">کربن‌ترک</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {toPersianNumber(2024)} کربن‌ترک. توانمندسازی تولید پایدار.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Tour Modal */}
      <InteractiveProductTour open={tourOpen} onOpenChange={setTourOpen} />
    </div>
  );
}
