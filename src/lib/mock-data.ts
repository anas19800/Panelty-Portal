export type Violation = {
  id: string;
  violationNumber: string;
  paymentNumber: string;
  date: string;
  category: string;
  subCategory: string;
  amount: number;
  status: 'مدفوعة' | 'غير مدفوعة' | 'ملفية';
  branchId: string;
  branchName: string;
  brand: string;
  region: string;
  city: string;
};

export type Branch = {
  id: string;
  name: string;
  city: string;
  region: string;
  brand: string;
  manager: string;
  regionalManager: string;
  location: string;
};

export type ViolationSubCategory = {
  code: string;
  name: string;
};

export type ViolationCategory = {
  mainCategoryCode: string;
  mainCategory: string;
  subCategories: ViolationSubCategory[];
};

export const regions = ["المنطقة الوسطى", "المنطقة الغربية", "المنطقة الشرقية"];
export const brands = ["براند ألف", "براند باء", "براند جيم"];

export const branches: Branch[] = [
  { id: 'b1', name: 'فرع العليا', city: 'الرياض', region: 'المنطقة الوسطى', brand: 'براند ألف', manager: 'أحمد علي', regionalManager: 'خالد الغامدي', location: 'https://maps.google.com' },
  { id: 'b2', name: 'فرع التحلية', city: 'جدة', region: 'المنطقة الغربية', brand: 'براند ألف', manager: 'محمد حسن', regionalManager: 'سلطان المالكي', location: 'https://maps.google.com' },
  { id: 'b3', name: 'فرع الخبر', city: 'الخبر', region: 'المنطقة الشرقية', brand: 'براند باء', manager: 'فهد عبدالله', regionalManager: 'علي الزهراني', location: 'https://maps.google.com' },
  { id: 'b4', name: 'فرع الياسمين', city: 'الرياض', region: 'المنطقة الوسطى', brand: 'براند باء', manager: 'سارة إبراهيم', regionalManager: 'خالد الغامدي', location: 'https://maps.google.com' },
  { id: 'b5', name: 'فرع الحمراء', city: 'جدة', region: 'المنطقة الغربية', brand: 'براند جيم', manager: 'عمر ياسر', regionalManager: 'سلطان المالكي', location: 'https://maps.google.com' },
];

export const violations: Violation[] = [
  { id: 'v1', violationNumber: 'V-001', paymentNumber: 'P-001', date: '2024-05-01', category: 'نظافة', subCategory: 'نظافة عامة', amount: 500, status: 'مدفوعة', branchId: 'b1', branchName: 'فرع العليا', brand: 'براند ألف', region: 'المنطقة الوسطى', city: 'الرياض' },
  { id: 'v2', violationNumber: 'V-002', paymentNumber: 'P-002', date: '2024-05-05', category: 'صحة', subCategory: 'شهادة صحية', amount: 1000, status: 'غير مدفوعة', branchId: 'b2', branchName: 'فرع التحلية', brand: 'براند ألف', region: 'المنطقة الغربية', city: 'جدة' },
  { id: 'v3', violationNumber: 'V-003', paymentNumber: 'P-003', date: '2024-05-10', category: 'تراخيص', subCategory: 'رخصة بناء', amount: 2500, status: 'ملفية', branchId: 'b3', branchName: 'فرع الخبر', brand: 'براند باء', region: 'المنطقة الشرقية', city: 'الخبر' },
  { id: 'v4', violationNumber: 'V-004', paymentNumber: 'P-004', date: '2024-05-12', category: 'نظافة', subCategory: 'مخلفات بناء', amount: 750, status: 'مدفوعة', branchId: 'b1', branchName: 'فرع العليا', brand: 'براند ألف', region: 'المنطقة الوسطى', city: 'الرياض' },
  { id: 'v5', violationNumber: 'V-005', paymentNumber: 'P-005', date: '2024-05-15', category: 'صحة', subCategory: 'تخزين أغذية', amount: 1200, status: 'غير مدفوعة', branchId: 'b4', branchName: 'فرع الياسمين', brand: 'براند باء', region: 'المنطقة الوسطى', city: 'الرياض' },
];

