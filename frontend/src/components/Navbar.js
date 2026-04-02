import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/properties', label: 'Properties', icon: '🏘️' },
  ];

  const isActive = (path) => location.pathname === path;

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return '👤';
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-900/95 backdrop-blur-lg shadow-lg' : 'bg-dark-900'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                PropertyPortal
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-gray-300 hover:text-primary-400 hover:bg-dark-700/50'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <NotificationBell />
                  <div className="relative ml-2">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-all duration-200"
                    >
                      <div className="relative">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {getUserInitial()}
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900"></div>
                      </div>
                      <span className="text-gray-200 text-sm max-w-[100px] truncate">{user.name}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-dark-800 rounded-2xl shadow-2xl overflow-hidden z-50 border border-dark-700">
                        <div className="p-4 border-b border-dark-700 flex items-center space-x-3">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {getUserInitial()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-200 truncate">{user.name}</p>
                            <p className="text-sm text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-dark-700 text-gray-300 hover:text-primary-400 transition">
                            👤 My Profile
                          </Link>
                          <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-dark-700 text-gray-300 hover:text-primary-400 transition">
                            📊 Dashboard
                          </Link>
                          {(user.role === 'owner' || user.role === 'admin') && (
                            <Link to="/add-property" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-dark-700 text-gray-300 hover:text-primary-400 transition">
                              ➕ List Property
                            </Link>
                          )}
                          <Link to="/favorites" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-dark-700 text-gray-300 hover:text-primary-400 transition">
                            ❤️ Favorites
                          </Link>
                          <Link to="/my-inquiries" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-dark-700 text-gray-300 hover:text-primary-400 transition">
                            💬 Inquiries
                          </Link>
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-dark-700 text-gray-300 hover:text-primary-400 transition">
                              ⚙️ Admin Panel
                            </Link>
                          )}
                          <hr className="my-2 border-dark-700" />
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 transition">
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3 ml-4">
                  <Link to="/login" className="px-5 py-2 rounded-xl text-gray-300 hover:text-primary-400 transition">
                    Login
                  </Link>
                  <Link to="/register" className="px-6 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 rounded-full bg-gray-300 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 rounded-full bg-gray-300 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 rounded-full bg-gray-300 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-dark-800 border-t border-dark-700">
            <div className="container mx-auto px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-xl mb-2 ${
                    isActive(link.to) ? 'bg-primary-600/20 text-primary-400' : 'text-gray-300'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="py-3 px-4 border-t border-dark-700 mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {getUserInitial()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-200 truncate">{user.name}</p>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <NotificationBell />
                  </div>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-dark-700 rounded-xl">👤 Profile</Link>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-dark-700 rounded-xl">📊 Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left py-3 px-4 text-red-400 hover:bg-red-500/10 rounded-xl">🚪 Logout</button>
                </>
              ) : (
                <div className="space-y-2 mt-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 text-center bg-primary-600 text-white rounded-xl">Login</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 text-center border-2 border-primary-600 text-primary-400 rounded-xl">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-16 md:h-20" />
    </>
  );
};

export default Navbar;