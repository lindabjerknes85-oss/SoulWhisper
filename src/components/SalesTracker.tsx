import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, X, Receipt, Edit2, Trash2 } from 'lucide-react';

interface Sale {
  id: string;
  customer_name: string | null;
  description: string;
  amount: number;
  sale_date: string;
  status: 'paid' | 'pending' | 'overdue';
  invoice_number: string | null;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  receipt_url: string | null;
}

interface Stats {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  dailySales: number;
  dailyExpenses: number;
  dailyProfit: number;
  monthlySales: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  yearlySales: number;
  yearlyExpenses: number;
  yearlyProfit: number;
}

export function SalesTracker() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    dailySales: 0,
    dailyExpenses: 0,
    dailyProfit: 0,
    monthlySales: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
    yearlySales: 0,
    yearlyExpenses: 0,
    yearlyProfit: 0
  });
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'expenses'>('overview');

  const [saleForm, setSaleForm] = useState({
    customer_name: '',
    description: '',
    amount: '',
    sale_date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'paid' | 'pending' | 'overdue',
    invoice_number: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const { data: salesData } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .order('sale_date', { ascending: false });

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false });

    if (salesData) setSales(salesData);
    if (expensesData) setExpenses(expensesData);

    calculateStats(salesData || [], expensesData || []);
  };

  const calculateStats = (salesData: Sale[], expensesData: Expense[]) => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const totalExpenses = expensesData.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const dailySalesData = salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getDate() === currentDay &&
             saleDate.getMonth() === currentMonth &&
             saleDate.getFullYear() === currentYear;
    });

    const dailyExpensesData = expensesData.filter(exp => {
      const expDate = new Date(exp.expense_date);
      return expDate.getDate() === currentDay &&
             expDate.getMonth() === currentMonth &&
             expDate.getFullYear() === currentYear;
    });

    const monthlySalesData = salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const monthlyExpensesData = expensesData.filter(exp => {
      const expDate = new Date(exp.expense_date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const yearlySalesData = salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getFullYear() === currentYear;
    });

    const yearlyExpensesData = expensesData.filter(exp => {
      const expDate = new Date(exp.expense_date);
      return expDate.getFullYear() === currentYear;
    });

    const dailySales = dailySalesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const dailyExpenses = dailyExpensesData.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const monthlySales = monthlySalesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const monthlyExpenses = monthlyExpensesData.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const yearlySales = yearlySalesData.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const yearlyExpenses = yearlyExpensesData.reduce((sum, exp) => sum + Number(exp.amount), 0);

    setStats({
      totalSales,
      totalExpenses,
      profit: totalSales - totalExpenses,
      dailySales,
      dailyExpenses,
      dailyProfit: dailySales - dailyExpenses,
      monthlySales,
      monthlyExpenses,
      monthlyProfit: monthlySales - monthlyExpenses,
      yearlySales,
      yearlyExpenses,
      yearlyProfit: yearlySales - yearlyExpenses
    });
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('sales')
      .insert([{
        user_id: user.id,
        customer_name: saleForm.customer_name || null,
        description: saleForm.description,
        amount: parseFloat(saleForm.amount),
        sale_date: saleForm.sale_date,
        status: saleForm.status,
        invoice_number: saleForm.invoice_number || null
      }])
      .select()
      .single();

    if (!error && data) {
      setSales([data, ...sales]);
      calculateStats([data, ...sales], expenses);
      setShowSaleForm(false);
      setSaleForm({
        customer_name: '',
        description: '',
        amount: '',
        sale_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        invoice_number: ''
      });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: user.id,
        category: expenseForm.category,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expense_date: expenseForm.expense_date
      }])
      .select()
      .single();

    if (!error && data) {
      setExpenses([data, ...expenses]);
      calculateStats(sales, [data, ...expenses]);
      setShowExpenseForm(false);
      setExpenseForm({
        category: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const deleteSale = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette salget?')) return;

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (!error) {
      const newSales = sales.filter(s => s.id !== id);
      setSales(newSales);
      calculateStats(newSales, expenses);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne utgiften?')) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (!error) {
      const newExpenses = expenses.filter(e => e.id !== id);
      setExpenses(newExpenses);
      calculateStats(sales, newExpenses);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const expenseCategories = [
    'Kontorrekvisita',
    'Programvare',
    'Markedsføring',
    'Reise',
    'Kurs og opplæring',
    'Utstyr',
    'Telefon og internett',
    'Diverse'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Økonomi</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaleForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nytt salg
          </button>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ny utgift
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Oversikt
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'sales'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Salg ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'expenses'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Utgifter ({expenses.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-300 mb-1">Totalt salg</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalSales)}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">Totale utgifter</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-sm border border-cyan-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-300 mb-1">Total fortjeneste</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(stats.profit)}</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                I dag
              </h3>
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Salg</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(stats.dailySales)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Utgifter</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(stats.dailyExpenses)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Fortjeneste</p>
                  <p className={`text-xl font-bold ${stats.dailyProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {formatCurrency(stats.dailyProfit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Denne måneden
              </h3>
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Salg</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(stats.monthlySales)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Utgifter</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(stats.monthlyExpenses)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Fortjeneste</p>
                  <p className={`text-xl font-bold ${stats.monthlyProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {formatCurrency(stats.monthlyProfit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Dette året
              </h3>
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Salg</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(stats.yearlySales)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Utgifter</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(stats.yearlyExpenses)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Fortjeneste</p>
                  <p className={`text-xl font-bold ${stats.yearlyProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {formatCurrency(stats.yearlyProfit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'sales' && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Alle salg</h3>
          {sales.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Ingen salg registrert ennå</p>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {sale.customer_name && (
                          <span className="text-white font-medium">{sale.customer_name}</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                          sale.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {sale.status === 'paid' ? 'Betalt' : sale.status === 'pending' ? 'Venter' : 'Forfalt'}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-1">{sale.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{new Date(sale.sale_date).toLocaleDateString('nb-NO')}</span>
                        {sale.invoice_number && <span>Faktura: {sale.invoice_number}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-green-400">{formatCurrency(Number(sale.amount))}</span>
                      <button
                        onClick={() => deleteSale(sale.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Alle utgifter</h3>
          {expenses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Ingen utgifter registrert ennå</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">
                          {expense.category}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-1">{expense.description}</p>
                      <p className="text-sm text-slate-400">{new Date(expense.expense_date).toLocaleDateString('nb-NO')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-red-400">{formatCurrency(Number(expense.amount))}</span>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSaleForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Nytt salg</h3>
              <button onClick={() => setShowSaleForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kunde (valgfritt)</label>
                <input
                  type="text"
                  value={saleForm.customer_name}
                  onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Kundenavn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Beskrivelse *</label>
                <input
                  type="text"
                  required
                  value={saleForm.description}
                  onChange={(e) => setSaleForm({ ...saleForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Hva ble solgt?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Beløp (NOK) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={saleForm.amount}
                  onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dato *</label>
                <input
                  type="date"
                  required
                  value={saleForm.sale_date}
                  onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status *</label>
                <select
                  value={saleForm.status}
                  onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value as 'paid' | 'pending' | 'overdue' })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="pending">Venter</option>
                  <option value="paid">Betalt</option>
                  <option value="overdue">Forfalt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fakturanummer (valgfritt)</label>
                <input
                  type="text"
                  value={saleForm.invoice_number}
                  onChange={(e) => setSaleForm({ ...saleForm, invoice_number: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="F-2024-001"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                >
                  Legg til salg
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaleForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Ny utgift</h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori *</label>
                <select
                  required
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Velg kategori</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Beskrivelse *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Hva ble kjøpt?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Beløp (NOK) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dato *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                >
                  Legg til utgift
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
