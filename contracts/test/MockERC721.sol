// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockERC721 {
    mapping(uint256 => address) private owners;

    function setOwner(uint256 tokenId, address tokenOwner) external {
        owners[tokenId] = tokenOwner;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }
}
