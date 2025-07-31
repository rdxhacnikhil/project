import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TicketPurchase: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [ticketDescription, setTicketDescription] = useState('General Admission');

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          categories(name),
          tickets(id, user_id, status, purchase_price, description)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Error loading event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const purchaseTicket = async () => {
    if (!user || !event) return;

    setPurchasing(true);
    try {
      // Check for duplicate purchase
      const existingTicket = event.tickets?.find(
        ticket => ticket.user_id === user.id && ticket.status === 'confirmed'
      );
      if (existingTicket) {
        throw new Error('You already have a ticket for this event');
      }

      // Check ticket availability
      const ticketCount = event.tickets?.filter(ticket => ticket.status === 'confirmed').length || 0;
      if (event.ticket_limit && ticketCount >= event.ticket_limit) {
        throw new Error('No tickets available');
      }

      // Check booking deadline
      if (event.booking_deadline && new Date() > new Date(event.booking_deadline)) {
        throw new Error('Booking deadline has passed');
      }

      const { error } = await supabase
        .from('tickets')
        .insert([{
          event_id: event.id,
          user_id: user.id,
          purchase_price: event.ticket_price || 0,
          status: 'confirmed',
          description: ticketDescription
        }]);

      if (error) throw error;

      toast.success('Ticket purchased successfully!');
      navigate('/tickets');
    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      toast.error(error.message || 'Error purchasing ticket');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-12">Event not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Purchase Ticket: {event.title}</h1>
        
        <div className="space-y-4">
          {event.banner_url && (
            <img
              src={event.banner_url}
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
              <p className="text-gray-600 mt-2">{event.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date & Time:</span>{' '}
                  {format(new Date(event.date_time), 'MMM dd, yyyy - hh:mm a')}
                </p>
                {event.booking_deadline && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Booking Deadline:</span>{' '}
                    {format(new Date(event.booking_deadline), 'MMM dd, yyyy - hh:mm a')}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Venue:</span> {event.venue}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tickets:</span>{' '}
                  {event.tickets?.filter(t => t.status === 'confirmed').length || 0}/
                  {event.ticket_limit || 'Unlimited'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Price:</span>{' '}
                  ₹{event.ticket_price?.toLocaleString() || 'Free'}
                </p>
                {event.tickets?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ticket Type:</span>{' '}
                    {event.tickets[0].description || 'N/A'}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Purchase Ticket</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Description
                  </label>
                  <input
                    type="text"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., General Admission"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Confirm your purchase for this event.
                </p>
                <button
                  onClick={purchaseTicket}
                  disabled={purchasing || event.status !== 'upcoming' || !event.ticket_price}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? 'Purchasing...' : 'Buy Ticket'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate('/events')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;