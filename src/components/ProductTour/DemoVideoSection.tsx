import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Monitor } from 'lucide-react';
import { BrowserFrame } from './BrowserFrame';

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

interface DemoVideoSectionProps {
  onOpenTour: () => void;
}

export function DemoVideoSection({ onOpenTour }: DemoVideoSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            پلتفرم را از نزدیک ببینید
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            قبل از ثبت‌نام، با امکانات و قابلیت‌های کربن‌ترک آشنا شوید
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div 
            className="relative cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onOpenTour}
          >
            <BrowserFrame url="carbontrack.ir/dashboard">
              {/* Demo Preview Image/Animation */}
              <div className="relative bg-gradient-to-br from-muted/50 to-muted aspect-video">
                {/* Animated Dashboard Preview */}
                <div className="absolute inset-0 p-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: isHovered ? 0.8 : 0.5 }}
                        className="h-20 bg-primary/10 rounded-lg border border-primary/20"
                      />
                    ))}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: isHovered ? 0.8 : 0.5 }}
                    className="h-40 bg-secondary/10 rounded-lg border border-secondary/20"
                  />
                </div>

                {/* Play Button Overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isHovered ? 0.9 : 1 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative p-6 bg-primary rounded-full shadow-lg">
                        <Play className="h-10 w-10 text-primary-foreground fill-current" />
                      </div>
                    </div>
                    <span className="text-lg font-semibold">مشاهده تور محصول</span>
                    <span className="text-sm text-muted-foreground">
                      {toPersianNumber(6)} مرحله • {toPersianNumber(2)} دقیقه
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            </BrowserFrame>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button size="lg" onClick={onOpenTour} className="text-lg h-12 px-8">
              <Monitor className="h-5 w-5 ml-2" />
              شروع تور تعاملی
            </Button>
            <p className="text-sm text-muted-foreground">
              یا مستقیماً{' '}
              <a href="/auth" className="text-primary hover:underline">
                دوره آزمایشی رایگان
              </a>{' '}
              را شروع کنید
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
