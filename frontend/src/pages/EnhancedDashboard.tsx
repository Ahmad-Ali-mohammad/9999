import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { budgetService, accountService } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

interface BudgetSummary {
  id: number;
  categoryName: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'danger';
}

interface MonthlyBudgetOverview {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallHealth: 'healthy' | 'warning' | 'danger';
  budgetCount: number;
}

const EnhancedDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [monthlyOverview, setMonthlyOverview] = useState<MonthlyBudgetOverview | null>(null);
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    savings: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch budgets using service
      const budgetData: any = await budgetService.getAll();

      // Calculate monthly budget overview
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyBudgets = budgetData.filter((b: any) =>
        b.month?.startsWith(currentMonth)
      );

      const totalBudgeted = monthlyBudgets.reduce((sum: number, b: any) => sum + Number.parseFloat(b.limit || 0), 0);
      const totalSpent = monthlyBudgets.reduce((sum: number, b: any) => sum + Number.parseFloat(b.spent || 0), 0);
      const totalRemaining = totalBudgeted - totalSpent;
      const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

      let overallHealth: 'healthy' | 'warning' | 'danger';
      if (overallPercentage >= 90) overallHealth = 'danger';
      else if (overallPercentage >= 70) overallHealth = 'warning';
      else overallHealth = 'healthy';

      setMonthlyOverview({
        totalBudgeted,
        totalSpent,
        totalRemaining,
        overallHealth,
        budgetCount: monthlyBudgets.length
      });

      // Process budgets
      const processedBudgets: BudgetSummary[] = monthlyBudgets.map((b: any) => {
        const limit = Number.parseFloat(b.limit || 0);
        const spent = Number.parseFloat(b.spent || 0);
        const remaining = limit - spent;
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;

        let status: 'healthy' | 'warning' | 'danger';
        if (percentage >= 90) status = 'danger';
        else if (percentage >= 70) status = 'warning';
        else status = 'healthy';

        return {
          id: b.id,
          categoryName: b.category?.name || b.name || 'Uncategorized',
          limit,
          spent,
          remaining,
          percentage,
          status
        };
      });

      setBudgets(processedBudgets);

      // Fetch accounts for balance
      const accounts: any = await accountService.getAll();
      const totalBalance = accounts.reduce((sum: number, acc: any) =>
        sum + Number.parseFloat(acc.balance || 0), 0
      );

      setStats({
        totalBalance,
        income: totalBudgeted,
        expenses: totalSpent,
        savings: totalRemaining
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'danger': return 'from-red-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <Clock className="w-5 h-5" />;
      case 'danger': return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="spinner w-16 h-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-navy to-brand-green bg-clip-text text-transparent">
            {t('dashboard')}
          </h1>
          <p className="text-gray-400 mt-2">{t('overview')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('totalBalance')}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalBalance)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-brand-navy to-brand-green rounded-xl shadow-lg shadow-brand-green/20">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('income')}</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{formatCurrency(stats.income)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('expenses')}</p>
                <p className="text-2xl font-bold mt-1 text-red-400">{formatCurrency(stats.expenses)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('savings')}</p>
                <p className="text-2xl font-bold mt-1 text-blue-400">{formatCurrency(stats.savings)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Budget Overview Section */}
        {monthlyOverview && (
          <div className="card-glass p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">ملخص الميزانية الشهرية</h2>
                <p className="text-gray-400 mt-1">
                  {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getHealthColor(monthlyOverview.overallHealth)} rounded-xl`}>
                {getHealthIcon(monthlyOverview.overallHealth)}
                {(() => {
                  let healthLabel = 'خطر';
                  if (monthlyOverview.overallHealth === 'healthy') healthLabel = 'صحية';
                  else if (monthlyOverview.overallHealth === 'warning') healthLabel = 'تحذير';
                  return <span className="font-semibold">{healthLabel}</span>;
                })()}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي المخصص</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">
                      {formatCurrency(monthlyOverview.totalBudgeted)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي المصروف</p>
                    <p className="text-xl font-bold text-orange-400 mt-1">
                      {formatCurrency(monthlyOverview.totalSpent)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">المتبقي</p>
                    <p className="text-xl font-bold text-green-400 mt-1">
                      {formatCurrency(monthlyOverview.totalRemaining)}
                    </p>
                  </div>
                  <PiggyBank className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>التقدم الإجمالي</span>
                <span className="font-semibold">
                  {((monthlyOverview.totalSpent / monthlyOverview.totalBudgeted) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                {/* eslint-disable-next-line */}{/* stylelint-disable-next-line */}
                <div
                  className={`h-full bg-gradient-to-r ${getHealthColor(monthlyOverview.overallHealth)} transition-all duration-500`}
                  style={{ width: `${Math.min((monthlyOverview.totalSpent / monthlyOverview.totalBudgeted) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Budget Categories Grid */}
        {budgets.length > 0 && (
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold mb-6">تفاصيل الميزانيات حسب الفئة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((budget) => (
                <div key={budget.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{budget.categoryName}</h3>
                    <div className={`p-2 bg-gradient-to-r ${getHealthColor(budget.status)} rounded-lg`}>
                      {getHealthIcon(budget.status)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">الحد الأقصى:</span>
                      <span className="font-semibold">{formatCurrency(budget.limit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">المصروف:</span>
                      <span className="font-semibold text-orange-400">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">المتبقي:</span>
                      <span className={`font-semibold ${budget.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(budget.remaining)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>التقدم</span>
                        <span>{budget.percentage.toFixed(1)}%</span>
                      </div>
                      {/* eslint-disable-next-line */}
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        {/* eslint-disable-next-line */}{/* stylelint-disable-next-line */}
                        <div
                          className={`h-full bg-gradient-to-r ${getHealthColor(budget.status)} transition-all duration-500`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EnhancedDashboard;
