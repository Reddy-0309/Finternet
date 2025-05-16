import React, { useState, useEffect } from 'react';
import { FaEthereum, FaLink, FaExclamationTriangle } from 'react-icons/fa';
import { getCurrentWalletAddress, addFinTernetNetworkToMetaMask } from '../utils/blockchain';
import { toast } from 'react-toastify';

const BlockchainConnect = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      const address = await getCurrentWalletAddress();
      setWalletAddress(address);
    };
    
    checkWalletConnection();
    
    // Set up event listeners for MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0] || null);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setNetworkError(false);
      
      const address = await addFinTernetNetworkToMetaMask();
      setWalletAddress(address);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setNetworkError(true);
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="flex items-center">
      {walletAddress ? (
        <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
          <FaEthereum className="mr-2" />
          <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${networkError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'} hover:bg-opacity-80 transition-colors`}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              {networkError ? <FaExclamationTriangle className="mr-2" /> : <FaLink className="mr-2" />}
              {networkError ? 'Retry Connect' : 'Connect Wallet'}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default BlockchainConnect;
