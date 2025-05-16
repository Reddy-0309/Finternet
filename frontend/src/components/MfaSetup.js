import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setupMfa, verifyMfa, updateMfaPreferences, clearMfaSetup, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaQrcode, FaSpinner, FaCheck, FaShieldAlt } from 'react-icons/fa';

function MfaSetup() {
  const [code, setCode] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [preferredType, setPreferredType] = useState('app');
  const [step, setStep] = useState('initial'); // initial, setup, verify

  const dispatch = useDispatch();
  const { user, mfaSetup, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && step === 'verify') {
      toast.success('MFA setup successful');
      setStep('initial');
      dispatch(clearMfaSetup());
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, dispatch, step]);

  const handleSetup = () => {
    setStep('setup');
    dispatch(setupMfa());
  };

  const handleVerify = (e) => {
    e.preventDefault();
    
    if (!code) {
      toast.error('Please enter the verification code');
      return;
    }

    dispatch(verifyMfa(code));
    setStep('verify');
  };

  const handleUpdatePreferences = (enabled) => {
    dispatch(updateMfaPreferences({
      enabled,
      preferredType
    }));
    
    if (!enabled) {
      toast.success('MFA has been disabled');
    }
  };

  // Check if user has MFA enabled
  const isMfaEnabled = user?.user?.mfaEnabled;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
          <FaShieldAlt size={20} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Two-Factor Authentication</h2>
      </div>

      {step === 'initial' && (
        <div>
          <p className="text-gray-600 mb-4">
            Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to provide a verification code in addition to your password when signing in.
          </p>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${isMfaEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                {isMfaEnabled && <FaCheck className="text-white text-xs" />}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {isMfaEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is not enabled'}
                </p>
                {isMfaEnabled && (
                  <p className="text-sm text-gray-600 mt-1">
                    Method: Authenticator App
                  </p>
                )}
              </div>
            </div>
          </div>

          {isMfaEnabled ? (
            <button
              onClick={() => handleUpdatePreferences(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : 'Disable Two-Factor Authentication'}
            </button>
          ) : (
            <button
              onClick={handleSetup}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Enable Two-Factor Authentication'}
            </button>
          )}
        </div>
      )}

      {step === 'setup' && mfaSetup && (
        <div>
          <p className="text-gray-600 mb-4">
            Scan the QR code below with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator) and enter the verification code to enable two-factor authentication.
          </p>

          <div className="mb-6">
            <div className="flex justify-center mb-4">
              {showQrCode ? (
                <div className="p-4 bg-white border rounded-md">
                  <img 
                    src={`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(mfaSetup.qrCodeUrl)}`} 
                    alt="QR Code for authenticator app" 
                    className="w-48 h-48"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowQrCode(true)}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                >
                  <FaQrcode className="mr-2 text-gray-500" size={24} />
                  <span className="text-gray-700">Click to show QR code</span>
                </button>
              )}
            </div>

            {showQrCode && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Manual entry code:</p>
                <div className="bg-gray-100 p-2 rounded font-mono text-sm break-all select-all">
                  {mfaSetup.secret}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                id="code"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                required
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep('initial');
                  dispatch(clearMfaSetup());
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Enable'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MfaSetup;
