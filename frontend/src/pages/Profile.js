import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaEdit, FaKey, FaShieldAlt, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MfaSetup from '../components/MfaSetup';

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    walletAddress: ''
  });

  // For demo purposes, we'll use mock data
  useEffect(() => {
    // In a real app, this would be fetched from an API
    setProfileData({
      name: user?.user?.name || user?.name || 'John Doe',
      email: user?.user?.email || user?.email || 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42)
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the updated profile to an API
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  // Check if user has MFA enabled
  const isMfaEnabled = user?.user?.mfaEnabled || false;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-primary-600 hover:text-primary-800"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                <div>
                  <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">Wallet Address</label>
                  <input
                    type="text"
                    id="walletAddress"
                    name="walletAddress"
                    value={profileData.walletAddress}
                    onChange={handleChange}
                    disabled={true} // Wallet address is always read-only
                    className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaSave className="mr-2" /> Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Security */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Security</h2>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-md hover:border-primary-300 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaKey className="text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500 mt-1">Update your password regularly to keep your account secure.</p>
                    <button className="mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-md hover:border-primary-300 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaShieldAlt className="text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                    <button 
                      onClick={() => setShowMfaSetup(!showMfaSetup)}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {isMfaEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
              
              {showMfaSetup && (
                <div className="mt-4">
                  <MfaSetup />
                </div>
              )}
              
              <div className="p-4 border border-gray-200 rounded-md hover:border-primary-300 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaUser className="text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Account Verification</h3>
                    <p className="text-sm text-gray-500 mt-1">Verify your identity to unlock additional features.</p>
                    <button className="mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium">
                      Verify Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
