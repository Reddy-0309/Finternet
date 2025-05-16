import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { verifyMfa, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaLock, FaSpinner } from 'react-icons/fa';

function MfaVerification() {
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success('MFA verification successful');
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!code) {
      toast.error('Please enter the verification code');
      return;
    }

    dispatch(verifyMfa(code));
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
          <FaLock size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Two-Factor Authentication</h2>
        <p className="text-gray-600 mt-1">Enter the verification code from your authenticator app</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
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
            autoComplete="one-time-code"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Didn't receive a code? Check your authenticator app or contact support.</p>
      </div>
    </div>
  );
}

export default MfaVerification;
