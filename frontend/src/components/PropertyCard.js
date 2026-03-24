import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    if (!status || status === 'approved') return null;
    const colors = {
      pending: 'bg-yellow-500',
      rejected: 'bg-red-500',
      sold: 'bg-gray-500',
      rented: 'bg-blue-500'
    };
    return (
      <span className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white ${colors[status] || 'bg-gray-500'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <Link to={`/properties/${property._id}`} className="block group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              property.listingType === 'sale'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}>
              {property.listingType === 'sale' ? 'FOR SALE' : 'FOR RENT'}
            </span>
          </div>
          {getStatusBadge(property.status)}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-1">{property.location}</p>
          <p className="text-2xl font-bold text-blue-600 mb-3">
            {formatPrice(property.price)}
            {property.listingType === 'rent' && <span className="text-sm font-normal">/month</span>}
          </p>
          <div className="flex justify-between text-sm text-gray-500 border-t pt-3">
            <span>{property.bedrooms || 0} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            <span>{property.bathrooms || 0} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            <span>{property.area || 0} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;