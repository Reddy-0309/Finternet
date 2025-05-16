// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FinTokenAsset.sol";

/**
 * @title FinTokenMarketplace
 * @dev Marketplace for trading FinToken assets
 */
contract FinTokenMarketplace is ReentrancyGuard, Ownable {
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
    
    // Events
    event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event ListingSold(uint256 indexed listingId, uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
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
    ) public nonReentrant returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        require(IERC721(tokenContract).ownerOf(tokenId) == msg.sender, "Not the owner");
        require(IERC721(tokenContract).isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");
        
        _listingIds++;
        uint256 listingId = _listingIds;
        
        _listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            tokenContract: tokenContract,
            price: price,
            active: true,
            createdAt: block.timestamp
        });
        
        emit ListingCreated(listingId, tokenId, msg.sender, price);
        
        return listingId;
    }
    
    /**
     * @dev Cancels a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) public nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender || owner() == msg.sender, "Not authorized");
        
        listing.active = false;
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Purchases a listed asset
     * @param listingId ID of the listing to purchase
     */
    function purchaseListing(uint256 listingId) public payable nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing not active");
        
        // In a real implementation, this would handle payment processing
        // For this example, we'll just simulate the purchase
        
        // Calculate platform fee
        uint256 platformFee = (listing.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        // Transfer token from seller to buyer
        IERC721(listing.tokenContract).transferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Mark listing as inactive
        listing.active = false;
        
        emit ListingSold(listingId, listing.tokenId, listing.seller, msg.sender, listing.price);
    }
    
    /**
     * @dev Gets listing information
     * @param listingId ID of the listing
     * @return Listing struct containing listing information
     */
    function getListing(uint256 listingId) public view returns (Listing memory) {
        return _listings[listingId];
    }
    
    /**
     * @dev Updates the platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }
}
