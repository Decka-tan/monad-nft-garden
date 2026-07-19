const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTGardenPassport", function () {
  async function fixture() {
    const [tokenOwner, stranger] = await ethers.getSigners();
    const nft = await ethers.deployContract("MockERC721");
    const passport = await ethers.deployContract(
      "NFTGardenPassport",
    );
    await nft.setOwner(3, tokenOwner.address);
    return { tokenOwner, stranger, nft, passport };
  }

  it("lets the NFT owner record Proof of Care", async function () {
    const { tokenOwner, nft, passport } = await fixture();

    await expect(
      passport
        .connect(tokenOwner)
        .checkIn(
          await nft.getAddress(),
          3,
          76,
          "ipfs://sprite",
          "ipfs://analysis",
        ),
    ).to.emit(passport, "GardenCheckedIn");

    const key = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [await nft.getAddress(), 3],
      ),
    );
    const record = await passport.checkIns(key);
    expect(record.healthScore).to.equal(76);
  });

  it("rejects a wallet that does not own the NFT", async function () {
    const { stranger, nft, passport } = await fixture();

    await expect(
      passport
        .connect(stranger)
        .checkIn(
          await nft.getAddress(),
          3,
          76,
          "ipfs://sprite",
          "ipfs://analysis",
        ),
    ).to.be.revertedWithCustomError(passport, "NotTokenOwner");
  });
});