export const recentViolations = [
  { id: 'v5', branch: 'فرع الياسمين', city: 'الرياض', date: '2024-05-15', amount: 1200, status: 'غير مدفوعة' },
  { id: 'v4', branch: 'فرع العليا', city: 'الرياض', date: '2024-05-12', amount: 750, status: 'مدفوعة' },
  { id: 'v3', branch: 'فرع الخبر', city: 'الخبر', date: '2024-05-10', amount: 2500, status: 'ملفية' },
  { id: 'v2', branch: 'فرع التحلية', city: 'جدة', date: '2024-05-05', amount: 1000, status: 'غير مدفوعة' },
  { id: 'v1', branch: 'فرع العليا', city: 'الرياض', date: '2024-05-01', amount: 500, status: 'مدفوعة' },
];

export const violationsByBrand = [
  { brand: 'براند ألف', violations: 280, fill: 'var(--color-chart-2)' },
  { brand: 'براند باء', violations: 200, fill: 'var(--color-chart-1)' },
  { brand: 'براند جيم', violations: 150, fill: 'var(--color-chart-3)' },
  { brand: 'براند دال', violations: 90, fill: 'var(--color-chart-4)' },
];

export const violationsByStatus = [
  { status: 'مدفوعة', count: 45, fill: 'var(--color-chart-2)' },
  { status: 'غير مدفوعة', count: 30, fill: 'var(--color-chart-5)' },
  { status: 'ملفية', count: 25, fill: 'var(--color-chart-3)' },
];

export const violationCategories: ViolationCategory[] = [
    {
        mainCategoryCode: "01",
        mainCategory: "متطلبات الموقع والمبنى",
        subCategories: [
            { code: "01-01", name: "عدم ملاءمة الموقع" },
            { code: "01-02", name: "عدم وجود ترخيص بناء" },
            { code: "01-03", name: "مخالفة في مساحة المحل" },
        ],
    },
    {
        mainCategoryCode: "02",
        mainCategory: "التجهيزات الداخلية",
        subCategories: [
            { code: "02-01", name: "عدم كفاءة الإضاءة" },
            { code: "02-02", name: "عدم كفاءة التهوية" },
            { code: "02-03", name: "الأرضيات غير سهلة التنظيف" },
        ],
    },
    {
        mainCategoryCode: "03",
        mainCategory: "المرافق الصحية",
        subCategories: [
            { code: "03-01", name: "عدم وجود دورات مياه كافية" },
            { code: "03-02", name: "عدم نظافة دورات المياه" },
            { code: "03-03", name: "عدم توفر مغاسل" },
        ],
    },
    {
        mainCategoryCode: "04",
        mainCategory: "مكافحة الحشرات والقوارض",
        subCategories: [
            { code: "04-01", name: "عدم وجود برنامج مكافحة" },
            { code: "04-02", name: "وجود حشرات أو قوارض" },
            { code: "04-03", name: "عدم وجود مصائد فعالة" },
        ],
    },
    {
        mainCategoryCode: "05",
        mainCategory: "العاملون",
        subCategories: [
            { code: "05-01", name: "عدم وجود شهادات صحية" },
            { code: "05-02", name: "تدني مستوى النظافة الشخصية" },
            { code: "05-03", name: "ممارسة سلوكيات خاطئة" },
        ],
    },
    {
        mainCategoryCode: "06",
        mainCategory: "المواد الغذائية",
        subCategories: [
            { code: "06-01", name: "استخدام مواد أولية منتهية الصلاحية" },
            { code: "06-02", name: "تخزين غير سليم للمواد الغذائية" },
            { code: "06-03", name: "عدم وجود بطاقات تعريفية" },
        ],
    },
];
