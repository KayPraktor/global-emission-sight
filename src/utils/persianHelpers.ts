import jalaliMoment from 'jalali-moment';

// Persian/Farsi digit mappings
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert English numbers to Persian/Farsi numerals
 */
export const toPersianNumber = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

/**
 * Convert Persian/Farsi numerals to English numbers
 */
export const toEnglishNumber = (str: string): string => {
  return str.replace(/[۰-۹]/g, (digit) => englishDigits[persianDigits.indexOf(digit)].toString());
};

/**
 * Format number with Persian numerals and thousand separators
 */
export const formatPersianNumber = (num: number, maximumFractionDigits: number = 2): string => {
  const formatted = num.toLocaleString('fa-IR', { maximumFractionDigits });
  return formatted;
};

/**
 * Convert Gregorian date to Jalali/Shamsi date string
 */
export const toJalaliDate = (dateString: string, format: string = 'jYYYY/jMM/jDD'): string => {
  try {
    return jalaliMoment(dateString).locale('fa').format(format);
  } catch {
    return dateString;
  }
};

/**
 * Get Persian month name
 */
export const getPersianMonthName = (gregorianDate: string): string => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  const jMonth = jalaliMoment(gregorianDate).jMonth();
  return months[jMonth];
};

/**
 * Get full Persian date with month name
 */
export const getFullPersianDate = (dateString: string): string => {
  const m = jalaliMoment(dateString).locale('fa');
  return `${toPersianNumber(m.jDate())} ${getPersianMonthName(dateString)} ${toPersianNumber(m.jYear())}`;
};

/**
 * Get current date in Jalali format
 */
export const getCurrentJalaliDate = (): string => {
  return jalaliMoment().locale('fa').format('jYYYY/jMM/jDD');
};

/**
 * Persian translations for CBAM report
 */
export const persianLabels = {
  // Report titles
  reportTitle: 'گزارش اظهارنامه CBAM',
  reportSubtitle: 'مکانیزم تعدیل مرزی کربن اتحادیه اروپا',
  reportingPeriod: 'دوره گزارش‌دهی',
  generatedOn: 'تاریخ تولید',
  documentId: 'شناسه سند',
  confidentialNotice: 'محرمانه - سند انطباق EU CBAM',
  
  // Executive summary
  executiveSummary: 'خلاصه اجرایی',
  totalProducts: 'تعداد محصولات',
  totalEmissions: 'مجموع انتشارات',
  carbonPricePaid: 'قیمت کربن پرداختی',
  countriesOfOrigin: 'کشورهای مبدأ',
  items: 'مورد',
  
  // Declarant info
  declarantInfo: 'اطلاعات اظهارکننده',
  companyName: 'نام شرکت',
  authorizedRep: 'نماینده مجاز',
  position: 'سمت',
  eoriNumber: 'شماره EORI',
  address: 'آدرس',
  notSpecified: 'مشخص نشده',
  
  // Products
  importedGoods: 'کالاهای وارداتی اظهار شده',
  importedGoodsDesc: 'جدول زیر تمام کالاهای مشمول CBAM وارد شده طی دوره گزارش‌دهی، شامل انتشارات تعبیه‌شده و هرگونه قیمت کربن پرداختی در کشور مبدأ را خلاصه می‌کند.',
  cnCode: 'کد CN',
  description: 'شرح محصول',
  origin: 'کشور مبدأ',
  quantity: 'مقدار',
  embeddedCO2e: 'CO₂e تعبیه‌شده',
  productsSummary: 'خلاصه محصولات',
  
  // Detailed product info
  detailedProductInfo: 'اطلاعات تفصیلی محصول',
  product: 'محصول',
  productDescription: 'شرح محصول',
  countryOfOrigin: 'کشور مبدأ',
  installationName: 'نام تأسیسات',
  installationId: 'شناسه تأسیسات',
  quantityImported: 'مقدار وارداتی',
  directEmissions: 'انتشارات مستقیم',
  indirectEmissions: 'انتشارات غیرمستقیم',
  totalEmbeddedEmissions: 'مجموع انتشارات تعبیه‌شده',
  specificEmbeddedEmissions: 'انتشارات تعبیه‌شده ویژه',
  notAvailable: 'در دسترس نیست',
  
  // Emissions analysis
  emissionsAnalysis: 'تحلیل انتشارات',
  productCategory: 'دسته‌بندی محصول',
  products: 'محصولات',
  totalEmissionsTCO2e: 'مجموع انتشارات (tCO₂e)',
  share: 'سهم (%)',
  emissionsByCategory: 'انتشارات بر اساس دسته‌بندی محصول',
  emissionsByCountry: 'انتشارات بر اساس کشور مبدأ',
  carbonPricePaidEUR: 'قیمت کربن پرداختی (EUR)',
  
  // Methodology
  methodology: 'روش‌شناسی',
  emissionCalcMethodology: 'روش‌شناسی محاسبه انتشارات',
  emissionCalcDesc: 'انتشارات تعبیه‌شده مطابق با مقررات اجرایی EU CBAM محاسبه شده است. در مواردی که داده‌های واقعی تأسیسات در دسترس نبود، از مقادیر پیش‌فرض کمیسیون اروپا استفاده شده است.',
  directEmissionsScope1: 'انتشارات مستقیم (دامنه ۱)',
  directEmissionsDesc: 'انتشارات مستقیم شامل تمام انتشارات گازهای گلخانه‌ای از فرآیند تولید، از جمله احتراق سوخت، انتشارات فرآیندی و انتشارات فراری در تأسیسات تولیدی کالا می‌باشد.',
  indirectEmissionsScope2: 'انتشارات غیرمستقیم (دامنه ۲)',
  indirectEmissionsDesc: 'انتشارات غیرمستقیم شامل انتشارات ناشی از تولید برق، حرارت و بخار خریداری شده مصرفی در تولید کالاهای وارداتی می‌باشد.',
  carbonPriceCalc: 'محاسبه قیمت کربن',
  carbonPriceDesc: 'قیمت‌های کربن پرداختی در کشور مبدأ بر اساس مالیات‌های کربن، مجوزهای سیستم معاملات انتشارات، یا معیارهای معادل قابل اعمال بر تولید کالاها محاسبه شده است.',
  
  // Declaration
  declarationOfAccuracy: 'اعلام صحت',
  declarationText: 'بدین‌وسیله اعلام می‌دارم که اطلاعات ارائه شده در این گزارش تا حد اطلاع بنده صحیح و کامل است و داده‌ها مطابق با روش‌شناسی ذکر شده جمع‌آوری و محاسبه شده‌اند.',
  signature: 'امضا',
  date: 'تاریخ',
  
  // Units
  tCO2e: 'تن CO₂ معادل',
  tonnes: 'تن',
  
  // Product categories
  ironSteel: 'آهن و فولاد',
  aluminium: 'آلومینیوم',
  cement: 'سیمان',
  fertilizers: 'کودها',
  hydrogen: 'هیدروژن',
  electricity: 'برق',
  other: 'سایر',
  
  // UI labels
  quickSampleReport: 'گزارش نمونه سریع',
  customReport: 'گزارش سفارشی',
  downloadSampleReport: 'دانلود گزارش نمونه CBAM (PDF)',
  generateReport: 'تولید گزارش CBAM فارسی',
  generating: 'در حال تولید...',
  startDate: 'تاریخ شروع',
  endDate: 'تاریخ پایان',
  declarantDetails: 'اطلاعات اظهارکننده',
  representativeName: 'نام نماینده',
  importedProducts: 'محصولات وارداتی',
  addProduct: 'افزودن محصول',
  removeProduct: 'حذف محصول',
  originCountry: 'کشور مبدأ',
  embeddedEmissions: 'انتشارات تعبیه‌شده',
  iran: 'ایران',
  
  // Footer
  allRightsReserved: 'تمامی حقوق محفوظ است',
  page: 'صفحه',
  of: 'از',
};

