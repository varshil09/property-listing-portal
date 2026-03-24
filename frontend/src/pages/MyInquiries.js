import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const MyInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'owner'
        ? '/inquiries/owner-inquiries'
        : '/inquiries/my-inquiries';

      console.log(`Fetching inquiries from: ${endpoint}`);
      const response = await axios.get(endpoint);
      console.log('Inquiries response:', response.data);

      const inquiriesList = response.data.data || response.data;
      setInquiries(Array.isArray(inquiriesList) ? inquiriesList : []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (inquiryId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const response = await axios.put(`/inquiries/${inquiryId}/respond`, {
        response: responseText
      });

      if (response.data.success) {
        toast.success('Response sent successfully');
        setResponding(null);
        setResponseText('');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Respond error:', error);
      toast.error(error.response?.data?.message || 'Failed to send response');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      responded: 'bg-green-500',
      closed: 'bg-gray-500'
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
        <h1 className="text-3xl font-bold mb-8">
          {user?.role === 'owner' ? 'Property Inquiries' : 'My Inquiries'}
        </h1>

        {inquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No inquiries found.</p>
            {user?.role === 'buyer' && (
              <a href="/properties" className="btn-primary inline-block mt-4">
                Browse Properties
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {inquiries.map(inquiry => (
              <div key={inquiry._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {user?.role === 'owner'
                          ? `Inquiry from ${inquiry.buyer?.name || 'Unknown'}`
                          : `Inquiry about ${inquiry.property?.title || 'Property'}`
                        }
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(inquiry.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 font-semibold mb-1">Message:</p>
                    <p className="text-gray-600">{inquiry.message}</p>
                  </div>

                  {inquiry.response && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-700 mb-2">Response:</p>
                      <p className="text-gray-600">{inquiry.response}</p>
                      {inquiry.respondedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Responded on {formatDate(inquiry.respondedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {user?.role === 'owner' && inquiry.status === 'pending' && (
                    <div className="mt-4">
                      {responding === inquiry._id ? (
                        <div>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response here..."
                            className="w-full p-3 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRespond(inquiry._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              Send Response
                            </button>
                            <button
                              onClick={() => {
                                setResponding(null);
                                setResponseText('');
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResponding(inquiry._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Respond to Inquiry
                        </button>
                      )}
                    </div>
                  )}

                  {user?.role === 'buyer' && inquiry.property && (
                    <div className="mt-4 pt-4 border-t">
                      <a
                        href={`/properties/${inquiry.property._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Property Details →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInquiries;