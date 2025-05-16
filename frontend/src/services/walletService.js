import { ethers } from 'ethers';
import blockchainMonitorService from './blockchainMonitorService';

/**
 * Service for managing blockchain wallet connections and transactions
 */
class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.contracts = {};
    this.isConnected = false;
    this.connectionListeners = [];
  }

  /**
   * Check if MetaMask is installed
   * @returns {boolean} True if MetaMask is installed
   */
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask wallet
   * @returns {Promise<Object>} Connection result with address and chainId
   */
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Get the connected chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Initialize ethers provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.address = address;
      this.chainId = parseInt(chainId, 16);
      this.isConnected = true;

      // Set up event listeners for account and chain changes
      this._setupEventListeners();

      // Notify connection listeners
      this._notifyConnectionListeners();

      return {
        address,
        chainId: this.chainId,
        success: true
      };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the wallet
   */
  disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.isConnected = false;
    this.contracts = {};

    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this._handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', this._handleChainChanged);
    }

    // Notify connection listeners
    this._notifyConnectionListeners();
  }

  /**
   * Set up event listeners for MetaMask events
   * @private
   */
  _setupEventListeners() {
    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', this._handleAccountsChanged.bind(this));
      
      // Handle chain changes
      window.ethereum.on('chainChanged', this._handleChainChanged.bind(this));
    }
  }

  /**
   * Handle account changes in MetaMask
   * @param {Array} accounts - Array of accounts
   * @private
   */
  _handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // User disconnected their wallet
      this.disconnectWallet();
    } else if (this.address !== accounts[0]) {
      // Account changed
      this.address = accounts[0];
      this._notifyConnectionListeners();
    }
  }

  /**
   * Handle chain changes in MetaMask
   * @param {string} chainId - New chain ID in hex
   * @private
   */
  _handleChainChanged(chainId) {
    // Parse the chain ID from hex to decimal
    const newChainId = parseInt(chainId, 16);
    
    if (this.chainId !== newChainId) {
      this.chainId = newChainId;
      
      // Refresh provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Reinitialize contracts with new signer
      this._reinitializeContracts();
      
      // Notify connection listeners
      this._notifyConnectionListeners();
    }
  }

  /**
   * Reinitialize contracts with new signer
   * @private
   */
  _reinitializeContracts() {
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
  }

  /**
   * Add a connection listener
   * @param {Function} listener - Listener function
   */
  addConnectionListener(listener) {
    if (typeof listener === 'function' && !this.connectionListeners.includes(listener)) {
      this.connectionListeners.push(listener);
    }
  }

  /**
   * Remove a connection listener
   * @param {Function} listener - Listener function to remove
   */
  removeConnectionListener(listener) {
    const index = this.connectionListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  /**
   * Notify all connection listeners
   * @private
   */
  _notifyConnectionListeners() {
    const connectionState = {
      isConnected: this.isConnected,
      address: this.address,
      chainId: this.chainId
    };

    this.connectionListeners.forEach(listener => {
      try {
        listener(connectionState);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  /**
   * Initialize a contract
   * @param {string} name - Contract name
   * @param {string} address - Contract address
   * @param {Array} abi - Contract ABI
   * @returns {Object} Contract instance
   */
  initializeContract(name, address, abi) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = new ethers.Contract(address, abi, this.signer);
      this.contracts[name] = contract;
      return contract;
    } catch (error) {
      console.error(`Error initializing contract ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get a contract instance
   * @param {string} name - Contract name
   * @returns {Object} Contract instance
   */
  getContract(name) {
    return this.contracts[name];
  }

  /**
   * Get the wallet balance
   * @returns {Promise<string>} Balance in ETH
   */
  async getBalance() {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.provider.getBalance(this.address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Send a transaction
   * @param {Object} transaction - Transaction object
   * @param {string} transaction.to - Recipient address
   * @param {string} transaction.value - Value to send in ETH
   * @param {string} transaction.data - Transaction data (optional)
   * @returns {Promise<Object>} Transaction result
   */
  async sendTransaction({ to, value, data = '0x' }) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert ETH value to wei
      const valueInWei = ethers.utils.parseEther(value.toString());
      
      // Create transaction object
      const tx = {
        to,
        value: valueInWei,
        data
      };

      // Send transaction
      const txResponse = await this.signer.sendTransaction(tx);
      
      // Monitor transaction
      blockchainMonitorService.monitorTransaction(txResponse.hash, (status) => {
        console.log('Transaction status update:', status);
      });

      return {
        hash: txResponse.hash,
        status: 'pending',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Call a contract method (read-only)
   * @param {string} contractName - Contract name
   * @param {string} method - Method name
   * @param {Array} params - Method parameters
   * @returns {Promise<any>} Method result
   */
  async callContractMethod(contractName, method, params = []) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    const contract = this.contracts[contractName];
    if (!contract) {
      throw new Error(`Contract ${contractName} not initialized`);
    }

    try {
      return await contract[method](...params);
    } catch (error) {
      console.error(`Error calling contract method ${method}:`, error);
      throw error;
    }
  }

  /**
   * Execute a contract method (write)
   * @param {string} contractName - Contract name
   * @param {string} method - Method name
   * @param {Array} params - Method parameters
   * @param {Object} options - Transaction options (optional)
   * @returns {Promise<Object>} Transaction result
   */
  async executeContractMethod(contractName, method, params = [], options = {}) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    const contract = this.contracts[contractName];
    if (!contract) {
      throw new Error(`Contract ${contractName} not initialized`);
    }

    try {
      // Execute the contract method
      const txResponse = await contract[method](...params, options);
      
      // Monitor transaction
      blockchainMonitorService.monitorTransaction(txResponse.hash, (status) => {
        console.log('Contract transaction status update:', status);
      });

      return {
        hash: txResponse.hash,
        status: 'pending',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error executing contract method ${method}:`, error);
      throw error;
    }
  }

  /**
   * Switch to a specific network
   * @param {Object} networkParams - Network parameters
   * @returns {Promise<boolean>} Success status
   */
  async switchNetwork(networkParams) {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkParams.chainId.toString(16)}` }]
      });
      return true;
    } catch (error) {
      // If the network is not added to MetaMask, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${networkParams.chainId.toString(16)}`,
              chainName: networkParams.name,
              nativeCurrency: networkParams.nativeCurrency,
              rpcUrls: [networkParams.rpcUrl],
              blockExplorerUrls: networkParams.blockExplorerUrl ? [networkParams.blockExplorerUrl] : null
            }]
          });
          return true;
        } catch (addError) {
          console.error('Error adding network to MetaMask:', addError);
          throw addError;
        }
      } else {
        console.error('Error switching network:', error);
        throw error;
      }
    }
  }

  /**
   * Sign a message
   * @param {string} message - Message to sign
   * @returns {Promise<string>} Signature
   */
  async signMessage(message) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      return await this.signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  /**
   * Verify a signature
   * @param {string} message - Original message
   * @param {string} signature - Message signature
   * @param {string} address - Signer address
   * @returns {boolean} Verification result
   */
  verifySignature(message, signature, address) {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}

// Create a singleton instance
const walletService = new WalletService();

export default walletService;
