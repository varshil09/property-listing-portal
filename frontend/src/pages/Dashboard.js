import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  const buyerLinks = [
    { to: '/favorites', icon: '❤️', title: 'Saved Properties', description: 'View your favorite listings' },
    { to: '/my-inquiries', icon: '📧', title: 'My Inquiries', description: 'Track your property inquiries' },
    { to: '/properties', icon: '🔍', title: 'Browse Properties', description: 'Search for new properties' }
  ];

  const ownerLinks = [
    { to: '/my-properties', icon: '🏠', title: 'My Properties', description: 'Manage your listings' },
    { to: '/add-property', icon: '➕', title: 'Add Property', description: 'List a new property' },
    { to: '/my-inquiries', icon: '💬', title: 'Property Inquiries', description: 'Respond to buyer inquiries' }
  ];

  const links = user?.role === 'buyer' ? buyerLinks : ownerLinks;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your property activities from your dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-3">{link.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                {link.title}
              </h3>
              <p className="text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>

        {user?.role === 'admin' && (
          <div className="mt-8">
            <Link
              to="/admin"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center block"
            >
              <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
              <p>Access admin controls, manage users, and approve properties</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;