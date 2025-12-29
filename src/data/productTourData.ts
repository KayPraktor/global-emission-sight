import { 
  LayoutDashboard, 
  FileInput, 
  BarChart3, 
  Shield, 
  FileText, 
  Target,
  type LucideIcon 
} from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: LucideIcon;
  highlight: string;
}

export const productTourSteps: TourStep[] = [
  {
    id: 'dashboard',
    title: 'داشبورد جامع',
    titleEn: 'Comprehensive Dashboard',
    description: 'دید کامل به انتشارات کربن سازمان در یک نگاه با نمودارهای تعاملی و شاخص‌های کلیدی',
    descriptionEn: 'Complete view of your organization\'s carbon emissions at a glance',
    icon: LayoutDashboard,
    highlight: 'نمایش لحظه‌ای داده‌ها'
  },
  {
    id: 'data-entry',
    title: 'ورود آسان داده‌ها',
    titleEn: 'Easy Data Entry',
    description: 'ثبت سریع و ساده انتشارات با فرم‌های هوشمند و اعتبارسنجی خودکار',
    descriptionEn: 'Quick and simple emissions logging with smart forms',
    icon: FileInput,
    highlight: 'کاهش ۶۰٪ زمان'
  },
  {
    id: 'analytics',
    title: 'تحلیل پیشرفته',
    titleEn: 'Advanced Analytics',
    description: 'تحلیل روندها، شناسایی ناهنجاری‌ها و پیش‌بینی انتشارات با هوش مصنوعی',
    descriptionEn: 'Trend analysis, anomaly detection, and AI-powered forecasting',
    icon: BarChart3,
    highlight: 'هوش مصنوعی'
  },
  {
    id: 'compliance',
    title: 'پیگیری انطباق',
    titleEn: 'Compliance Tracking',
    description: 'مدیریت ددلاین‌های CDP، TCFD، CSRD و سایر چارچوب‌ها با یادآوری خودکار',
    descriptionEn: 'Manage CDP, TCFD, CSRD deadlines with automatic reminders',
    icon: Shield,
    highlight: 'هرگز یک ددلاین را از دست ندهید'
  },
  {
    id: 'reports',
    title: 'گزارش‌های حرفه‌ای',
    titleEn: 'Professional Reports',
    description: 'تولید گزارش‌های استاندارد ISO 14064 و CBAM با یک کلیک',
    descriptionEn: 'Generate ISO 14064 and CBAM compliant reports with one click',
    icon: FileText,
    highlight: 'گزارش با یک کلیک'
  },
  {
    id: 'goals',
    title: 'پیشرفت Net Zero',
    titleEn: 'Net Zero Progress',
    description: 'تعیین اهداف کاهش انتشار و پیگیری پیشرفت با نقشه راه مشخص',
    descriptionEn: 'Set reduction targets and track progress with a clear roadmap',
    icon: Target,
    highlight: 'نقشه راه پایداری'
  }
];
