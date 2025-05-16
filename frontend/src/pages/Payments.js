import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPayments, createPayment, getExchangeRates, reset } from '../features/payments/paymentSlice';
import { toast } from 'react-toastify';
import { FaExchangeAlt, FaPlus, FaArrowRight, FaHistory, FaInfoCircle, FaSpinner } from 'react-icons/fa';

function Payments() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { payments, exchangeRates, isLoading, isSuccess, isError, message } = useSelector((state) => state.payments);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentType, setPaymentType] = useState('fiat_to_crypto');
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    currency: 'USD',
    payment_type: 'fiat_to_crypto',
    crypto_currency: 'BTC',
    crypto_address: '',
  });

  const [calculatedAmount, setCalculatedAmount] = useState(null);

  useEffect(() => {
    dispatch(getPayments());
    dispatch(getExchangeRates());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && message) {
      toast.success(message);
    }
  }, [isError, isSuccess, message]);

  // Calculate the exchange amount when form values change
  useEffect(() => {
    if (exchangeRates && paymentForm.amount && paymentForm.crypto_currency) {
      const rate = exchangeRates.rates[paymentForm.crypto_currency];
      if (rate) {
        if (paymentForm.payment_type === 'fiat_to_crypto') {
          setCalculatedAmount(paymentForm.amount / rate);
        } else {
          setCalculatedAmount(paymentForm.amount * rate);
        }
      }
    }
  }, [exchangeRates, paymentForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm({
      ...paymentForm,
      [name]: value,
    });
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    setPaymentForm({
      ...paymentForm,
      payment_type: type,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (paymentForm.payment_type === 'fiat_to_crypto' && !paymentForm.crypto_address) {
      toast.error('Please enter a crypto address');
      return;
    }

    // Create payment
    dispatch(createPayment({
      ...paymentForm,
      amount: parseFloat(paymentForm.amount),
    }));

    // Close modal and reset form on success
    setShowCreateModal(false);
    setPaymentForm({
      amount: '',
      currency: 'USD',
      payment_type: paymentType,
      crypto_currency: 'BTC',
      crypto_address: '',
    });
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  // Format currency amount
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format crypto amount
  const formatCrypto = (amount, currency) => {
    return `${amount.toFixed(8)} ${currency}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-600 mt-1">Convert between fiat and cryptocurrency</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" /> New Payment
          </button>
        </div>
      </div>

      {/* Payment Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaExchangeAlt size={24} />
            </div>
            <h2 className="text-xl font-semibold">Fiat to Crypto</h2>
          </div>
          <p className="text-gray-600 mb-4">Convert your fiat currency to cryptocurrency and send it to your wallet.</p>
          <button
            onClick={() => {
              handlePaymentTypeChange('fiat_to_crypto');
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
          >
            Convert to Crypto <FaArrowRight className="ml-2" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaExchangeAlt size={24} />
            </div>
            <h2 className="text-xl font-semibold">Crypto to Fiat</h2>
          </div>
          <p className="text-gray-600 mb-4">Convert your cryptocurrency to fiat currency and withdraw to your bank account.</p>
          <button
            onClick={() => {
              handlePaymentTypeChange('crypto_to_fiat');
              setShowCreateModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
          >
            Convert to Fiat <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaHistory className="text-gray-500 mr-2" size={20} />
          <h2 className="text-xl font-semibold">Recent Payments</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.slice().reverse().map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-full mr-2 ${payment.payment_type === 'fiat_to_crypto' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                          <FaExchangeAlt size={12} />
                        </div>
                        <div className="text-sm text-gray-900">
                          {payment.payment_type === 'fiat_to_crypto' ? 'Fiat to Crypto' : 'Crypto to Fiat'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      {payment.crypto_amount && (
                        <div className="text-xs text-gray-500">
                          {formatCrypto(payment.crypto_amount, payment.crypto_currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewPaymentDetails(payment)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No payments found. Create your first payment to get started.</p>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="relative bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {paymentType === 'fiat_to_crypto' ? 'Convert Fiat to Crypto' : 'Convert Crypto to Fiat'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <div className="flex space-x-4">
                    <div 
                      className={`flex-1 p-3 border rounded-md cursor-pointer flex items-center justify-center ${paymentForm.payment_type === 'fiat_to_crypto' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                      onClick={() => handlePaymentTypeChange('fiat_to_crypto')}
                    >
                      <span className="text-sm font-medium">Fiat to Crypto</span>
                    </div>
                    <div 
                      className={`flex-1 p-3 border rounded-md cursor-pointer flex items-center justify-center ${paymentForm.payment_type === 'crypto_to_fiat' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                      onClick={() => handlePaymentTypeChange('crypto_to_fiat')}
                    >
                      <span className="text-sm font-medium">Crypto to Fiat</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    {paymentForm.payment_type === 'fiat_to_crypto' ? 'Fiat Amount' : 'Crypto Amount'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      className="block w-full pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={paymentForm.amount}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {paymentForm.payment_type === 'fiat_to_crypto' ? paymentForm.currency : paymentForm.crypto_currency}
                      </span>
                    </div>
                  </div>
                </div>

                {paymentForm.payment_type === 'fiat_to_crypto' && (
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Fiat Currency</label>
                    <select
                      id="currency"
                      name="currency"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={paymentForm.currency}
                      onChange={handleInputChange}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="crypto_currency" className="block text-sm font-medium text-gray-700 mb-1">Cryptocurrency</label>
                  <select
                    id="crypto_currency"
                    name="crypto_currency"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={paymentForm.crypto_currency}
                    onChange={handleInputChange}
                  >
                    <option value="BTC">BTC - Bitcoin</option>
                    <option value="ETH">ETH - Ethereum</option>
                    <option value="USDC">USDC - USD Coin</option>
                  </select>
                </div>

                {paymentForm.payment_type === 'fiat_to_crypto' && (
                  <div>
                    <label htmlFor="crypto_address" className="block text-sm font-medium text-gray-700 mb-1">Destination Wallet Address</label>
                    <input
                      type="text"
                      name="crypto_address"
                      id="crypto_address"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter your wallet address"
                      value={paymentForm.crypto_address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                {/* Exchange Rate Information */}
                {exchangeRates && calculatedAmount !== null && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <FaInfoCircle className="text-primary-500 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Exchange Information</h4>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Exchange Rate:</span> 1 {paymentForm.crypto_currency} = {formatCurrency(exchangeRates.rates[paymentForm.crypto_currency], paymentForm.currency)}
                      </p>
                      <p>
                        <span className="font-medium">You will {paymentForm.payment_type === 'fiat_to_crypto' ? 'receive' : 'pay'}:</span> {paymentForm.payment_type === 'fiat_to_crypto' ? formatCrypto(calculatedAmount, paymentForm.crypto_currency) : formatCurrency(calculatedAmount, paymentForm.currency)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  type="button"
                  className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaExchangeAlt className="mr-2" />}
                  {paymentForm.payment_type === 'fiat_to_crypto' ? 'Convert to Crypto' : 'Convert to Fiat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="relative bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Payment Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment ID</h4>
                  <p className="text-sm text-gray-900 mt-1">{selectedPayment.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedPayment.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPayment.payment_type === 'fiat_to_crypto' ? 'Fiat to Crypto' : 'Crypto to Fiat'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="text-sm mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedPayment.status === 'completed' ? 'bg-green-100 text-green-800' : selectedPayment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedPayment.status}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fiat Amount</h4>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
                {selectedPayment.crypto_amount && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Crypto Amount</h4>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatCrypto(selectedPayment.crypto_amount, selectedPayment.crypto_currency)}
                    </p>
                  </div>
                )}
                {selectedPayment.exchange_rate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Exchange Rate</h4>
                    <p className="text-sm text-gray-900 mt-1">
                      1 {selectedPayment.crypto_currency} = {formatCurrency(selectedPayment.exchange_rate, selectedPayment.currency)}
                    </p>
                  </div>
                )}
                {selectedPayment.crypto_address && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Crypto Address</h4>
                    <p className="text-sm text-gray-900 mt-1 break-all">
                      {selectedPayment.crypto_address}
                    </p>
                  </div>
                )}
              </div>

              {selectedPayment.metadata && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedPayment.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
