// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @title GardenSeed
/// @notice A single onchain specimen used to demonstrate NFT Garden's Proof of Care flow.
contract GardenSeed is ERC721 {
    uint256 public constant SEED_ID = 1;

    constructor() ERC721("Monad Garden Seed", "SEED") {
        _safeMint(msg.sender, SEED_ID);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory image = string.concat(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(_seedImage()))
        );
        string memory metadata = string.concat(
            '{"name":"Monad Garden Seed #1",',
            '"description":"The first living specimen in Monad NFT Garden. Its care history is recorded by NFTGardenPassport.",',
            '"image":"',
            image,
            '","attributes":[',
            '{"trait_type":"Species","value":"Moonbell"},',
            '{"trait_type":"Habitat","value":"Monad"},',
            '{"trait_type":"Generation","value":1}',
            ']}'
        );

        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(metadata))
        );
    }

    function _seedImage() private pure returns (string memory) {
        return string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" shape-rendering="crispEdges">',
            '<rect width="640" height="640" fill="#dff2cf"/>',
            '<rect y="430" width="640" height="210" fill="#78a85a"/>',
            '<rect x="64" y="64" width="512" height="512" rx="24" fill="#fff9d9" stroke="#25352a" stroke-width="16"/>',
            '<rect x="96" y="96" width="448" height="448" fill="#bfe6c0"/>',
            '<path fill="#72503b" d="M288 352h64v144h-64z"/>',
            '<path fill="#35764b" d="M256 240h128v144H256zM208 288h224v64H208z"/>',
            '<path fill="#f8d55a" d="M288 176h64v64h-64zM240 224h160v64H240z"/>',
            '<path fill="#fff4a6" d="M304 208h32v32h-32z"/>',
            '<rect x="224" y="496" width="192" height="24" fill="#4d793f"/>',
            '<text x="320" y="132" text-anchor="middle" font-family="monospace" font-size="28" font-weight="700" fill="#25352a">GARDEN SEED #1</text>',
            '</svg>'
        );
    }
}
