import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import PropertyCard from '../components/PropertyCard';
import Navbar from '../components/Navbar';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = location.search;
      console.log('Fetching properties with query:', queryString);

      const response = await axios.get(`/properties${queryString}`);
      console.log('Properties response:', response.data);

      // Handle both response formats
      const propertyList = response.data.data || response.data;
      setProperties(Array.isArray(propertyList) ? propertyList : []);

      if (propertyList.length === 0) {
        console.log('No properties found');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch properties';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Browse Properties</h1>
          <button
            onClick={() => navigate('/add-property')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            List Your Property
          </button>
        </div>

        <SearchFilters />

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-bold">Error Loading Properties</p>
            <p>{error}</p>
            <button
              onClick={fetchProperties}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No properties found matching your criteria.</p>
            <button
              onClick={() => navigate('/add-property')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              List Your Property
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">Found {properties.length} properties</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;