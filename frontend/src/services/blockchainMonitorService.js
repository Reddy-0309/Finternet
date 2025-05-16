import { ethers } from 'ethers';

/**
 * Service for monitoring blockchain transactions and events
 */
class BlockchainMonitorService {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.listeners = {};
    this.pendingTransactions = new Map();
    this.transactionCallbacks = new Map();
  }

  /**
   * Initialize the blockchain monitor service
   * @param {Object} config - Configuration object
   * @param {string} config.rpcUrl - RPC URL for the blockchain provider
   * @param {Array} config.contracts - Array of contract objects with address and ABI
   */
  async initialize(config) {
    try {
      // Initialize provider
      this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      
      // Initialize contracts
      if (config.contracts && Array.isArray(config.contracts)) {
        for (const contractConfig of config.contracts) {
          if (contractConfig.address && contractConfig.abi && contractConfig.name) {
            this.contracts[contractConfig.name] = new ethers.Contract(
              contractConfig.address,
              contractConfig.abi,
              this.provider
            );
          }
        }
      }
      
      // Start monitoring for new blocks
      this.startBlockMonitoring();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain monitor service:', error);
      return false;
    }
  }

  /**
   * Start monitoring for new blocks
   */
  startBlockMonitoring() {
    this.provider.on('block', (blockNumber) => {
      this.checkPendingTransactions(blockNumber);
      
      // Notify any block listeners
      if (this.listeners['block']) {
        this.listeners['block'].forEach(callback => {
          try {
            callback(blockNumber);
          } catch (error) {
            console.error('Error in block listener callback:', error);
          }
        });
      }
    });
  }

  /**
   * Check the status of pending transactions when a new block is mined
   * @param {number} blockNumber - The latest block number
   */
  async checkPendingTransactions(blockNumber) {
    for (const [txHash, txData] of this.pendingTransactions.entries()) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          // Transaction has been mined
          const status = receipt.status ? 'confirmed' : 'failed';
          const callbacks = this.transactionCallbacks.get(txHash) || [];
          
          // Execute all callbacks for this transaction
          callbacks.forEach(callback => {
            try {
              callback({
                hash: txHash,
                status,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                receipt
              });
            } catch (error) {
              console.error('Error in transaction callback:', error);
            }
          });
          
          // Remove from pending transactions and callbacks
          this.pendingTransactions.delete(txHash);
          this.transactionCallbacks.delete(txHash);
        } else if (blockNumber - txData.submittedAt > 50) {
          // If transaction hasn't been mined after 50 blocks, consider it dropped
          const callbacks = this.transactionCallbacks.get(txHash) || [];
          callbacks.forEach(callback => {
            try {
              callback({
                hash: txHash,
                status: 'dropped',
                error: 'Transaction dropped from mempool'
              });
            } catch (error) {
              console.error('Error in transaction callback:', error);
            }
          });
          
          // Remove from pending transactions and callbacks
          this.pendingTransactions.delete(txHash);
          this.transactionCallbacks.delete(txHash);
        }
      } catch (error) {
        console.error(`Error checking transaction ${txHash}:`, error);
      }
    }
  }

  /**
   * Monitor a transaction and get updates on its status
   * @param {string} txHash - Transaction hash to monitor
   * @param {Function} callback - Callback function to receive updates
   */
  monitorTransaction(txHash, callback) {
    if (!txHash) return false;
    
    // Add to pending transactions if not already there
    if (!this.pendingTransactions.has(txHash)) {
      this.pendingTransactions.set(txHash, {
        submittedAt: this.provider ? this.provider.blockNumber : 0,
        timestamp: Date.now()
      });
    }
    
    // Add callback to transaction callbacks
    if (!this.transactionCallbacks.has(txHash)) {
      this.transactionCallbacks.set(txHash, []);
    }
    
    this.transactionCallbacks.get(txHash).push(callback);
    return true;
  }

  /**
   * Subscribe to contract events
   * @param {string} contractName - Name of the contract to listen to
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} callback - Callback function to receive event data
   */
  subscribeToEvent(contractName, eventName, callback) {
    const contract = this.contracts[contractName];
    if (!contract) {
      console.error(`Contract ${contractName} not found`);
      return false;
    }
    
    try {
      // Create a unique ID for this listener
      const listenerId = `${contractName}:${eventName}:${Date.now()}`;
      
      // Set up the event listener
      const listener = (...args) => {
        try {
          callback({
            contractName,
            eventName,
            args,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      };
      
      // Store the listener for later removal
      if (!this.listeners[`${contractName}:${eventName}`]) {
        this.listeners[`${contractName}:${eventName}`] = new Map();
      }
      this.listeners[`${contractName}:${eventName}`].set(listenerId, listener);
      
      // Register the listener with the contract
      contract.on(eventName, listener);
      
      return listenerId;
    } catch (error) {
      console.error(`Error subscribing to event ${eventName} on contract ${contractName}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe from a contract event
   * @param {string} contractName - Name of the contract
   * @param {string} eventName - Name of the event
   * @param {string} listenerId - ID of the listener to remove
   */
  unsubscribeFromEvent(contractName, eventName, listenerId) {
    const listenerKey = `${contractName}:${eventName}`;
    const listeners = this.listeners[listenerKey];
    
    if (!listeners || !listeners.has(listenerId)) {
      return false;
    }
    
    const contract = this.contracts[contractName];
    if (!contract) {
      return false;
    }
    
    try {
      // Remove the listener from the contract
      const listener = listeners.get(listenerId);
      contract.off(eventName, listener);
      
      // Remove from our internal tracking
      listeners.delete(listenerId);
      
      return true;
    } catch (error) {
      console.error(`Error unsubscribing from event ${eventName} on contract ${contractName}:`, error);
      return false;
    }
  }

  /**
   * Subscribe to new blocks
   * @param {Function} callback - Callback function to receive block number
   * @returns {string} Listener ID for unsubscribing
   */
  subscribeToBlocks(callback) {
    const listenerId = `block:${Date.now()}`;
    
    if (!this.listeners['block']) {
      this.listeners['block'] = new Map();
    }
    
    this.listeners['block'].set(listenerId, callback);
    return listenerId;
  }

  /**
   * Unsubscribe from block updates
   * @param {string} listenerId - ID of the listener to remove
   */
  unsubscribeFromBlocks(listenerId) {
    if (!this.listeners['block'] || !this.listeners['block'].has(listenerId)) {
      return false;
    }
    
    this.listeners['block'].delete(listenerId);
    return true;
  }

  /**
   * Get the current gas price
   * @returns {Promise<string>} Current gas price in wei
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  }

  /**
   * Clean up all listeners and subscriptions
   */
  cleanup() {
    // Remove all contract event listeners
    for (const contractName in this.contracts) {
      const contract = this.contracts[contractName];
      contract.removeAllListeners();
    }
    
    // Remove block listener
    if (this.provider) {
      this.provider.removeAllListeners('block');
    }
    
    // Clear internal state
    this.listeners = {};
    this.pendingTransactions.clear();
    this.transactionCallbacks.clear();
  }
}

// Create a singleton instance
const blockchainMonitorService = new BlockchainMonitorService();

export default blockchainMonitorService;
