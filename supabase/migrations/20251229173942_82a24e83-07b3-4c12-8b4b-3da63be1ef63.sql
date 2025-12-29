-- Expand Iran-specific compliance templates for more industries

-- Construction Industry Templates
INSERT INTO industry_compliance_templates (
  industry, framework_name, description, jurisdiction, reporting_frequency,
  required_scopes, key_requirements, typical_deadlines
) VALUES 
-- Construction - Iran
('construction', 'گزارش‌دهی محیط زیستی پروژه‌های عمرانی (MRUD)', 
 'الزامات گزارش‌دهی زیست‌محیطی وزارت راه و شهرسازی برای پروژه‌های ساختمانی',
 'Iran', 'quarterly',
 ARRAY['scope_1', 'scope_2'],
 ARRAY['گزارش مصرف انرژی کارگاه', 'ردیابی مصالح ساختمانی', 'مدیریت نخاله و پسماند', 'گواهی ایمنی محیط کار'],
 '[{"month": 3, "day": 20, "description": "گزارش فصل اول", "description_en": "Q1 Report", "persian_date": "۳۱ خرداد"},
   {"month": 6, "day": 21, "description": "گزارش فصل دوم", "description_en": "Q2 Report", "persian_date": "۳۱ شهریور"},
   {"month": 9, "day": 22, "description": "گزارش فصل سوم", "description_en": "Q3 Report", "persian_date": "۳۰ آذر"},
   {"month": 12, "day": 20, "description": "گزارش سالانه", "description_en": "Annual Report", "persian_date": "۳۰ آذر"}]'::jsonb),

('construction', 'استاندارد ساختمان سبز ایران (ISIRI 22759)',
 'استاندارد ملی ایران برای ساختمان‌های سبز و پایدار',
 'Iran', 'annual',
 ARRAY['scope_1', 'scope_2', 'scope_3'],
 ARRAY['بهره‌وری انرژی', 'مدیریت آب', 'کیفیت محیط داخلی', 'استفاده از مصالح پایدار'],
 '[{"month": 12, "day": 20, "description": "گزارش عملکرد سالانه", "description_en": "Annual Performance Report", "persian_date": "۲۹ اسفند"}]'::jsonb),

('construction', 'HSE پیمانکاری ساختمان',
 'الزامات ایمنی، بهداشت و محیط زیست برای پیمانکاران ساختمانی',
 'Iran', 'monthly',
 ARRAY['scope_1'],
 ARRAY['گزارش حوادث', 'آموزش ایمنی کارگران', 'کنترل گرد و غبار', 'مدیریت پسماند خطرناک'],
 '[{"month": 1, "day": 10, "description": "گزارش ماهانه HSE", "description_en": "Monthly HSE Report", "persian_date": "۲۰ هر ماه"}]'::jsonb),

-- Petrochemical Industry Templates
('petrochemical', 'گزارش‌دهی انتشار NIOC',
 'الزامات گزارش‌دهی انتشار گازهای گلخانه‌ای شرکت ملی نفت ایران',
 'Iran', 'quarterly',
 ARRAY['scope_1', 'scope_2'],
 ARRAY['اندازه‌گیری انتشار فلر', 'ردیابی نشت متان', 'مصرف انرژی واحدها', 'گزارش بهره‌وری انرژی'],
 '[{"month": 4, "day": 20, "description": "گزارش فصل اول", "description_en": "Q1 Report", "persian_date": "۳۱ فروردین"},
   {"month": 7, "day": 22, "description": "گزارش نیمه اول", "description_en": "H1 Report", "persian_date": "۳۱ تیر"},
   {"month": 10, "day": 22, "description": "گزارش فصل سوم", "description_en": "Q3 Report", "persian_date": "۳۰ مهر"},
   {"month": 1, "day": 20, "description": "گزارش سالانه", "description_en": "Annual Report", "persian_date": "۳۰ دی"}]'::jsonb),

