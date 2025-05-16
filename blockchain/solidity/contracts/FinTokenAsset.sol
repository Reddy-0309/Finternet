// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title FinTokenAsset
 * @dev ERC721 token for representing tokenized assets in the Finternet platform
 */
contract FinTokenAsset is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Asset type enum
    enum AssetType { RealEstate, Equity, Commodity, Art, Collectible, Other }
    
    // Asset struct to store additional information
    struct Asset {
        uint256 tokenId;
        string name;
        AssetType assetType;
        string description;
        uint256 value; // Value in USD cents
        address owner;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Mapping from token ID to Asset
    mapping(uint256 => Asset) private _assets;
    
    // Events
    event AssetCreated(uint256 indexed tokenId, string name, AssetType assetType, uint256 value, address owner);
    event AssetTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event AssetValueUpdated(uint256 indexed tokenId, uint256 oldValue, uint256 newValue);
    
    // Constructor
    constructor() ERC721("FinToken Asset", "FINT") {}
    
    /**
     * @dev Creates a new tokenized asset
     * @param to The address that will own the asset
     * @param name Name of the asset
     * @param assetType Type of the asset
     * @param description Description of the asset
     * @param value Value of the asset in USD cents
     * @param tokenURI URI for the asset metadata
     * @return tokenId The ID of the newly created token
     */
    function mintAsset(
        address to,
        string memory name,
        AssetType assetType,
        string memory description,
        uint256 value,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Create asset data
        Asset memory newAsset = Asset({
            tokenId: newTokenId,
            name: name,
            assetType: assetType,
            description: description,
            value: value,
            owner: to,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        // Store asset data
        _assets[newTokenId] = newAsset;
        
        // Emit event
        emit AssetCreated(newTokenId, name, assetType, value, to);
        
        return newTokenId;
    }
    
    /**
     * @dev Updates the value of an asset
     * @param tokenId ID of the token to update
     * @param newValue New value in USD cents
     */
    function updateAssetValue(uint256 tokenId, uint256 newValue) public onlyOwner {
        require(_exists(tokenId), "Asset does not exist");
        
        uint256 oldValue = _assets[tokenId].value;
        _assets[tokenId].value = newValue;
        _assets[tokenId].updatedAt = block.timestamp;
        
        emit AssetValueUpdated(tokenId, oldValue, newValue);
    }
    
    /**
     * @dev Gets asset information
     * @param tokenId ID of the token
     * @return Asset struct containing asset information
     */
    function getAsset(uint256 tokenId) public view returns (Asset memory) {
        require(_exists(tokenId), "Asset does not exist");
        return _assets[tokenId];
    }
    
    /**
     * @dev Override transfer function to update asset owner and emit event
     */
    function _transfer(address from, address to, uint256 tokenId) internal override {
        super._transfer(from, to, tokenId);
        
        // Update asset owner and timestamp
        _assets[tokenId].owner = to;
        _assets[tokenId].updatedAt = block.timestamp;
        
        emit AssetTransferred(tokenId, from, to);
    }
    
    /**
     * @dev Burns an asset token
     * @param tokenId ID of the token to burn
     */
    function burnAsset(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Asset does not exist");
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");
        
        _burn(tokenId);
        delete _assets[tokenId];
    }
}
