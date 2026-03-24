import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    propertyType: 'apartment',
    listingType: 'sale',
    bedrooms: '',
    bathrooms: '',
    area: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.price ||
        !formData.location || !formData.address) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Convert numbers
    const propertyData = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      area: Number(formData.area) || 0
    };

    try {
      console.log('Submitting property:', propertyData);
      const response = await axios.post('/properties', propertyData);
      console.log('Property created:', response.data);

      toast.success('Property listed successfully! Waiting for admin approval.');
      navigate('/my-properties');
    } catch (error) {
      console.error('Add property error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to list property';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
          <p className="text-gray-600 mb-8">Fill in the details below to list your property. Our admin will review and approve it.</p>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Beautiful 3-Bedroom Apartment"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="input-field"
                  placeholder="Describe your property in detail..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Location (City) *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., New York"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Full Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Street address, city, state, zip code"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Property Type *</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Listing Type *</label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Bedrooms *</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="Number of bedrooms"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Bathrooms *</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.5"
                  className="input-field"
                  placeholder="Number of bathrooms"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Area (sq ft) *</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="Total square footage"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Listing Property...' : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;