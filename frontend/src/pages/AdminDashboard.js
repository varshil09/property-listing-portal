import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchPendingProperties(),
      fetchUsers()
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      console.log('Stats response:', response.data);
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchPendingProperties = async () => {
    try {
      const response = await axios.get('/admin/pending-properties');
      console.log('Pending properties:', response.data);
      const properties = response.data.data || response.data;
      setPendingProperties(Array.isArray(properties) ? properties : []);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      toast.error('Failed to fetch pending properties');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      console.log('Users:', response.data);
      const usersList = response.data.data || response.data;
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleApprove = async (propertyId) => {
    try {
      const response = await axios.put(`/admin/approve-property/${propertyId}`);
      if (response.data.success) {
        toast.success('Property approved successfully!');
        fetchPendingProperties();
        fetchStats();
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve property');
    }
  };

  const handleReject = async (propertyId) => {
    try {
      const response = await axios.put(`/admin/reject-property/${propertyId}`);
      if (response.data.success) {
        toast.success('Property rejected!');
        fetchPendingProperties();
        fetchStats();
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject property');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/admin/users/${userId}`);
        if (response.data.success) {
          toast.success('User deleted successfully');
          fetchUsers();
          fetchStats();
        }
      } catch (error) {
        console.error('Delete user error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Properties ({pendingProperties.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({users.length})
            </button>
          </nav>
        </div>

        {/* Statistics Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Properties</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.totalProperties || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Approved</h3>
              <p className="text-4xl font-bold text-green-600">{stats.approvedProperties || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending</h3>
              <p className="text-4xl font-bold text-yellow-600">{stats.pendingProperties || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Users</h3>
              <p className="text-4xl font-bold text-purple-600">{stats.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Inquiries</h3>
              <p className="text-4xl font-bold text-orange-600">{stats.totalInquiries || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Views</h3>
              <p className="text-4xl font-bold text-red-600">{(stats.totalViews || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Pending Properties Tab */}
        {activeTab === 'pending' && (
          <div>
            {pendingProperties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">No pending properties to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProperties.map(property => (
                  <div key={property._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-48 h-48 md:h-auto bg-gray-100">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{property.title}</h3>
                            <p className="text-gray-600 mb-1">{property.location}</p>
                            <p className="text-lg font-bold text-blue-600 mb-2">
                              ${property.price?.toLocaleString()}
                              {property.listingType === 'rent' && '/month'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Posted by: {property.owner?.name} ({property.owner?.email})
                            </p>
                          </div>
                          <div className="space-x-2">
                            <button
                              onClick={() => handleApprove(property._id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(property._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-2 text-sm text-gray-500">
                          <span>{property.bedrooms} beds</span>
                          <span>{property.bathrooms} baths</span>
                          <span>{property.area} sqft</span>
                          <span className="capitalize">{property.propertyType}</span>
                        </div>
                        <p className="mt-3 text-gray-600 line-clamp-2">{property.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;