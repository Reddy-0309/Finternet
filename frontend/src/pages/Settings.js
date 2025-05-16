import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaBell, FaGlobe, FaShieldAlt, FaWallet, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Settings() {
  const { user } = useSelector((state) => state.auth);
  
  // Default settings
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      transactionAlerts: true,
      marketingEmails: false,
      securityAlerts: true
    },
    privacy: {
      showProfilePublicly: false,
      showAssetsPublicly: false,
      allowDataCollection: true
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      autoLogout: 30 // minutes
    },
    preferences: {
      currency: 'USD',
      language: 'English',
      theme: 'light'
    }
  });

  const handleToggle = (category, setting) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: !settings[category][setting]
      }
    });
    toast.success(`Setting updated successfully!`);
  };

  const handleSelectChange = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
    toast.success(`Setting updated successfully!`);
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${enabled ? 'bg-primary-600' : 'bg-gray-300'}`}
    >
      <span className="sr-only">Toggle setting</span>
      <span 
        className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
      />
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
            <div className="flex items-center">
              <FaBell className="text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Alerts</h3>
                <p className="text-xs text-gray-500">Receive important updates via email</p>
              </div>
              <ToggleSwitch 
                enabled={settings.notifications.emailAlerts} 
                onChange={() => handleToggle('notifications', 'emailAlerts')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                <p className="text-xs text-gray-500">Receive notifications in your browser</p>
              </div>
              <ToggleSwitch 
                enabled={settings.notifications.pushNotifications} 
                onChange={() => handleToggle('notifications', 'pushNotifications')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Transaction Alerts</h3>
                <p className="text-xs text-gray-500">Get notified about your transactions</p>
              </div>
              <ToggleSwitch 
                enabled={settings.notifications.transactionAlerts} 
                onChange={() => handleToggle('notifications', 'transactionAlerts')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                <p className="text-xs text-gray-500">Receive promotional content</p>
              </div>
              <ToggleSwitch 
                enabled={settings.notifications.marketingEmails} 
                onChange={() => handleToggle('notifications', 'marketingEmails')} 
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
            <div className="flex items-center">
              <FaShieldAlt className="text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Privacy</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Public Profile</h3>
                <p className="text-xs text-gray-500">Allow others to see your profile</p>
              </div>
              <ToggleSwitch 
                enabled={settings.privacy.showProfilePublicly} 
                onChange={() => handleToggle('privacy', 'showProfilePublicly')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Public Assets</h3>
                <p className="text-xs text-gray-500">Make your assets visible to others</p>
              </div>
              <ToggleSwitch 
                enabled={settings.privacy.showAssetsPublicly} 
                onChange={() => handleToggle('privacy', 'showAssetsPublicly')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Data Collection</h3>
                <p className="text-xs text-gray-500">Allow us to collect usage data</p>
              </div>
              <ToggleSwitch 
                enabled={settings.privacy.allowDataCollection} 
                onChange={() => handleToggle('privacy', 'allowDataCollection')} 
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
            <div className="flex items-center">
              <FaGlobe className="text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Preferences</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                id="currency"
                value={settings.preferences.currency}
                onChange={(e) => handleSelectChange('preferences', 'currency', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="BTC">BTC (₿)</option>
                <option value="ETH">ETH (Ξ)</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
              <select
                id="language"
                value={settings.preferences.language}
                onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
              <select
                id="theme"
                value={settings.preferences.theme}
                onChange={(e) => handleSelectChange('preferences', 'theme', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden md:col-span-2">
          <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
            <div className="flex items-center">
              <FaShieldAlt className="text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Security</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <ToggleSwitch 
                enabled={settings.security.twoFactorAuth} 
                onChange={() => handleToggle('security', 'twoFactorAuth')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Login Notifications</h3>
                <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
              </div>
              <ToggleSwitch 
                enabled={settings.security.loginNotifications} 
                onChange={() => handleToggle('security', 'loginNotifications')} 
              />
            </div>
            <div>
              <label htmlFor="autoLogout" className="block text-sm font-medium text-gray-700">Auto Logout (minutes)</label>
              <select
                id="autoLogout"
                value={settings.security.autoLogout}
                onChange={(e) => handleSelectChange('security', 'autoLogout', parseInt(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wallet Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
            <div className="flex items-center">
              <FaWallet className="text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Wallet</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Connected Wallet</h3>
              <p className="text-xs text-gray-500 mt-1">Your blockchain wallet address</p>
              <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs font-mono break-all">{user?.walletAddress || '0x' + Math.random().toString(16).substring(2, 42)}</p>
              </div>
            </div>
            <div className="pt-2">
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Connect New Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
