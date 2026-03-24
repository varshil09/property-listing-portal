import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchFilters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [filters, setFilters] = useState({
    location: queryParams.get('location') || '',
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    propertyType: queryParams.get('propertyType') || '',
    listingType: queryParams.get('listingType') || '',
    bedrooms: queryParams.get('bedrooms') || '',
    bathrooms: queryParams.get('bathrooms') || '',
    sort: queryParams.get('sort') || 'newest'
  });

  useEffect(() => {
    // Update filters when URL changes
    setFilters({
      location: queryParams.get('location') || '',
      minPrice: queryParams.get('minPrice') || '',
      maxPrice: queryParams.get('maxPrice') || '',
      propertyType: queryParams.get('propertyType') || '',
      listingType: queryParams.get('listingType') || '',
      bedrooms: queryParams.get('bedrooms') || '',
      bathrooms: queryParams.get('bathrooms') || '',
      sort: queryParams.get('sort') || 'newest'
    });
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const queryString = params.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ''}`);
  };

  const handleReset = () => {
    const resetFilters = {
      location: '',
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      listingType: '',
      bedrooms: '',
      bathrooms: '',
      sort: 'newest'
    };
    setFilters(resetFilters);
    navigate('/properties');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          name="location"
          placeholder="Search by city or location"
          value={filters.location}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="propertyType"
          value={filters.propertyType}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Property Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
        <select
          name="listingType"
          value={filters.listingType}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Listings</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <select
          name="bedrooms"
          value={filters.bedrooms}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any Bedrooms</option>
          <option value="1">1+ Bedrooms</option>
          <option value="2">2+ Bedrooms</option>
          <option value="3">3+ Bedrooms</option>
          <option value="4">4+ Bedrooms</option>
          <option value="5">5+ Bedrooms</option>
        </select>
        <select
          name="bathrooms"
          value={filters.bathrooms}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any Bathrooms</option>
          <option value="1">1+ Bathrooms</option>
          <option value="2">2+ Bathrooms</option>
          <option value="3">3+ Bathrooms</option>
          <option value="4">4+ Bathrooms</option>
        </select>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Apply Filters
        </button>
        <button type="button" onClick={handleReset} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">
          Reset
        </button>
      </div>
    </form>
  );
};

export default SearchFilters;