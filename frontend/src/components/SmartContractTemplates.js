import React, { useState } from 'react';
import { FaFileContract, FaCoins, FaExchangeAlt, FaShieldAlt, FaUsers, FaVoteYea, FaMoneyBillWave, FaClipboardCheck, FaInfoCircle } from 'react-icons/fa';

// Smart contract templates
const CONTRACT_TEMPLATES = [
  {
    id: 'erc20',
    name: 'ERC-20 Token',
    description: 'Standard fungible token for creating cryptocurrencies',
    icon: <FaCoins />,
    category: 'tokens',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FinToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
`,
    parameters: [
      { name: 'name', type: 'string', default: 'Finternet Token', description: 'Token name' },
      { name: 'symbol', type: 'string', default: 'FIN', description: 'Token symbol' },
      { name: 'initialSupply', type: 'uint256', default: '1000000', description: 'Initial token supply' }
    ]
  },
  {
    id: 'erc721',
    name: 'ERC-721 NFT',
    description: 'Non-fungible token for unique digital assets',
    icon: <FaFileContract />,
    category: 'tokens',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FinAsset is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mintAsset(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}
`,
    parameters: [
      { name: 'name', type: 'string', default: 'Finternet Asset', description: 'NFT collection name' },
      { name: 'symbol', type: 'string', default: 'FINASSET', description: 'NFT symbol' }
    ]
  },
  {
    id: 'marketplace',
    name: 'NFT Marketplace',
    description: 'Marketplace for buying and selling NFTs',
    icon: <FaExchangeAlt />,
    category: 'defi',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 tokenId;
        address seller;
        address tokenContract;
        uint256 price;
        bool active;
    }

    // Mapping from listing ID to Listing
    mapping(uint256 => Listing) private _listings;
    uint256 private _listingIds;
    uint256 public platformFeePercentage;

    event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event ListingSold(uint256 indexed listingId, uint256 indexed tokenId, address seller, address buyer, uint256 price);

    constructor(uint256 feePercentage) {
        platformFeePercentage = feePercentage;
    }

    function createListing(uint256 tokenId, address tokenContract, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        require(IERC721(tokenContract).ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(IERC721(tokenContract).getApproved(tokenId) == address(this), "Marketplace not approved");

        _listingIds++;
        uint256 listingId = _listingIds;

        _listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            tokenContract: tokenContract,
            price: price,
            active: true
        });

        emit ListingCreated(listingId, tokenId, msg.sender, price);
        return listingId;
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.active = false;

        // Calculate platform fee
        uint256 platformFee = (listing.price * platformFeePercentage) / 10000;
        uint256 sellerProceeds = listing.price - platformFee;

        // Transfer token to buyer
        IERC721(listing.tokenContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        // Transfer funds to seller and platform
        payable(listing.seller).transfer(sellerProceeds);
        payable(owner()).transfer(platformFee);

        emit ListingSold(listingId, listing.tokenId, listing.seller, msg.sender, listing.price);
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }
}
`,
    parameters: [
      { name: 'feePercentage', type: 'uint256', default: '250', description: 'Platform fee percentage (in basis points, e.g., 250 = 2.5%)' }
    ]
  },
  {
    id: 'multisig',
    name: 'Multi-Signature Wallet',
    description: 'Wallet requiring multiple signatures for transactions',
    icon: <FaShieldAlt />,
    category: 'security',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint amount);
    event Submit(uint indexed txId);
    event Approve(address indexed owner, uint indexed txId);
    event Revoke(address indexed owner, uint indexed txId);
    event Execute(uint indexed txId);

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public required;

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint _txId) {
        require(_txId < transactions.length, "tx does not exist");
        _;
    }

    modifier notApproved(uint _txId) {
        require(!approved[_txId][msg.sender], "tx already approved");
        _;
    }

    modifier notExecuted(uint _txId) {
        require(!transactions[_txId].executed, "tx already executed");
        _;
    }

    constructor(address[] memory _owners, uint _required) {
        require(_owners.length > 0, "owners required");
        require(_required > 0 && _required <= _owners.length, "invalid required number of owners");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submit(address _to, uint _value, bytes calldata _data) external onlyOwner {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false
        }));

        emit Submit(transactions.length - 1);
    }

    function approve(uint _txId) external onlyOwner txExists(_txId) notApproved(_txId) notExecuted(_txId) {
        approved[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function _getApprovalCount(uint _txId) private view returns (uint count) {
        for (uint i = 0; i < owners.length; i++) {
            if (approved[_txId][owners[i]]) {
                count += 1;
            }
        }
    }

    function execute(uint _txId) external txExists(_txId) notExecuted(_txId) {
        require(_getApprovalCount(_txId) >= required, "approvals < required");
        Transaction storage transaction = transactions[_txId];

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "tx failed");

        emit Execute(_txId);
    }

    function revoke(uint _txId) external onlyOwner txExists(_txId) notExecuted(_txId) {
        require(approved[_txId][msg.sender], "tx not approved");
        approved[_txId][msg.sender] = false;
        emit Revoke(msg.sender, _txId);
    }
}
`,
    parameters: [
      { name: 'owners', type: 'address[]', default: '[]', description: 'Array of owner addresses' },
      { name: 'required', type: 'uint256', default: '2', description: 'Number of required confirmations' }
    ]
  },
  {
    id: 'dao',
    name: 'Simple DAO',
    description: 'Decentralized Autonomous Organization for governance',
    icon: <FaUsers />,
    category: 'governance',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleDAO {
    struct Proposal {
        uint id;
        address proposer;
        string description;
        uint forVotes;
        uint againstVotes;
        uint startBlock;
        uint endBlock;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    IERC20 public governanceToken;
    uint public proposalCount;
    uint public votingPeriod;
    uint public quorumVotes;

    mapping(uint => Proposal) public proposals;

    event ProposalCreated(uint indexed id, address indexed proposer, string description, uint startBlock, uint endBlock);
    event VoteCast(address indexed voter, uint indexed proposalId, bool support, uint votes);
    event ProposalExecuted(uint indexed id);

    constructor(address _governanceToken, uint _votingPeriod, uint _quorumVotes) {
        governanceToken = IERC20(_governanceToken);
        votingPeriod = _votingPeriod;
        quorumVotes = _quorumVotes;
    }

    function propose(string memory description) external returns (uint) {
        require(governanceToken.balanceOf(msg.sender) > 0, "Must hold governance tokens");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + votingPeriod;

        emit ProposalCreated(proposalCount, msg.sender, description, proposal.startBlock, proposal.endBlock);
        return proposalCount;
    }

    function castVote(uint proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint votes = governanceToken.balanceOf(msg.sender);
        require(votes > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;

        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }

        emit VoteCast(msg.sender, proposalId, support, votes);
    }

    function executeProposal(uint proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.number > proposal.endBlock, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        require(proposal.forVotes >= quorumVotes, "Quorum not reached");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);

        // In a real DAO, this would execute the proposal's actions
    }
}
`,
    parameters: [
      { name: 'governanceToken', type: 'address', default: '', description: 'Address of the governance token contract' },
      { name: 'votingPeriod', type: 'uint256', default: '40320', description: 'Voting period in blocks (e.g., 40320 blocks ≈ 1 week)' },
      { name: 'quorumVotes', type: 'uint256', default: '1000000000000000000000', description: 'Minimum votes required for quorum (e.g., 1000 tokens with 18 decimals)' }
    ]
  }
];

function SmartContractTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [parameters, setParameters] = useState({});

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Initialize parameters with default values
    const initialParams = {};
    template.parameters.forEach(param => {
      initialParams[param.name] = param.default;
    });
    setParameters(initialParams);
  };

  const handleParameterChange = (paramName, value) => {
    setParameters({
      ...parameters,
      [paramName]: value
    });
  };

  const generateContract = () => {
    // In a real application, this would replace the parameters in the template
    // For now, we'll just return the template code
    return selectedTemplate.code;
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? CONTRACT_TEMPLATES 
    : CONTRACT_TEMPLATES.filter(template => template.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Templates', icon: <FaFileContract /> },
    { id: 'tokens', name: 'Tokens', icon: <FaCoins /> },
    { id: 'defi', name: 'DeFi', icon: <FaMoneyBillWave /> },
    { id: 'security', name: 'Security', icon: <FaShieldAlt /> },
    { id: 'governance', name: 'Governance', icon: <FaVoteYea /> }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Smart Contract Templates</h2>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-md ${selectedCategory === category.id 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="md:col-span-1 space-y-4 border-r border-gray-200 dark:border-gray-700 pr-4">
          {filteredTemplates.map(template => (
            <div 
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedTemplate?.id === template.id 
                ? 'bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700' 
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            >
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 mr-3">
                  {template.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{template.description}</p>
            </div>
          ))}
        </div>

        {/* Template Details and Parameters */}
        <div className="md:col-span-2">
          {selectedTemplate ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{selectedTemplate.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedTemplate.description}</p>
                
                <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-600 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Customize this template by adjusting the parameters below. The contract code will be generated based on your inputs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parameters */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Parameters</h4>
                <div className="space-y-4">
                  {selectedTemplate.parameters.map(param => (
                    <div key={param.name} className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {param.name}
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{param.description}</span>
                      </label>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={parameters[param.name] || ''}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={param.default}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button 
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => {
                    const code = generateContract();
                    // In a real app, this would copy to clipboard or redirect to deployment page
                    alert('Contract generated! In a real app, you would be redirected to the deployment page.');
                  }}
                >
                  Generate Contract
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <FaFileContract className="text-gray-400 dark:text-gray-500 text-6xl mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Select a Template</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Choose a smart contract template from the list to customize and deploy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SmartContractTemplates;
