
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title FinTokenMarketplace
 * @dev Marketplace for trading FinToken assets with enhanced security features
 * @author Finternet Team
 */
contract FinTokenMarketplace is ReentrancyGuard, Ownable, Pausable, IERC721Receiver {
    using Address for address;
    
    // Listing struct
    struct Listing {
        uint256 tokenId;
        address seller;
        address tokenContract;
        uint256 price; // Price in USD cents
        bool active;
        uint256 createdAt;
    }
    
    // Mapping from listing ID to Listing
    mapping(uint256 => Listing) private _listings;
    uint256 private _listingIds;
    
    // Platform fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercentage = 250;
    
    // Address where platform fees are sent
    address public feeRecipient;
    
    // Maximum platform fee (10%)
    uint256 public constant MAX_PLATFORM_FEE = 1000;
    
    // Events
    event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, address tokenContract, uint256 price);
    event ListingCancelled(uint256 indexed listingId, uint256 tokenId, address seller);
    event ListingSold(uint256 indexed listingId, uint256 indexed tokenId, address seller, address indexed buyer, uint256 price, uint256 platformFee);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event MarketplacePaused(address admin);
    event MarketplaceUnpaused(address admin);
    
    /**
     * @dev Constructor to set initial fee recipient
     * @param _feeRecipient Address where marketplace fees will be sent
     */
    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Required function to receive ERC721 tokens
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    /**
     * @dev Creates a new listing for an asset
     * @param tokenId ID of the token to list
     * @param tokenContract Address of the ERC721 contract
     * @param price Price in USD cents
     * @return listingId ID of the newly created listing
     */
    function createListing(
        uint256 tokenId,
        address tokenContract,
        uint256 price
    ) public nonReentrant whenNotPaused returns (uint256) {
        require(price > 0, "FinMarket: Price must be greater than zero");
        require(tokenContract != address(0), "FinMarket: Invalid token contract");
        require(tokenContract.isContract(), "FinMarket: Not a contract address");
        
        // Verify token ownership
        IERC721 nftContract = IERC721(tokenContract);
        require(nftContract.ownerOf(tokenId) == msg.sender, "FinMarket: Not the token owner");
        
        // Check if marketplace is approved to transfer the token
        require(
            nftContract.isApprovedForAll(msg.sender, address(this)) || 
            nftContract.getApproved(tokenId) == address(this), 
            "FinMarket: Marketplace not approved"
        );
        
        // Create new listing ID
        _listingIds++;
        uint256 listingId = _listingIds;
        
        // Store listing details
        _listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            tokenContract: tokenContract,
            price: price,
            active: true,
            createdAt: block.timestamp
        });
        
        emit ListingCreated(listingId, tokenId, msg.sender, tokenContract, price);
        
        return listingId;
    }
    
    /**
     * @dev Cancels a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) public nonReentrant whenNotPaused {
        require(listingId > 0 && listingId <= _listingIds, "FinMarket: Invalid listing ID");
        
        Listing storage listing = _listings[listingId];
        require(listing.active, "FinMarket: Listing not active");
        require(listing.seller == msg.sender || owner() == msg.sender, "FinMarket: Not authorized");
        
        // Deactivate the listing
        listing.active = false;
        
        emit ListingCancelled(listingId, listing.tokenId, listing.seller);
    }
    
    /**
     * @dev Purchases a listed asset
     * @param listingId ID of the listing to purchase
     */
    function purchaseListing(uint256 listingId) public payable nonReentrant whenNotPaused {
        require(listingId > 0 && listingId <= _listingIds, "FinMarket: Invalid listing ID");
        
        Listing storage listing = _listings[listingId];
        require(listing.active, "FinMarket: Listing not active");
        require(listing.seller != msg.sender, "FinMarket: Cannot buy your own listing");
        require(feeRecipient != address(0), "FinMarket: Fee recipient not set");
        
        // In a production environment, this would validate payment amount
        // For this implementation, we'll assume payment is handled externally or in a wrapper contract
        
        // Calculate platform fee
        uint256 platformFee = (listing.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        // Mark listing as inactive before external calls (prevent reentrancy)
        listing.active = false;
        
        // Transfer token from seller to buyer
        IERC721 nftContract = IERC721(listing.tokenContract);
        
        try nftContract.transferFrom(listing.seller, msg.sender, listing.tokenId) {
            // Transfer successful
        } catch {
            // If transfer fails, revert the transaction
            revert("FinMarket: Token transfer failed");
        }
        
        // In a real implementation, this would handle actual payment transfers
        // to the seller and fee recipient
        
        emit ListingSold(
            listingId, 
            listing.tokenId, 
            listing.seller, 
            msg.sender, 
            listing.price, 
            platformFee
        );
    }
    
    /**
     * @dev Gets listing information
     * @param listingId ID of the listing
     * @return Listing struct containing listing information
     */
    function getListing(uint256 listingId) public view returns (Listing memory) {
        require(listingId > 0 && listingId <= _listingIds, "FinMarket: Invalid listing ID");
        return _listings[listingId];
    }
    
    /**
     * @dev Gets all active listings
     * @return Array of active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (_listings[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (_listings[i].active) {
                activeListings[index] = _listings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Gets listings by seller
     * @param seller Address of the seller
     * @return Array of listings by the seller
     */
    function getListingsBySeller(address seller) external view returns (Listing[] memory) {
        require(seller != address(0), "FinMarket: Invalid seller address");
        
        uint256 count = 0;
        
        // Count listings by seller
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (_listings[i].seller == seller) {
                count++;
            }
        }
        
        // Create array of seller's listings
        Listing[] memory sellerListings = new Listing[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _listingIds; i++) {
            if (_listings[i].seller == seller) {
                sellerListings[index] = _listings[i];
                index++;
            }
        }
        
        return sellerListings;
    }
    
    /**
     * @dev Updates the platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= MAX_PLATFORM_FEE, "FinMarket: Fee too high"); // Max 10%
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }
    
    /**
     * @dev Updates the fee recipient address
     * @param newFeeRecipient New address to receive platform fees
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "FinMarket: Invalid fee recipient");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newFeeRecipient);
    }
    
    /**
     * @dev Pauses the marketplace
     */
    function pauseMarketplace() external onlyOwner whenNotPaused {
        _pause();
        emit MarketplacePaused(msg.sender);
    }
    
    /**
     * @dev Unpauses the marketplace
     */
    function unpauseMarketplace() external onlyOwner whenPaused {
        _unpause();
        emit MarketplaceUnpaused(msg.sender);
    }
    
    /**
     * @dev Emergency function to recover any ERC721 tokens accidentally sent to the contract
     * @param tokenContract Address of the ERC721 contract
     * @param tokenId ID of the token to recover
     * @param recipient Address to send the recovered token to
     */
    function recoverERC721(address tokenContract, uint256 tokenId, address recipient) external onlyOwner {
        require(recipient != address(0), "FinMarket: Invalid recipient");
        
        IERC721(tokenContract).transferFrom(address(this), recipient, tokenId);
    }
}
