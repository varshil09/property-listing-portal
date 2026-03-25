import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    setImages(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.price ||
        !formData.location || !formData.address) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      setUploading(false);
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('location', formData.location);
    submitData.append('address', formData.address);
    submitData.append('propertyType', formData.propertyType);
    submitData.append('listingType', formData.listingType);
    submitData.append('bedrooms', formData.bedrooms || 0);
    submitData.append('bathrooms', formData.bathrooms || 0);
    submitData.append('area', formData.area || 0);

    // Append images
    images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      console.log('Submitting property with images...');
      const response = await axios.post('/properties', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Property created:', response.data);

      toast.success('Property listed successfully! Waiting for admin approval.');
      navigate('/my-properties');
    } catch (error) {
      console.error('Add property error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to list property';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploading(false);

      // Cleanup previews
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address, city, state, zip code"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Property Type *</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Total square footage"
                />
              </div>

              {/* Image Upload Section */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Property Images (Max 5)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload images</span>
                        <input
                          id="file-upload"
                          name="images"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each (Max 5 images)</p>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading Images...' : loading ? 'Listing Property...' : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;