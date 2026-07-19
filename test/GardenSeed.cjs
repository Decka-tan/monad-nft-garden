const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GardenSeed", function () {
  it("mints a standards-compatible onchain specimen to the deployer", async function () {
    const [owner] = await ethers.getSigners();
    const seed = await ethers.deployContract("GardenSeed");

    expect(await seed.ownerOf(1)).to.equal(owner.address);
    expect(await seed.name()).to.equal("Monad Garden Seed");
    expect(await seed.symbol()).to.equal("SEED");

    const tokenUri = await seed.tokenURI(1);
    expect(tokenUri).to.match(/^data:application\/json;base64,/);
    const metadata = JSON.parse(
      Buffer.from(tokenUri.split(",")[1], "base64").toString("utf8"),
    );
    expect(metadata.name).to.equal("Monad Garden Seed #1");
    expect(metadata.image).to.match(/^data:image\/svg\+xml;base64,/);
    expect(metadata.attributes).to.have.length(3);
  });

  it("can record care through NFTGardenPassport", async function () {
    const seed = await ethers.deployContract("GardenSeed");
    const passport = await ethers.deployContract("NFTGardenPassport");

    await expect(
      passport.checkIn(await seed.getAddress(), 1, 92, "", await seed.tokenURI(1)),
    ).to.emit(passport, "GardenCheckedIn");
  });
});
