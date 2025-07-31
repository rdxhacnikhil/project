import React from 'react';
import { useParams } from 'react-router-dom';

interface EventDetailsProps {
  events: any[];
}

const EventDetails: React.FC<EventDetailsProps> = ({ events }) => {
  const { id } = useParams<{ id: string }>();
  if (!events || events.length === 0) {
  return <div className="text-center mt-10 text-gray-500">Loading event...</div>;
}

const event = events.find((e) => String(e.id) === String(id));


  if (!event) {
    return <div className="text-center mt-10 text-red-500">Event not found.</div>;
  }

  const {
    title, description, date_time, prize_money, venue,
    organizer_name, organizer_details, contact_name,
    contact_email, contact_phone, banner_url, status,
    max_participants, is_registration_required, enable_qa,
    require_feedback, website_url, promo_video_url, tags,
    ticket_price
  } = event;

  const formatTags = (tagsStr: string | null) => {
    if (!tagsStr) return [];
    return tagsStr.split(',').map((tag) => tag.trim()).filter(Boolean);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      <img src={banner_url} alt="Event Banner" className="w-full h-64 object-cover rounded mb-6 shadow" />

      <p className="mb-4 text-gray-700">{description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><strong>Date & Time:</strong> {new Date(date_time).toLocaleString()}</div>
        <div><strong>Venue:</strong> {venue}</div>
        <div><strong>Prize Money:</strong> ₹{prize_money}</div>
        <div><strong>Max Participants:</strong> {max_participants}</div>
        <div><strong>Status:</strong> {status}</div>
        <div><strong>Registration Required:</strong> {is_registration_required ? 'Yes' : 'No'}</div>
        <div><strong>Feedback Required:</strong> {require_feedback ? 'Yes' : 'No'}</div>
        <div><strong>Q&A Enabled:</strong> {enable_qa ? 'Yes' : 'No'}</div>
      </div>
      <div><strong>Ticket Price:</strong> ₹{ticket_price ? ticket_price : 'Free'}</div>

      <hr className="my-6" />

      <div>
        <h2 className="text-xl font-semibold mb-2">Organizer Details</h2>
        <p><strong>Name:</strong> {organizer_name}</p>
        <p><strong>About:</strong> {organizer_details}</p>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Contact Info</h2>
        <p><strong>Name:</strong> {contact_name}</p>
        <p><strong>Email:</strong> {contact_email}</p>
        <p><strong>Phone:</strong> {contact_phone}</p>
      </div>

      {tags && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {formatTags(tags).length > 0 ? (
              formatTags(tags).map((tag, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))
            ) : (
              <p>No tags specified.</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        {website_url && (
          <p>
            <strong>Website: </strong>
            <a href={website_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
              Visit
            </a>
          </p>
        )}
        {promo_video_url && (
          <p>
            <strong>Promo Video: </strong>
            <a href={promo_video_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
              Watch
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
