import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

const schema = yup.object({
  title: yup.string().required('Event name is required'),
  description: yup.string().required('Description is required'),
  category_id: yup.string().required('Category is required'),
  custom_category: yup.string().when('category_id', {
    is: 'other',
    then: (schema) => schema.required('Custom category is required'),
    otherwise: (schema) => schema.nullable()
  }),
  date_time: yup.string().required('Date and time is required'),
  prize_money: yup.number().min(0, 'Prize money must be positive').required('Prize money is required'),
  venue: yup.string().required('Venue is required'),
  organizer_name: yup.string().required('Organizer name is required'),
  organizer_details: yup.string().nullable(),
  tags: yup.string().nullable(),
  contact_name: yup.string().required('Contact person name is required'),
  contact_email: yup.string().email('Invalid email').required('Contact email is required'),
  contact_phone: yup.string().required('Contact number is required'),
  website_url: yup.string().url('Invalid URL').nullable(),
  promo_video_url: yup.string().url('Invalid URL').nullable(),
  max_participants: yup.number().min(1, 'Must allow at least 1 participant').nullable(),
  is_registration_required: yup.boolean(),
  enable_qa: yup.boolean(),
  require_feedback: yup.boolean(),
  status: yup.string().oneOf(['upcoming', 'ongoing', 'cancelled']).required('Status is required'),
  booking_deadline: yup.string().nullable().test(
    'is-before-event',
    'Booking deadline must be before event date',
    function (value) {
      if (!value) return true;
      const eventDate = this.parent.date_time;
      if (!eventDate) return true;
      return new Date(value) < new Date(eventDate);
    }
  ),
  ticket_price: yup.number().min(0, 'Ticket price must be positive').nullable(),
  ticket_limit: yup.number().min(1, 'Must have at least 1 ticket').nullable(),
  ticket_type: yup.string().oneOf(['Free', 'Paid', 'VIP', 'Early Bird']).required('Ticket type is required')
});

interface EventFormData {
  title: string;
  description: string;
  category_id: string;
  custom_category?: string;
  date_time: string;
  prize_money: number;
  venue: string;
  organizer_name: string;
  organizer_details?: string;
  tags?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url?: string;
  promo_video_url?: string;
  max_participants?: number;
  is_registration_required: boolean;
  enable_qa: boolean;
  require_feedback: boolean;
  status: 'upcoming' | 'ongoing' | 'cancelled';
  booking_deadline?: string | null;
  ticket_price?: number | null;
  ticket_limit?: number | null;
  ticket_type: 'Free' | 'Paid' | 'VIP' | 'Early Bird';
}

const EditEvent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_registration_required: true,
      enable_qa: true,
      require_feedback: true,
      status: 'upcoming',
      prize_money: 0,
      booking_deadline: null,
      ticket_price: null,
      ticket_limit: null,
      ticket_type: 'Free'
    }
  });

  const watchCategoryId = watch('category_id');

  useEffect(() => {
    fetchCategories();
    fetchEvent();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    }
  };

  const fetchEvent = async () => {
    if (!id || !user) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error('Event not found or you are not authorized to edit this event');
        navigate('/events');
        return;
      }

      reset({
        title: data.title,
        description: data.description,
        category_id: data.category_id || 'other',
        custom_category: data.custom_category,
        date_time: new Date(data.date_time).toISOString().slice(0, 16),
        prize_money: data.prize_money,
        venue: data.venue,
        organizer_name: data.organizer_name,
        organizer_details: data.organizer_details,
        tags: data.tags,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        website_url: data.website_url,
        promo_video_url: data.promo_video_url,
        max_participants: data.max_participants,
        is_registration_required: data.is_registration_required,
        enable_qa: data.enable_qa,
        require_feedback: data.require_feedback,
        status: data.status,
        booking_deadline: data.booking_deadline ? new Date(data.booking_deadline).toISOString().slice(0, 16) : null,
        ticket_price: data.ticket_price,
        ticket_limit: data.ticket_limit,
        ticket_type: data.ticket_type || 'Free'
      });
      setBannerPreview(data.banner_url);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Error loading event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const uploadBanner = async (): Promise<string | null> => {
    if (!bannerFile || !user) return null;

    try {
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-banners')
        .upload(fileName, bannerFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('event-banners')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Error uploading banner');
      return null;
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!user || !id) return;

    setLoading(true);
    try {
      const bannerUrl = bannerFile ? await uploadBanner() : bannerPreview;

      const eventData = {
        ...data,
        user_id: user.id,
        banner_url: bannerUrl,
        category_id: data.category_id === 'other' ? null : data.category_id,
        custom_category: data.category_id === 'other' ? data.custom_category : null,
        max_participants: data.max_participants || null,
        website_url: data.website_url || null,
        promo_video_url: data.promo_video_url || null,
        organizer_details: data.organizer_details || null,
        tags: data.tags || null,
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Event updated successfully!');
      navigate('/events');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Error updating event');
    } finally {
      setLoading(false);
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event name"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          {watchCategoryId === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Category *
              </label>
              <input
                {...register('custom_category')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter custom category"
              />
              {errors.custom_category && (
                <p className="mt-1 text-sm text-red-600">{errors.custom_category.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your event"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>
              <input
                {...register('date_time')}
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.date_time && (
                <p className="mt-1 text-sm text-red-600">{errors.date_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Money (₹) *
              </label>
              <input
                {...register('prize_money')}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.prize_money && (
                <p className="mt-1 text-sm text-red-600">{errors.prize_money.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants
              </label>
              <input
                {...register('max_participants')}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Unlimited"
              />
              {errors.max_participants && (
                <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue *
            </label>
            <input
              {...register('venue')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event venue location"
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">🎟️ Ticket Settings</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Type *
              </label>
              <select
                {...register('ticket_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
                <option value="VIP">VIP</option>
                <option value="Early Bird">Early Bird</option>
              </select>
              {errors.ticket_type && (
                <p className="mt-1 text-sm text-red-600">{errors.ticket_type.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Deadline
              </label>
              <input
                {...register('booking_deadline')}
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.booking_deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.booking_deadline.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Price (₹)
              </label>
              <input
                {...register('ticket_price')}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.ticket_price && (
                <p className="mt-1 text-sm text-red-600">{errors.ticket_price.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Tickets Available
              </label>
              <input
                {...register('ticket_limit')}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Unlimited"
              />
              {errors.ticket_limit && (
                <p className="mt-1 text-sm text-red-600">{errors.ticket_limit.message}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organizer Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizer Name *
                </label>
                <input
                  {...register('organizer_name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Organization or person name"
                />
                {errors.organizer_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizer_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizer Details
                </label>
                <input
                  {...register('organizer_details')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Department/Club/Admin"
                />
                {errors.organizer_details && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizer_details.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  {...register('contact_name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact person name"
                />
                {errors.contact_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  {...register('contact_email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@example.com"
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  {...register('contact_phone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
                {errors.contact_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  {...register('website_url')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.website_url.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Video URL
                </label>
                <input
                  {...register('promo_video_url')}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="YouTube/Vimeo URL"
                />
                {errors.promo_video_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.promo_video_url.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="technology, workshop, innovation (comma-separated)"
              />
              {errors.tags && (
                <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Banner</h3>
            <div className="space-y-4">
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload event banner</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  {...register('is_registration_required')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Registration required</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('enable_qa')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Q&A section</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('require_feedback')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require feedback after event</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;