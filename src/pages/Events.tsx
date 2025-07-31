import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, DollarSign, Search, Edit2, Trash2, Ticket } from 'lucide-react';
import { supabase, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          banner_url,
          date_time,
          booking_deadline,
          venue,
          ticket_limit,
          ticket_price,
          ticket_type,
          prize_money,
          status,
          organizer_name,
          user_id,
          categories(name),
          profiles(name),
          tickets(id, user_id, created_at, status, purchase_price, description)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch events');
      }

      // Ensure data is an array and handle null/undefined cases
      setEvents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Error loading events');
      toast.error(error.message || 'Error loading events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleDelete = async (eventId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete an event');
      return;
    }
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Event deleted successfully!');
        setEvents(events.filter(event => event.id !== eventId));
      } catch (error: any) {
        console.error('Error deleting event:', error);
        toast.error(error.message || 'Error deleting event');
      }
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

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading events</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchEvents}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Manage and view all your events</p>
        </div>
        <Link
          to="/events/create"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {event.banner_url && (
                <img
                  src={event.banner_url}
                  alt={event.title || 'Event banner'}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title || 'Untitled Event'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status || 'upcoming')}`}>
                    {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description || 'No description available'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date_time
                      ? format(new Date(event.date_time), 'MMM dd, yyyy - hh:mm a')
                      : 'Date not set'}
                  </div>
                  {event.booking_deadline && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Booking by: {format(new Date(event.booking_deadline), 'MMM dd, yyyy - hh:mm a')}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.venue || 'Venue not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.tickets?.length || 0}/{event.ticket_limit || 'Unlimited'} tickets
                  </div>
                  {event.prize_money > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ₹{event.prize_money.toLocaleString()} prize
                    </div>
                  )}
                  {event.ticket_price > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Ticket className="w-4 h-4 mr-2" />
                      ₹{event.ticket_price.toLocaleString()} per ticket
                    </div>
                  )}
                  {event.ticket_type && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Ticket className="w-4 h-4 mr-2" />
                      Ticket Type: {event.ticket_type}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    By {event.profiles?.name || event.organizer_name || 'Unknown'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Details
                    </Link>
                    {user?.id === event.user_id ? (
                      <>
                        <Link
                          to={`/events/${event.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                        >
                          <Edit2 className="w-4 h-4 inline mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </button>
                      </>
                    ) : (
                      event.ticket_price > 0 && event.status === 'upcoming' && (
                        <Link
                          to={`/events/${event.id}/ticket`}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Buy Ticket
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first event'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  to="/events/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;