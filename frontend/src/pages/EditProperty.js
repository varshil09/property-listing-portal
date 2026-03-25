import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
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
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching property for edit:', id);

      const response = await axios.get(`/properties/${id}`);
      console.log('Property data:', response.data);

      const property = response.data.data || response.data;

      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '',
        location: property.location || '',
        address: property.address || '',
        propertyType: property.propertyType || 'apartment',
        listingType: property.listingType || 'sale',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area: property.area || ''
      });

      setExistingImages(property.images || []);
    } catch (error) {
      console.error('Error fetching property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch property';
      setError(errorMessage);
      toast.error(errorMessage);

      setTimeout(() => navigate('/my-properties'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length > 5) {
      toast.error('You can only have up to 5 images total');
      return;
    }

    setNewImages([...newImages, ...files]);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeExistingImage = async (index) => {
    // Note: You'll need an API endpoint to delete individual images
    // For now, we'll mark it for removal and handle on submit
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  const removeNewImage = (index) => {
    const newNewImages = [...newImages];
    newNewImages.splice(index, 1);
    setNewImages(newNewImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploading(true);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.price ||
        !formData.location || !formData.address) {
      toast.error('Please fill in all required fields');
      setSubmitting(false);
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

    // Append existing images URLs
    existingImages.forEach(image => {
      submitData.append('existingImages', image);
    });

    // Append new images
    newImages.forEach(image => {
      submitData.append('images', image);
    });

    try {
      console.log('Updating property:', id);
      const response = await axios.put(`/properties/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Property updated successfully!');
        navigate('/my-properties');
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setSubmitting(false);
      setUploading(false);

      // Cleanup previews
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    }
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
              onClick={() => navigate('/my-properties')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to My Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Property</h1>

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
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                />
              </div>

              {/* Image Upload Section */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Property Images</label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload new images</span>
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
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each (Max 5 total)</p>
                  </div>
                </div>

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">New Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading Images...' : submitting ? 'Updating...' : 'Update Property'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-properties')}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;