import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  TrendingUp, 
  Factory, 
  Zap, 
  Truck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText
} from 'lucide-react';

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

interface PreviewProps {
  stepId: string;
}

export function TourStepPreview({ stepId }: PreviewProps) {
  const renderPreview = () => {
    switch (stepId) {
      case 'dashboard':
        return <DashboardPreview />;
      case 'data-entry':
        return <DataEntryPreview />;
      case 'analytics':
        return <AnalyticsPreview />;
      case 'compliance':
        return <CompliancePreview />;
      case 'reports':
        return <ReportsPreview />;
      case 'goals':
        return <GoalsPreview />;
      default:
        return <DashboardPreview />;
    }
  };

  return (
    <div className="p-4 bg-muted/30 min-h-[300px]">
      {renderPreview()}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-3 bg-background">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">
                <Factory className="h-4 w-4 text-primary" />
              </div>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground">Scope 1</div>
              <div className="text-lg font-bold">{toPersianNumber(1234)} tCO₂e</div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-3 bg-background">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Zap className="h-4 w-4 text-secondary" />
              </div>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground">Scope 2</div>
              <div className="text-lg font-bold">{toPersianNumber(856)} tCO₂e</div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-3 bg-background">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Truck className="h-4 w-4 text-orange-500" />
              </div>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground">Scope 3</div>
              <div className="text-lg font-bold">{toPersianNumber(2890)} tCO₂e</div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Chart Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4 bg-background">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">روند انتشارات</span>
            <Badge variant="secondary" className="text-xs">۱۲ ماه اخیر</Badge>
          </div>
          <div className="h-24 flex items-end gap-1">
            {[65, 72, 68, 75, 70, 62, 58, 55, 50, 48, 45, 42].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                className="flex-1 bg-primary/80 rounded-t"
              />
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function DataEntryPreview() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-background">
          <div className="text-sm font-medium mb-3">ثبت انتشارات جدید</div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs text-muted-foreground">نوع فعالیت:</div>
              <div className="flex-1 h-8 bg-muted rounded-md flex items-center px-3 text-sm">
                مصرف برق
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs text-muted-foreground">مقدار:</div>
              <div className="flex-1 h-8 bg-muted rounded-md flex items-center px-3 text-sm" dir="ltr">
                12,500 kWh
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 text-xs text-muted-foreground">انتشار محاسبه شده:</div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex-1 h-8 bg-primary/10 border border-primary/20 rounded-md flex items-center px-3 text-sm font-medium text-primary"
              >
                {toPersianNumber(5.2)} tCO₂e
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-md"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>اعتبارسنجی خودکار: ضریب انتشار به‌روز است</span>
      </motion.div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-background">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">تشخیص ناهنجاری</span>
            <Badge variant="destructive" className="text-xs">۲ هشدار</Badge>
          </div>
          <div className="space-y-2">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800"
            >
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-xs">افزایش غیرعادی مصرف گاز در آذر ماه</span>
            </motion.div>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800"
            >
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-xs">داده‌های ناقص در Scope 3 - دسته ۴</span>
            </motion.div>
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 bg-background">
          <div className="text-sm font-medium mb-2">پیش‌بینی هوش مصنوعی</div>
          <div className="text-xs text-muted-foreground mb-2">انتشارات تا پایان سال:</div>
          <div className="text-2xl font-bold text-primary">{toPersianNumber(4850)} tCO₂e</div>
          <div className="text-xs text-green-600">↓ {toPersianNumber(12)}٪ کمتر از سال گذشته</div>
        </Card>
      </motion.div>
    </div>
  );
}

function CompliancePreview() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-background">
          <div className="text-sm font-medium mb-3">ددلاین‌های پیش رو</div>
          <div className="space-y-3">
            {[
              { name: 'CDP Climate', date: '۱۵ تیر ۱۴۰۴', status: 'urgent', days: 12 },
              { name: 'TCFD Report', date: '۳۰ مرداد ۱۴۰۴', status: 'upcoming', days: 58 },
              { name: 'ISO 14064', date: '۱ آبان ۱۴۰۴', status: 'ok', days: 120 },
            ].map((deadline, i) => (
              <motion.div
                key={deadline.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{deadline.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{deadline.date}</span>
                  <Badge 
                    variant={deadline.status === 'urgent' ? 'destructive' : deadline.status === 'upcoming' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {toPersianNumber(deadline.days)} روز
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ReportsPreview() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-background">
          <div className="text-sm font-medium mb-3">قالب‌های گزارش</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'ISO 14064', icon: FileText, color: 'primary' },
              { name: 'CBAM Report', icon: FileText, color: 'secondary' },
              { name: 'گزارش ماهانه', icon: FileText, color: 'orange' },
              { name: 'گزارش مدیریتی', icon: FileText, color: 'green' },
            ].map((template, i) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-3 bg-muted/50 rounded-md text-center cursor-pointer hover:bg-muted transition-colors"
              >
                <FileText className={`h-6 w-6 mx-auto mb-2 text-${template.color === 'primary' ? 'primary' : template.color === 'secondary' ? 'secondary' : template.color + '-500'}`} />
                <span className="text-xs font-medium">{template.name}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function GoalsPreview() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-background">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">هدف Net Zero ۲۰۳۰</span>
            <Badge variant="outline" className="text-xs">{toPersianNumber(45)}٪ پیشرفت</Badge>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Progress value={45} className="h-3" />
          </motion.div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>مبدا: {toPersianNumber(10000)} tCO₂e</span>
            <span>هدف: {toPersianNumber(5500)} tCO₂e</span>
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4 bg-background">
          <div className="text-sm font-medium mb-2">نقاط عطف</div>
          <div className="space-y-2">
            {[
              { year: '۱۴۰۳', target: '۲۰٪ کاهش', done: true },
              { year: '۱۴۰۵', target: '۳۵٪ کاهش', done: false },
              { year: '۱۴۰۹', target: '۵۰٪ کاهش', done: false },
            ].map((milestone, i) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 text-xs"
              >
                {milestone.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={milestone.done ? 'text-green-600' : 'text-muted-foreground'}>
                  {milestone.year}: {milestone.target}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
