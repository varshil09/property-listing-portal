import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (user && property) {
      checkFavorite();
    }
  }, [user, property]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching property:', id);

      const response = await axios.get(`/properties/${id}`);
      console.log('Property response:', response.data);

      const propertyData = response.data.data || response.data;
      setProperty(propertyData);
    } catch (error) {
      console.error('Error fetching property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load property';
      setError(errorMessage);
      toast.error(errorMessage);

      // Redirect after 2 seconds if property not found
      if (error.response?.status === 404) {
        setTimeout(() => navigate('/properties'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await axios.get('/users/favorites');
      const favorites = response.data.data || response.data;
      setIsFavorite(favorites.some(fav => fav.property?._id === id || fav.property === id));
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to send an inquiry');
      navigate('/login');
      return;
    }

    if (!inquiryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingInquiry(true);
    try {
      const response = await axios.post('/inquiries', {
        propertyId: id,
        message: inquiryMessage
      });

      if (response.data.success) {
        toast.success('Inquiry sent successfully! The owner will respond shortly.');
        setInquiryMessage('');
        setShowInquiryForm(false);
      }
    } catch (error) {
      console.error('Inquiry error:', error);
      toast.error(error.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to save favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`/users/favorites/${id}`);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await axios.post('/users/favorites', { propertyId: id });
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      sold: 'bg-gray-500',
      rented: 'bg-blue-500'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${colors[status] || 'bg-gray-500'}`}>
        {status?.toUpperCase() || 'PENDING'}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
            <p className="font-bold text-lg mb-2">Error Loading Property</p>
            <p>{error}</p>
            <button
              onClick={() => navigate('/properties')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const isOwner = user && (user._id === property.owner?._id || user.role === 'admin');
  const canInquire = user && user.role === 'buyer' && property.status === 'approved';

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Image Section */}
              <div className="relative h-96">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x400?text=Property+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No image available</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    property.listingType === 'sale'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {property.listingType === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                  </span>
                  {property.status !== 'approved' && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500 text-white">
                      {property.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                    <p className="text-gray-600 mt-2 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </p>
                  </div>
                  {user && !isOwner && (
                    <button
                      onClick={toggleFavorite}
                      className={`px-4 py-2 rounded-lg transition ${
                        isFavorite
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isFavorite ? '★ Saved' : '☆ Save'}
                    </button>
                  )}
                </div>

                <p className="text-3xl font-bold text-blue-600 mb-6">
                  {formatPrice(property.price)}
                  {property.listingType === 'rent' && <span className="text-lg font-normal">/month</span>}
                </p>

                {/* Property Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-lg">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-lg">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-lg">{property.area}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-lg capitalize">{property.propertyType}</div>
                    <div className="text-sm text-gray-600">Property Type</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
                </div>

                {/* Address */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Address</h2>
                  <p className="text-gray-700">{property.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-800 text-lg">{property.owner?.name || 'Property Owner'}</p>
                <p className="text-gray-600 text-sm mt-1">Email: {property.owner?.email || 'Not available'}</p>
                {property.owner?.phone && (
                  <p className="text-gray-600 text-sm mt-1">Phone: {property.owner.phone}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">Member since: {property.owner?.createdAt ? new Date(property.owner.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            {/* Inquiry Form */}
            {!isOwner && property.status === 'approved' && (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Interested in this property?</h2>

                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Please login to send an inquiry</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full btn-primary"
                    >
                      Login to Contact
                    </button>
                  </div>
                ) : user.role === 'owner' ? (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">This is your property</p>
                    <button
                      onClick={() => navigate('/my-properties')}
                      className="mt-3 text-blue-600 hover:text-blue-800"
                    >
                      View all your properties →
                    </button>
                  </div>
                ) : user.role === 'buyer' ? (
                  !showInquiryForm ? (
                    <button
                      onClick={() => setShowInquiryForm(true)}
                      className="w-full btn-primary"
                    >
                      Send Inquiry
                    </button>
                  ) : (
                    <form onSubmit={handleInquiry}>
                      <textarea
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Write your message here... I'm interested in this property and would like to know more details."
                        className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="5"
                        required
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={sendingInquiry}
                          className="flex-1 btn-primary disabled:opacity-50"
                        >
                          {sendingInquiry ? 'Sending...' : 'Send'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(false)}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Admin view only</p>
                  </div>
                )}
              </div>
            )}

            {/* Status for owner */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Property Status</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Status:</span>
                    {getStatusBadge(property.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Views:</span>
                    <span className="font-semibold">{property.views || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Listed on:</span>
                    <span className="text-sm">{new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/edit-property/${property._id}`)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-3"
                  >
                    Edit Property
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;