('petrochemical', 'مدیریت انتشار VOC (سازمان محیط زیست)',
 'مقررات کنترل انتشار ترکیبات آلی فرار در صنایع پتروشیمی',
 'Iran', 'quarterly',
 ARRAY['scope_1'],
 ARRAY['پایش مستمر VOC', 'برنامه LDAR', 'گزارش نشت تجهیزات', 'کنترل مخازن ذخیره'],
 '[{"month": 3, "day": 20, "description": "گزارش فصلی VOC", "description_en": "Quarterly VOC Report", "persian_date": "هر فصل"}]'::jsonb),

('petrochemical', 'استاندارد HSE صنایع پتروشیمی',
 'الزامات ایمنی، بهداشت و محیط زیست مجتمع‌های پتروشیمی',
 'Iran', 'monthly',
 ARRAY['scope_1', 'scope_2'],
 ARRAY['ارزیابی ریسک فرآیند', 'مدیریت تغییرات', 'آمادگی واکنش اضطراری', 'پایش محیط کار'],
 '[{"month": 1, "day": 15, "description": "گزارش ماهانه HSE", "description_en": "Monthly HSE Report", "persian_date": "۲۵ هر ماه"}]'::jsonb),

-- Agriculture Industry Templates
('agriculture', 'گزارش‌دهی کشاورزی پایدار (MAJ)',
 'الزامات وزارت جهاد کشاورزی برای کشاورزی پایدار و کم‌کربن',
 'Iran', 'annual',
 ARRAY['scope_1', 'scope_3'],
 ARRAY['مدیریت کود و نهاده', 'مصرف آب کشاورزی', 'انتشار ماشین‌آلات', 'تغییر کاربری زمین'],
 '[{"month": 3, "day": 20, "description": "گزارش سالانه کشاورزی", "description_en": "Annual Agriculture Report", "persian_date": "۲۹ اسفند"}]'::jsonb),

('agriculture', 'استاندارد محصول ارگانیک ایران (ISIRI)',
 'استاندارد ملی تولید محصولات کشاورزی ارگانیک',
 'Iran', 'annual',
 ARRAY['scope_1', 'scope_3'],
 ARRAY['عدم استفاده از سموم شیمیایی', 'کود آلی', 'تناوب زراعی', 'مدیریت بقایای گیاهی'],
 '[{"month": 6, "day": 21, "description": "ممیزی سالانه ارگانیک", "description_en": "Annual Organic Audit", "persian_date": "۳۱ شهریور"}]'::jsonb),

('agriculture', 'مدیریت منابع آب کشاورزی',
 'الزامات گزارش‌دهی مصرف آب در بخش کشاورزی',
 'Iran', 'seasonal',
 ARRAY['scope_3'],
 ARRAY['کنتور آب', 'سیستم آبیاری', 'بهره‌وری آب', 'مدیریت زهاب'],
 '[{"month": 4, "day": 1, "description": "گزارش فصل کاشت", "description_en": "Planting Season Report", "persian_date": "۱۲ فروردین"},
   {"month": 9, "day": 22, "description": "گزارش فصل برداشت", "description_en": "Harvest Season Report", "persian_date": "۳۱ شهریور"}]'::jsonb),

-- Energy Utilities - Iran specific
('energy_utilities', 'گزارش‌دهی وزارت نیرو (MoE)',
 'الزامات گزارش‌دهی انتشار نیروگاه‌ها به وزارت نیرو',
 'Iran', 'monthly',
 ARRAY['scope_1', 'scope_2'],
 ARRAY['انتشار واحد تولید', 'بازده حرارتی', 'مصرف سوخت', 'انتشار SO2 و NOx'],
 '[{"month": 1, "day": 10, "description": "گزارش ماهانه انتشار", "description_en": "Monthly Emissions Report", "persian_date": "۲۰ هر ماه"},
   {"month": 3, "day": 20, "description": "گزارش سالانه", "description_en": "Annual Report", "persian_date": "۲۹ اسفند"}]'::jsonb),

('energy_utilities', 'بهره‌وری انرژی نیروگاه‌ها (SABA)',
 'برنامه بهینه‌سازی مصرف انرژی سازمان بهره‌وری انرژی ایران',
 'Iran', 'annual',
 ARRAY['scope_1', 'scope_2'],
 ARRAY['ممیزی انرژی', 'برنامه کاهش مصرف', 'نصب کنتور هوشمند', 'آموزش پرسنل'],
 '[{"month": 6, "day": 21, "description": "گزارش ممیزی انرژی", "description_en": "Energy Audit Report", "persian_date": "۳۱ شهریور"}]'::jsonb),

