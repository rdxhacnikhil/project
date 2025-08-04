import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Settings as SettingsIcon,
  UserCog,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    pastEvents: 0,
    totalRevenue: 0,
    totalParticipants: 0,
    avgFeedbackRating: 0,
    totalFeedbacks: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else {
          setRecentEvents(events || []);
        }

        // Calculate stats
        const { data: allEvents, error: allEventsError } = await supabase
          .from('events')
          .select('*');

        if (!allEventsError && allEvents) {
          const now = new Date();
          
          // Use status field from database if available, otherwise calculate based on date
          const upcoming = allEvents.filter(e => {
            if (e.status) {
              return e.status === 'upcoming';
            }
            return new Date(e.date_time) > now;
          });
          
          const ongoing = allEvents.filter(e => {
            if (e.status) {
              return e.status === 'ongoing';
            }
            const eventDate = new Date(e.date_time);
            const endDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after start
            return eventDate <= now && now <= endDate;
          });
          
          const past = allEvents.filter(e => {
            if (e.status) {
              return e.status === 'cancelled' || e.status === 'completed';
            }
            return new Date(e.date_time) < now;
          });

          setStats({
            totalEvents: allEvents.length,
            upcomingEvents: upcoming.length,
            ongoingEvents: ongoing.length,
            pastEvents: past.length,
            totalRevenue: allEvents.reduce((sum, e) => sum + (e.prize_money || 0), 0),
            totalParticipants: allEvents.reduce((sum, e) => sum + (e.max_participants || 0), 0),
            avgFeedbackRating: 4.2, // Will be calculated from feedbacks table
            totalFeedbacks: 0 // Will be fetched from feedbacks table
          });
        }

        // Generate chart data (last 7 days)
        const chartDataArray = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(startOfDay(new Date()), i);
          const dayEvents = allEvents?.filter(e => 
            format(new Date(e.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          ) || [];
          chartDataArray.push({
            date: format(date, 'MMM dd'),
            events: dayEvents.length
          });
        }
        setChartData(chartDataArray);

        // Generate category data
        if (allEvents) {
          const categoryCount: { [key: string]: number } = {};
          allEvents.forEach(event => {
            const category = event.custom_category || 'Other';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          });
          
          const categoryArray = Object.entries(categoryCount).map(([name, value]) => ({
            name,
            value
          }));
          setCategoryData(categoryArray);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.user_metadata?.name || 'Admin'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your events today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgFeedbackRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/events/create"
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md"
          >
            <Plus className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create Event</h3>
              <p className="text-sm text-gray-600">Set up a new event</p>
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md"
          >
            <Calendar className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Events</h3>
              <p className="text-sm text-gray-600">View and edit events</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md"
          >
            <UserCog className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">View user activities</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Over Time Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Events Created (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Events by Category Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Events by Category</h2>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-3xl font-bold text-blue-600">{stats.upcomingEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Events scheduled for future</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ongoing Events</p>
              <p className="text-3xl font-bold text-green-600">{stats.ongoingEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Events happening now</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Past Events</p>
              <p className="text-3xl font-bold text-gray-600">{stats.pastEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Completed events</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <MessageSquare className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          <Link
            to="/admin/events"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading events...</p>
          ) : recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <div key={event.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {format(new Date(event.date_time), 'MMM dd, yyyy')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      event.status === 'past' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ₹{event.prize_money?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {event.max_participants || 0} participants
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">No events found. Create your first event!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;