import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react';
import { supabase, Revenue, Event } from '../lib/supabase';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

interface RevenueWithEvent extends Revenue {
  events: Event & {
    categories?: { name: string };
  };
}

const Revenues: React.FC = () => {
  const [revenues, setRevenues] = useState<RevenueWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
    thisYearRevenue: 0,
    avgRevenuePerEvent: 0,
    topEvent: null as RevenueWithEvent | null
  });

  useEffect(() => {
    fetchRevenues();
  }, []);

  useEffect(() => {
    calculateStats();
    generateChartData();
  }, [revenues, timeFilter]);

  const fetchRevenues = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .select(`
          *,
          events (
            *,
            categories (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRevenues(data || []);
    } catch (error) {
      console.error('Error fetching revenues:', error);
      toast.error('Error loading revenue data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const todayRevenue = revenues
      .filter(r => new Date(r.created_at) >= todayStart)
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const thisMonthRevenue = revenues
      .filter(r => new Date(r.created_at) >= monthStart)
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const thisYearRevenue = revenues
      .filter(r => new Date(r.created_at) >= yearStart)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const eventRevenues = revenues.reduce((acc, revenue) => {
      const eventId = revenue.event_id;
      if (!acc[eventId]) {
        acc[eventId] = { ...revenue, totalAmount: 0 };
      }
      acc[eventId].totalAmount += Number(revenue.amount);
      return acc;
    }, {} as { [key: string]: RevenueWithEvent & { totalAmount: number } });

    const topEvent = Object.values(eventRevenues).reduce((max, event) => 
      event.totalAmount > (max?.totalAmount || 0) ? event : max, null);

    const avgRevenuePerEvent = Object.keys(eventRevenues).length > 0 
      ? totalRevenue / Object.keys(eventRevenues).length 
      : 0;

    setStats({
      totalRevenue,
      todayRevenue,
      thisMonthRevenue,
      thisYearRevenue,
      avgRevenuePerEvent,
      topEvent
    });
  };

  const generateChartData = () => {
    // Generate daily revenue for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayRevenue = revenues
        .filter(r => {
          const revenueDate = new Date(r.created_at);
          return revenueDate.toDateString() === date.toDateString();
        })
        .reduce((sum, r) => sum + Number(r.amount), 0);
      
      return {
        date: format(date, 'MMM dd'),
        revenue: dayRevenue
      };
    });
    setChartData(last7Days);

    // Generate category-wise revenue
    const categoryStats: { [key: string]: number } = {};
    revenues.forEach(revenue => {
      const categoryName = revenue.events.categories?.name || 'Other';
      categoryStats[categoryName] = (categoryStats[categoryName] || 0) + Number(revenue.amount);
    });

    const categoryArray = Object.entries(categoryStats).map(([name, amount]) => ({
      name,
      value: amount
    }));
    setCategoryData(categoryArray);

    // Generate monthly revenue for current year
    const monthlyStats: { [key: string]: number } = {};
    const currentYear = new Date().getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const monthName = format(new Date(currentYear, month, 1), 'MMM');
      monthlyStats[monthName] = 0;
    }

    revenues
      .filter(r => new Date(r.created_at).getFullYear() === currentYear)
      .forEach(revenue => {
        const monthName = format(new Date(revenue.created_at), 'MMM');
        monthlyStats[monthName] += Number(revenue.amount);
      });

    const monthlyArray = Object.entries(monthlyStats).map(([month, revenue]) => ({
      month,
      revenue
    }));
    setMonthlyData(monthlyArray);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze your event revenue performance</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.todayRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.thisMonthRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg per Event</p>
              <p className="text-2xl font-bold text-gray-900">₹{Math.round(stats.avgRevenuePerEvent).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue ({new Date().getFullYear()})</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performing Event */}
      {stats.topEvent && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Event</h2>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">{stats.topEvent.events.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.topEvent.events.description.substring(0, 100)}...</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-600">
                  {format(new Date(stats.topEvent.events.date_time), 'MMM dd, yyyy')}
                </span>
                <span className="text-sm text-gray-600">{stats.topEvent.events.venue}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ₹{(stats.topEvent as any).totalAmount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenues.slice(0, 10).map((revenue) => (
                <tr key={revenue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {revenue.events.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {revenue.events.venue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      ₹{Number(revenue.amount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(revenue.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {revenue.description || 'Event revenue'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenues;