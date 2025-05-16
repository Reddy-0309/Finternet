import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import NotificationCenter from './NotificationCenter';
import BlockchainConnect from './BlockchainConnect';
import ThemeToggle from './ThemeToggle';
import { FaUser, FaChevronDown, FaCubes } from 'react-icons/fa';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="bg-primary-700 dark:bg-gray-800 text-white shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold" data-tour="welcome">Finternet</Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/" className="hover:text-primary-200 transition-colors" data-tour="dashboard">
                  Dashboard
                </Link>
                <Link to="/assets" className="hover:text-primary-200 transition-colors" data-tour="assets">
                  Assets
                </Link>
                <Link to="/transactions" className="hover:text-primary-200 transition-colors">
                  Transactions
                </Link>
                <Link to="/payments" className="hover:text-primary-200 transition-colors">
                  Payments
                </Link>
                <Link to="/blockchain" className="hover:text-primary-200 transition-colors flex items-center" data-tour="blockchain-explorer">
                  <FaCubes className="mr-1" /> Blockchain
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <BlockchainConnect />
                <div data-tour="notifications">
                  <NotificationCenter />
                </div>
                
                <div className="relative">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full p-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-800 dark:bg-gray-700 flex items-center justify-center">
                      <FaUser />
                    </div>
                    <span className="hidden md:inline-block">{user.name}</span>
                    <FaChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                        data-tour="settings"
                      >
                        Settings
                      </Link>
                      <Link 
                        to="/blockchain" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Blockchain Explorer
                      </Link>
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }} 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link 
                to="/login" 
                className="hover:text-primary-200 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-800 dark:bg-gray-700 hover:bg-primary-900 dark:hover:bg-gray-600 px-4 py-2 rounded-md transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