/**
 * Sample Iranian companies for CBAM context
 */
export const iranianCompanies = {
  steel: [
    { name: 'فولاد مبارکه اصفهان', nameEn: 'Mobarakeh Steel Company', id: 'IR-MSC-001' },
    { name: 'فولاد خوزستان', nameEn: 'Khouzestan Steel Company', id: 'IR-KSC-002' },
    { name: 'ذوب‌آهن اصفهان', nameEn: 'Isfahan Steel Company', id: 'IR-ESCO-003' },
    { name: 'فولاد هرمزگان', nameEn: 'Hormozgan Steel Company', id: 'IR-HOSCO-004' },
  ],
  aluminium: [
    { name: 'شرکت آلومینیوم ایران (ایرالکو)', nameEn: 'Iran Aluminium Company (IRALCO)', id: 'IR-IRALCO-001' },
    { name: 'آلومینیوم المهدی', nameEn: 'Almahdi Aluminium', id: 'IR-ALMAHDI-002' },
    { name: 'آلومینیوم جنوب', nameEn: 'South Aluminium Corporation', id: 'IR-SALCO-003' },
  ],
  cement: [
    { name: 'سیمان تهران', nameEn: 'Tehran Cement Company', id: 'IR-TCC-001' },
    { name: 'سیمان اصفهان', nameEn: 'Isfahan Cement Company', id: 'IR-ICC-002' },
    { name: 'سیمان فارس', nameEn: 'Fars Cement Company', id: 'IR-FCC-003' },
    { name: 'سیمان خوزستان', nameEn: 'Khuzestan Cement Company', id: 'IR-KCC-004' },
  ],
  fertilizers: [
    { name: 'پتروشیمی شیراز', nameEn: 'Shiraz Petrochemical', id: 'IR-SPC-001' },
    { name: 'پتروشیمی رازی', nameEn: 'Razi Petrochemical', id: 'IR-RPC-002' },
    { name: 'پتروشیمی کرمانشاه', nameEn: 'Kermanshah Petrochemical', id: 'IR-KPC-003' },
  ],
};

/**
 * Get category name in Persian
 */
export const getCategoryPersian = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'Iron & Steel': persianLabels.ironSteel,
    'Aluminium': persianLabels.aluminium,
    'Cement': persianLabels.cement,
    'Fertilizers': persianLabels.fertilizers,
    'Hydrogen': persianLabels.hydrogen,
    'Electricity': persianLabels.electricity,
    'Other': persianLabels.other,
  };
  return categoryMap[category] || category;
};
