import React, { useEffect, useState } from 'react';
import { Ticket as TicketIcon, Calendar, MapPin, Users, Eye } from 'lucide-react';
import { supabase, Ticket, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TicketWithEvent extends Ticket {
  events: Event & { user_id: { name: string }; categories: { name: string } };
}

const Tickets: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          event_id,
          user_id,
          created_at,
          status,
          purchase_price,
          description,
          events (
            *,
            categories(name),
            user_id:profiles(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'past':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-1">View all your booked event tickets</p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-gray-600">
          Total Bookings: {tickets.length}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.events.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {ticket.events.description.length > 100 
                            ? `${ticket.events.description.substring(0, 100)}...`
                            : ticket.events.description
                          }
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.events.status)}`}>
                        {ticket.events.status.charAt(0).toUpperCase() + ticket.events.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(ticket.events.date_time), 'MMM dd, yyyy - hh:mm a')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {ticket.events.venue}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TicketIcon className="w-4 h-4 mr-2" />
                        Booked on {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TicketIcon className="w-4 h-4 mr-2" />
                        Ticket Type: {ticket.description || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TicketIcon className="w-4 h-4 mr-2" />
                        Price: ₹{ticket.purchase_price.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Organized by {ticket.events.user_id?.name || ticket.events.organizer_name}
                      </div>
                      <div className="flex items-center space-x-4">
                        {ticket.events.prize_money > 0 && (
                          <span className="text-sm font-medium text-green-600">
                            ₹{ticket.events.prize_money.toLocaleString()} Prize
                          </span>
                        )}
                        <button
                          onClick={() => navigate(`/events/${ticket.event_id}`)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Card */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white min-w-64">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium opacity-80">TICKET</span>
                        <TicketIcon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{ticket.events.title}</h4>
                      <p className="text-xs opacity-80 mb-2">{ticket.events.venue}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs opacity-80">Date</p>
                          <p className="text-sm font-medium">
                            {format(new Date(ticket.events.date_time), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-80">Holder</p>
                          <p className="text-sm font-medium">{profile?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-4">
              You haven't booked any event tickets yet.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <TicketIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.events.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Events Attended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.events.status === 'past').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;