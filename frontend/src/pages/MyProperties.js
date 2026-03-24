import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching my properties...');

      const response = await axios.get('/properties/my-properties');
      console.log('API Response:', response.data);

      // Handle both response formats
      const propertyList = response.data.data || response.data;
      setProperties(Array.isArray(propertyList) ? propertyList : []);

      if (propertyList.length === 0) {
        console.log('No properties found for this user');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch properties';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/properties/${id}`);
        if (response.data.success) {
          toast.success('Property deleted successfully');
          fetchMyProperties();
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete property');
      }
    }
  };

  const handleMarkAsSold = async (id, status) => {
    try {
      const response = await axios.put(`/properties/${id}/mark-sold`, { status });
      if (response.data.success) {
        toast.success(`Property marked as ${status}`);
        fetchMyProperties();
      }
    } catch (error) {
      console.error('Mark as sold error:', error);
      toast.error(error.response?.data?.message || 'Failed to update property status');
    }
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

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Properties</h1>
          <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add New Property
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-bold">Error Loading Properties</p>
            <p>{error}</p>
            <button
              onClick={fetchMyProperties}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-4">You haven't listed any properties yet.</p>
            <Link to="/add-property" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
              List Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {properties.map(property => (
              <div key={property._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-64 h-48 md:h-auto bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{property.title}</h3>
                        <p className="text-gray-600 mb-2">{property.location}</p>
                        <p className="text-2xl font-bold text-blue-600 mb-2">
                          ${(property.price || 0).toLocaleString()}
                          {property.listingType === 'rent' && '/month'}
                        </p>
                        <div className="flex space-x-2 mb-3">
                          {getStatusBadge(property.status)}
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            property.listingType === 'sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {property.listingType?.toUpperCase() || 'SALE'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Link
                          to={`/edit-property/${property._id}`}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                      {property.status === 'approved' && property.listingType === 'sale' && (
                        <button
                          onClick={() => handleMarkAsSold(property._id, 'sold')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Mark as Sold
                        </button>
                      )}
                      {property.status === 'approved' && property.listingType === 'rent' && (
                        <button
                          onClick={() => handleMarkAsSold(property._id, 'rented')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Mark as Rented
                        </button>
                      )}
                      <Link
                        to={`/properties/${property._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      Posted: {new Date(property.createdAt).toLocaleDateString()} |
                      Views: {property.views || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;