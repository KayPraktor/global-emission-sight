import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, Loader2 } from 'lucide-react';
import { cbamReportServicePersian } from '@/services/cbamReportServicePersian';
import { persianLabels } from '@/utils/persianHelpers';

export const CBAMReportGeneratorPersian = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      await cbamReportServicePersian.generateSampleCBAMReport();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card dir="rtl" className="font-sans">
      <CardHeader>
        <CardTitle className="text-right">گزارش CBAM فارسی</CardTitle>
        <CardDescription className="text-right">
          تولید گزارش‌های اظهارنامه CBAM اتحادیه اروپا به زبان فارسی با تاریخ شمسی و اعداد فارسی
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sample" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sample">{persianLabels.quickSampleReport}</TabsTrigger>
            <TabsTrigger value="custom">{persianLabels.customReport}</TabsTrigger>
          </TabsList>

          <TabsContent value="sample" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-right">
              <h4 className="font-medium mb-2">گزارش نمونه شامل:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>فولاد مبارکه اصفهان - محصولات نیمه‌تمام آهنی</li>
                <li>آلومینیوم ایران (ایرالکو) - آلومینیوم خام</li>
                <li>سیمان تهران - سیمان پرتلند</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                تاریخ‌ها به شمسی، اعداد به فارسی و متن راست‌چین خواهد بود.
              </p>
            </div>

            <Button 
              onClick={handleGenerateSample} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {persianLabels.generating}
                </>
              ) : (
                <>
                  <FileDown className="ml-2 h-4 w-4" />
                  {persianLabels.downloadSampleReport}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-right">
              <p className="text-sm text-muted-foreground">
                گزارش سفارشی فارسی به زودی در دسترس خواهد بود. فعلاً از گزارش نمونه استفاده کنید.
              </p>
            </div>
            <Button 
              onClick={handleGenerateSample} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {persianLabels.generating}
                </>
              ) : (
                <>
                  <FileDown className="ml-2 h-4 w-4" />
                  {persianLabels.generateReport}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
