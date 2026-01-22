import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';
type Dialect = 'msa' | 'egyptian' | 'gulf' | 'levantine' | 'maghrebi';

interface LanguageContextType {
  language: Language;
  dialect: Dialect;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  setDialect: (dialect: Dialect) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, any>> = {
  ar: {
    // App
    appName: 'Money Way',
    appTagline: 'طريقك الذكي للنجاح المالي',

    // Navigation
    home: 'الرئيسية',
    features: 'المميزات',
    pricing: 'الأسعار',
    about: 'عن التطبيق',
    dashboard: 'لوحة التحكم',
    transactions: 'المعاملات',
    budgets: 'الميزانيات',
    reports: 'التقارير',
    accounts: 'الحسابات',
    categories: 'الفئات',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',

    // Landing Page
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    getStarted: 'ابدأ الآن مجاناً',
    learnMore: 'اكتشف المزيد',
    heroTitle: 'تحكم في مستقبلك المالي بكل سهولة',
    heroSubtitle: 'تتبع مصروفاتك، حدد ميزانياتك، وحقق أهدافك المالية من خلال منصة واحدة متكاملة.',
    modernInterface: 'واجهة عصرية وسهلة الاستخدام',
    modernInterfaceDesc: 'استمتع بتجربة مستخدم سلسة وراقية مع دعم الوضع الليلي.',
    smartAnalytics: 'تحليلات ذكية',
    smartAnalyticsDesc: 'تقارير مفصلة ورسوم بيانية تساعدك على فهم نمط إنفاقك.',
    multiAccount: 'تعدد الحسابات',
    multiAccountDesc: 'أدر حساباتك البنكية، بطاقاتك، ومدخراتك في مكان واحد.',
    securePrivate: 'آمن وخصوصي',
    securePrivateDesc: 'بياناتك مشفرة ومحمية بأعلى معايير الأمان.',

    // Common
    save: 'حفظ',
    update: 'تحديث',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    loading: 'جارٍ التحميل...',
    success: 'تمت العملية بنجاح',
    error: 'حدث خطأ ما',
    noData: 'لا توجد بيانات',
    all: 'الكل',
    income: 'الدخل',
    expenses: 'المصروفات',
    savings: 'المدخرات',
    netFlow: 'التدفق الصافي',
    limit: 'الحد',
    spent: 'المصروف',
    remaining: 'المتبقي',
    actions: 'الإجراءات',
    details: 'التفاصيل',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    close: 'إغلاق',

    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    forgotPassword: 'نسيت كلمة المرور؟',
    donthaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signingIn: 'جارٍ تسجيل الدخول...',
    signingUp: 'جارٍ إنشاء الحساب...',
    signIn: 'تسجيل الدخول',
    orContinueWith: 'أو استمر باستخدام',
    continueWithGoogle: 'المتابعة باستخدام Google',
    signUpWithGoogle: 'التسجيل باستخدام Google',

    // Dashboard
    overview: 'نظرة عامة',
    happeningToday: 'إليك وضع أموالك اليوم',
    netCashflow: 'التدفق النقدي الصافي',
    activeAccounts: 'حسابات نشطة',
    totalEarned: 'إجمالي ما ربحته',
    recentTransactions: 'آخر المعاملات',
    budgetOverview: 'نظرة على الميزانية',
    goalsProgress: 'تقدم الأهداف',
    financialHealth: 'الصحة المالية',
    stabilityScore: 'درجة الاستقرار',
    excellent: 'ممتاز',
    good: 'جيد',
    fair: 'مقبول',
    needsImprovement: 'يحتاج تحسين',
    runway: 'فترة الأمان',
    months: 'أشهر',
    total: 'الإجمالي',
    noAccountsYet: 'لا توجد حسابات بعد',
    viewAll: 'عرض الكل',
    budgetPerformance: 'أداء الميزانيات',
    currentMonth: 'الشهر الحالي',
    manageBudgets: 'إدارة الميزانيات',
    noBudgetsThisMonth: 'لم يتم تعيين ميزانيات لهذا الشهر',
    createFirstBudget: 'أنشئ ميزانيتك الأولى',
    totalBudgeted: 'إجمالي الميزانية',
    overallHealth: 'الصحة العامة',
    warning: 'تحذير',
    critical: 'حرج',
    budgetBreakdown: 'تفصيل الميزانية',
    left: 'متبقي',
    over: 'زيادة',
    used: 'مستخدم',
    overBudget: 'تجاوز الميزانية!',
    closeToLimit: 'قريب من الحد',
    expenseBreakdown: 'تفصيل المصروفات',
    pieChart: 'رسم دائري',
    barChart: 'رسم بياني',
    monthlyTrends: 'الاتجاهات الشهرية',
    weeklySpending: 'المصروفات الأسبوعية',
    week: 'أسبوع',
    month: 'شهر',
    year: 'سنة',
    financialGoals: 'الأهداف المالية',
    noGoalsYet: 'لا توجد أهداف بعد',
    noTransactionsYet: 'لا توجد معاملات بعد',
    quickActions: 'إجراءات سريعة',
    quickAction: 'إجراء سريع',
    addIncome: 'إضافة دخل',
    addExpense: 'إضافة مصروف',
    transferMoney: 'تحويل أموال',
    loadingDashboard: 'جارٍ تحميل لوحة التحكم...',
    loadingData: 'جارٍ تحميل البيانات...',
    failedToLoadData: 'فشل في تحميل الحسابات والفئات',
    selectAccountRequired: 'يرجى اختيار حساب',
    targetAccountRequired: 'يرجى اختيار الحساب المحول إليه',
    failedToSaveTransaction: 'فشل في حفظ المعاملة',
    amountPositive: 'يجب أن يكون المبلغ أكبر من صفر',
    transferSameAccount: 'لا يمكن التحويل لنفس الحساب',
    newTransaction: 'معاملة جديدة',
    dateTime: 'التاريخ والوقت',
    noCategory: 'بدون فئة',
    saving: 'جارٍ الحفظ...',
    tags: 'الوسوم',
    selectAccount: 'اختر الحساب',
    createTransaction: 'إنشاء معاملة',
    transactionType: 'نوع المعاملة',
    step: 'الخطوة',
    fillDetails: 'املأ التفاصيل بعناية',
    chooseCategory: 'اختر الفئة',
    chooseAccount: 'اختر الحساب',
    tagsPlaceholder: 'عمل، شخصي، مهم...',
    notesPlaceholder: 'ملاحظات إضافية...',
    searchTransactions: 'بحث في المعاملات...',
    noAccount: 'بدون حساب',
    uncategorized: 'غير مصنف',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    transactionSaved: 'تم حفظ المعاملة بنجاح',
    transactionDeleted: 'تم حذف المعاملة بنجاح',
    errorSaving: 'خطأ في حفظ المعاملة',
    errorDeleting: 'خطأ في حذف المعاملة',
    noNotes: 'لا توجد ملاحظات',

    // Transactions
    addTransaction: 'إضافة معاملة',
    editTransaction: 'تعديل المعاملة',
    deleteTransaction: 'حذف المعاملة',
    trackTransactions: 'تتبع جميع دخلك ومصروفاتك',
    searchPlaceholder: 'بحث في المعاملات، الميزانيات...',
    loadingTransactions: 'جارٍ تحميل المعاملات...',
    startTracking: 'ابدأ بتتبع أنشطتك المالية',
    addFirstTransaction: 'أضف معاملتك الأولى',
    amount: 'المبلغ',
    description: 'الوصف',
    date: 'التاريخ',
    category: 'الفئة',
    account: 'الحساب',
    type: 'النوع',
    expense: 'مصروف',
    transfer: 'تحويل',
    fromAccount: 'من حساب',
    toAccount: 'إلى حساب',
    notes: 'ملاحظات',
    attachments: 'المرفقات',
    recurring: 'متكرر',
    frequency: 'التكرار',
    transactionDate: 'تاريخ المعاملة',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقد',
    card: 'بطاقة',
    bankTransfer: 'تحويل بنكي',
    other: 'أخرى',
    deleteTransactionConfirm: 'هل أنت متأكد من حذف هذه المعاملة؟',

    // Budgets
    budgetName: 'اسم الميزانية',
    budgetLimit: 'حد الميزانية',
    budgetHealth: 'صحة الميزانية',
    createBudget: 'إنشاء ميزانية',
    editBudget: 'تعديل الميزانية',
    deleteBudget: 'حذف الميزانية',
    period: 'الفترة',
    monthly: 'شهري',
    weekly: 'أسبوعي',
    daily: 'يومي',
    yearly: 'سنوي',
    budgetAmount: 'مبلغ الميزانية',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    noBudgetsYet: 'لا توجد ميزانيات بعد',

    // Accounts
    accountName: 'اسم الحساب',
    accountType: 'نوع الحساب',
    balance: 'الرصيد',
    initialBalance: 'الرصيد الافتتاحي',
    checking: 'جاري',
    savingsAccount: 'توفير',
    creditCard: 'بطاقة ائتمان',
    investment: 'استثمار',
    addAccount: 'إضافة حساب',
    editAccount: 'تعديل الحساب',
    deleteAccount: 'حذف الحساب',

    // General UI
    back: 'السابق',
    next: 'الحالي',
    submit: 'إرسال',
    remove: 'إزالة',
    help: 'مساعدة',
    contact: 'اتصل بنا',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    from: 'من',
    to: 'إلى',
    select: 'اختر',
    selectOption: 'اختر خياراً',
    status: 'الحالة',
    show: 'إظهار',
    hide: 'إخفاء',
    more: 'المزيد',
    less: 'أقل',
    dialects: {
      msa: 'العربية الفصحى',
      egyptian: 'اللهجة المصرية',
      gulf: 'اللهجة الخليجية',
      levantine: 'اللهجة الشامية',
      maghrebi: 'اللهجة المغربية'
    }
  },
  en: {
    // App
    appName: 'Money Way',
    appTagline: 'Your smart way to financial success',

    // Navigation
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    about: 'About',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    reports: 'Reports',
    accounts: 'Accounts',
    categories: 'Categories',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',

    // Landing Page
    login: 'Login',
    register: 'Register',
    getStarted: 'Get Started Free',
    learnMore: 'Learn More',
    heroTitle: 'Take Control of Your Financial Future',
    heroSubtitle: 'Track your expenses, set budgets, and achieve your financial goals in one integrated platform.',
    modernInterface: 'Modern Interface',
    modernInterfaceDesc: 'Enjoy a smooth and elegant user experience with dark mode support.',
    smartAnalytics: 'Smart Analytics',
    smartAnalyticsDesc: 'Detailed reports and charts to help you understand your spending patterns.',
    multiAccount: 'Multiple Accounts',
    multiAccountDesc: 'Manage your bank accounts, cards, and savings in one place.',
    securePrivate: 'Secure & Private',
    securePrivateDesc: 'Your data is encrypted and protected by the highest security standards.',

    // Common
    save: 'Save',
    update: 'Update',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    success: 'Operation successful',
    error: 'Something went wrong',
    noData: 'No data found',
    all: 'All',
    income: 'Income',
    expenses: 'Expenses',
    savings: 'Savings',
    netFlow: 'Net Flow',
    limit: 'Limit',
    spent: 'Spent',
    remaining: 'Remaining',
    actions: 'Actions',
    details: 'Details',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',

    // Auth
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot Password?',
    donthaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    signingIn: 'Signing in...',
    signingUp: 'Signing up...',
    signIn: 'Sign in',
    orContinueWith: 'Or continue with',
    continueWithGoogle: 'Continue with Google',
    signUpWithGoogle: 'Sign up with Google',

    // Dashboard
    overview: 'Overview',
    happeningToday: 'Here\'s what\'s happening with your money today',
    netCashflow: 'Net Cashflow',
    activeAccounts: 'active accounts',
    totalEarned: 'Total earned',
    recentTransactions: 'Recent Transactions',
    budgetOverview: 'Budget Overview',
    goalsProgress: 'Goals Progress',
    financialHealth: 'Financial Health',
    stabilityScore: 'Stability Score',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    needsImprovement: 'Needs Improvement',
    runway: 'Runway',
    months: 'months',
    total: 'total',
    noAccountsYet: 'No accounts yet',
    viewAll: 'View All',
    budgetPerformance: 'Budget Performance',
    currentMonth: 'Current Month',
    manageBudgets: 'Manage Budgets',
    noBudgetsThisMonth: 'No budgets set for this month',
    createFirstBudget: 'Create Your First Budget',
    totalBudgeted: 'Total Budgeted',
    overallHealth: 'Overall Health',
    warning: 'Warning',
    critical: 'Critical',
    budgetBreakdown: 'Budget Breakdown',
    left: 'left',
    over: 'over',
    used: 'used',
    overBudget: 'Over Budget!',
    closeToLimit: 'Close to limit',
    expenseBreakdown: 'Expense Breakdown',
    pieChart: 'Pie Chart',
    barChart: 'Bar Chart',
    monthlyTrends: 'Monthly Trends',
    weeklySpending: 'Weekly Spending',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    financialGoals: 'Financial Goals',
    noGoalsYet: 'No goals yet',
    noTransactionsYet: 'No transactions yet',
    quickActions: 'Quick Actions',
    quickAction: 'Quick Action',
    addIncome: 'Add Income',
    addExpense: 'Add Expense',
    transferMoney: 'Transfer Money',
    loadingDashboard: 'Loading dashboard...',
    loadingData: 'Loading data...',
    failedToLoadData: 'Failed to load accounts and categories',
    selectAccountRequired: 'Please select an account',
    targetAccountRequired: 'Please select a target account for the transfer',
    failedToSaveTransaction: 'Failed to save transaction',
    amountPositive: 'Amount must be greater than zero',
    transferSameAccount: 'Cannot transfer to the same account',
    newTransaction: 'New Transaction',
    dateTime: 'Date & Time',
    noCategory: 'No Category',
    saving: 'Saving...',
    tags: 'Tags',
    selectAccount: 'Select Account',
    createTransaction: 'Create Transaction',
    transactionType: 'Transaction Type',
    step: 'Step',
    fillDetails: 'Fill in the details carefully',
    chooseCategory: 'Choose Category',
    chooseAccount: 'Choose Account',
    tagsPlaceholder: 'work, personal, important...',
    notesPlaceholder: 'Additional notes...',
    searchTransactions: 'Search transactions...',
    noAccount: 'No Account',
    uncategorized: 'Uncategorized',
    confirmDelete: 'Are you sure you want to delete?',
    transactionSaved: 'Transaction saved successfully',
    transactionDeleted: 'Transaction deleted successfully',
    errorSaving: 'Error saving transaction',
    errorDeleting: 'Error deleting transaction',
    noNotes: 'No notes',

    // Transactions
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    trackTransactions: 'Track all your income and expenses',
    searchPlaceholder: 'Search transactions, budgets...',
    loadingTransactions: 'Loading transactions...',
    startTracking: 'Start tracking your financial activities',
    addFirstTransaction: 'Add Your First Transaction',
    amount: 'Amount',
    description: 'Description',
    date: 'Date',
    category: 'Category',
    account: 'Account',
    type: 'Type',
    expense: 'Expense',
    transfer: 'Transfer',
    fromAccount: 'From Account',
    toAccount: 'To Account',
    notes: 'Notes',
    attachments: 'Attachments',
    recurring: 'Recurring',
    frequency: 'Frequency',
    transactionDate: 'Transaction Date',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    bankTransfer: 'Bank Transfer',
    other: 'Other',
    deleteTransactionConfirm: 'Are you sure you want to delete this transaction?',

    // Budgets
    budgetName: 'Budget Name',
    budgetLimit: 'Budget Limit',
    budgetHealth: 'Budget Health',
    createBudget: 'Create Budget',
    editBudget: 'Edit Budget',
    deleteBudget: 'Delete Budget',
    period: 'Period',
    monthly: 'Monthly',
    weekly: 'Weekly',
    daily: 'Daily',
    yearly: 'Yearly',
    budgetAmount: 'Budget Amount',
    startDate: 'Start Date',
    endDate: 'End Date',
    noBudgetsYet: 'No budgets yet',

    // Accounts
    accountName: 'Account Name',
    accountType: 'Account Type',
    balance: 'Balance',
    initialBalance: 'Initial Balance',
    checking: 'Checking',
    savingsAccount: 'Savings',
    creditCard: 'Credit Card',
    investmentAccount: 'Investment',
    addAccount: 'Add Account',
    editAccount: 'Edit Account',
    deleteAccount: 'Delete Account',

    // General UI
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    remove: 'Remove',
    help: 'Help',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    from: 'From',
    to: 'To',
    select: 'Select',
    selectOption: 'Select an option',
    status: 'Status',
    show: 'Show',
    hide: 'Hide',
    more: 'More',
    less: 'Less',
    dialects: {
      msa: 'Modern Standard Arabic',
      egyptian: 'Egyptian Dialect',
      gulf: 'Gulf Dialect',
      levantine: 'Levantine Dialect',
      maghrebi: 'Maghrebi Dialect'
    }
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [dialect, setDialectState] = useState<Dialect>('msa');
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Load from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    const savedDialect = localStorage.getItem('dialect') as Dialect;

    if (savedLang) setLanguageState(savedLang);
    if (savedDialect) setDialectState(savedDialect);

    // Set document direction
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const setDialect = (newDialect: Dialect) => {
    setDialectState(newDialect);
    localStorage.setItem('dialect', newDialect);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, dialect, direction, isRTL: language === 'ar', setLanguage, setDialect, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};