-- Manufacturing - Additional Iran frameworks
('manufacturing', 'استاندارد ملی مدیریت انرژی (ISIRI-ISO 50001)',
 'پیاده‌سازی سیستم مدیریت انرژی مطابق استاندارد ملی ایران',
 'Iran', 'annual',
 ARRAY['scope_1', 'scope_2'],
 ARRAY['خط‌مشی انرژی', 'شاخص‌های عملکرد انرژی', 'اهداف و برنامه‌ها', 'ممیزی داخلی'],
 '[{"month": 12, "day": 20, "description": "ممیزی سالانه EnMS", "description_en": "Annual EnMS Audit", "persian_date": "۲۹ اسفند"}]'::jsonb),

('manufacturing', 'گواهی محصول سبز ایران',
 'برنامه اعطای نشان محیط زیست به محصولات صنعتی سازگار با محیط زیست',
 'Iran', 'annual',
 ARRAY['scope_1', 'scope_2', 'scope_3'],
 ARRAY['ارزیابی چرخه حیات', 'مواد اولیه پایدار', 'کاهش مصرف انرژی', 'بسته‌بندی سبز'],
 '[{"month": 6, "day": 5, "description": "روز محیط زیست - تمدید گواهی", "description_en": "Environment Day - Certificate Renewal", "persian_date": "۱۵ خرداد"}]'::jsonb);

-- Global frameworks for new industries
INSERT INTO industry_compliance_templates (
  industry, framework_name, description, jurisdiction, reporting_frequency,
  required_scopes, key_requirements, typical_deadlines
) VALUES 
('construction', 'LEED Certification', 
 'Leadership in Energy and Environmental Design for green buildings',
 'Global', 'project-based',
 ARRAY['scope_1', 'scope_2', 'scope_3'],
 ARRAY['Energy efficiency', 'Water conservation', 'Materials selection', 'Indoor air quality'],
 '[{"month": 12, "day": 31, "description": "Annual recertification"}]'::jsonb),

('construction', 'ISO 14001 - Construction',
 'Environmental Management System standard for construction projects',
 'Global', 'annual',
 ARRAY['scope_1', 'scope_2'],
 ARRAY['Environmental policy', 'Legal compliance', 'Waste management', 'Pollution prevention'],
 '[{"month": 12, "day": 31, "description": "Annual surveillance audit"}]'::jsonb),

('petrochemical', 'API IOGP Environmental Standards',
 'International Oil and Gas Producers environmental reporting framework',
 'Global', 'annual',
 ARRAY['scope_1', 'scope_2', 'scope_3'],
 ARRAY['GHG emissions reporting', 'Flaring reduction', 'Methane management', 'Spill prevention'],
 '[{"month": 3, "day": 31, "description": "Annual environmental report"}]'::jsonb),

('petrochemical', 'Responsible Care',
 'Chemical industry initiative for sustainability and safety',
 'Global', 'annual',
 ARRAY['scope_1', 'scope_2', 'scope_3'],
 ARRAY['Product stewardship', 'Process safety', 'Community awareness', 'Pollution prevention'],
 '[{"month": 6, "day": 30, "description": "Annual Responsible Care report"}]'::jsonb),

('agriculture', 'Global GAP',
 'Good Agricultural Practices certification for sustainable farming',
 'Global', 'annual',
 ARRAY['scope_1', 'scope_3'],
 ARRAY['Crop protection', 'Soil management', 'Water use', 'Biodiversity'],
 '[{"month": 12, "day": 31, "description": "Annual certification audit"}]'::jsonb),

('agriculture', 'Science Based Targets - FLAG',
 'Forest, Land and Agriculture guidance for science-based targets',
 'Global', 'annual',
 ARRAY['scope_1', 'scope_3'],
 ARRAY['Land-use emissions', 'Deforestation-free supply chain', 'Carbon sequestration', 'Livestock emissions'],
 '[{"month": 12, "day": 31, "description": "Annual progress report"}]'::jsonb);
