import { FormEvent, useMemo, useState } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { buildReason, makeCollection, NftHealth, statusLabel, Status } from "./data";
import { GARDEN_ABI, GARDEN_CONTRACT_ADDRESS, getCheckInKey, MONAD_NETWORKS, MonadNetworkKey } from "./contract";

const demoWallet = "0x7d3A5a0F56f2E9fb000000000000000000000001";
const demoCollection = "0x0000000000000000000000000000000000000001";
const zeroAddress = "0x0000000000000000000000000000000000000000";
const slots = [
  [25.2, 36.5],
  [38.4, 36.5],
  [51.6, 36.5],
  [64.8, 36.5],
  [78, 36.5],
  [25.2, 49.7],
  [38.4, 49.7],
  [51.6, 49.7],
  [64.8, 49.7],
  [78, 49.7],
  [25.2, 62.9],
  [38.4, 62.9],
  [51.6, 62.9],
  [64.8, 62.9],
  [78, 62.9],
  [25.2, 76.2],
  [38.4, 76.2],
  [51.6, 76.2],
  [64.8, 76.2],
  [78, 76.2],
];

type ChainState = {
  account: string;
  chainId: string;
  owner: string;
  txHash: string;
  onchainScore: string;
  status: string;
};

const initialChain: ChainState = {
  account: "",
  chainId: "",
  owner: "",
  txHash: "",
  onchainScore: "",
  status: "Wallet not connected",
};

function Creature({ nft, large = false, useSprite = false }: { nft: NftHealth; large?: boolean; useSprite?: boolean }) {
  const glow = nft.status === "alive" ? "34px" : nft.status === "watch" ? "12px" : "0px";
  const glowColor = nft.status === "alive" ? `${nft.colors[0]}66` : nft.status === "watch" ? "#f3c45b55" : "transparent";
  const spriteId = String(((nft.id - 1) % 20) + 1).padStart(2, "0");
  const overlayOffset = nft.status === "alive" ? 0 : nft.status === "watch" ? 3 : 6;
  const overlayId = String(overlayOffset + ((nft.id - 1) % 3) + 1).padStart(2, "0");

  return (
    <>
      <div className="pedestal" />
      <div
        className={`creature ${useSprite ? "use-sprite" : ""}`}
        style={
          {
            "--size": `${large ? nft.size * 1.7 : nft.size}px`,
            "--tilt": `${nft.tilt}deg`,
            "--c1": nft.colors[0],
            "--c2": nft.colors[1],
            "--glow": glow,
            "--glow-color": glowColor,
          } as React.CSSProperties
        }
      >
        {useSprite && <img className="creature-sprite" src={`/assets/creatures/creature-${spriteId}.png`} alt="" />}
        {useSprite && <img className="health-overlay" src={`/assets/overlays/health-${overlayId}.png`} alt="" />}
        <span className="creature-leaf" aria-hidden="true" />
        <span className="creature-face" aria-hidden="true">
          <span className="creature-eye" />
          <span className="creature-eye" />
          <span className="creature-mouth" />
        </span>
      </div>
    </>
  );
}

function shortAddress(address: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusClass(status: Status) {
  return status;
}

function isContractConfigured() {
  return ethers.isAddress(GARDEN_CONTRACT_ADDRESS) && GARDEN_CONTRACT_ADDRESS !== zeroAddress;
}

async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or another EIP-1193 wallet.");
  }
  return new BrowserProvider(window.ethereum);
}

async function switchToMonad(networkKey: MonadNetworkKey) {
  if (!window.ethereum) {
    throw new Error("No injected wallet found.");
  }
  const network = MONAD_NETWORKS[networkKey];

  try {
    await window.ethereum.request?.({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainId }],
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? (error as { code?: number }).code : undefined;
    if (code !== 4902) throw error;
    await window.ethereum.request?.({
      method: "wallet_addEthereumChain",
      params: [network],
    });
  }
}

export default function App() {
  const [walletInput, setWalletInput] = useState(demoWallet);
  const [contractInput, setContractInput] = useState(demoCollection);
  const [nfts, setNfts] = useState(() => makeCollection(demoWallet));
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<NftHealth | null>(null);
  const [referenceImage, setReferenceImage] = useState("/assets/featured-specimen.png");
  const [chain, setChain] = useState<ChainState>(initialChain);
  const [networkKey, setNetworkKey] = useState<MonadNetworkKey>("testnet");

  const visible = useMemo(() => nfts.filter((nft) => filter === "all" || nft.status === filter), [filter, nfts]);
  const counts = useMemo(
    () =>
      nfts.reduce(
        (acc, nft) => {
          acc[nft.status] += 1;
          return acc;
        },
        { alive: 0, watch: 0, dead: 0 },
      ),
    [nfts],
  );
  const portfolioScore = Math.round(nfts.reduce((sum, nft) => sum + nft.score, 0) / nfts.length);
  const topAth = Math.max(...nfts.map((nft) => nft.floorAth));
  const avgFloor = nfts.reduce((sum, nft) => sum + nft.floorNow, 0) / nfts.length;
  const holders = nfts.reduce((sum, nft) => sum + nft.holders, 0);
  const lastTrade = Math.max(8, 90 - nfts[0].trades);
  const canWriteCheckIn =
    isContractConfigured() &&
    ethers.isAddress(contractInput) &&
    Boolean(chain.account) &&
    Boolean(chain.owner) &&
    chain.owner !== "Deploy contract, then set VITE_GARDEN_CONTRACT_ADDRESS" &&
    chain.account.toLowerCase() === chain.owner.toLowerCase();

  function analyze(event: FormEvent) {
    event.preventDefault();
    const seed = walletInput.trim() || contractInput.trim() || "monad-demo-wallet";
    setNfts(makeCollection(seed));
    setSelected(null);
    setChain((current) => ({ ...current, onchainScore: "", txHash: "", status: "Local analysis refreshed" }));
  }

  async function connectWallet() {
    try {
      await switchToMonad(networkKey);
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const account = await signer.getAddress();
      const next: ChainState = {
        ...chain,
        account,
        chainId: `0x${network.chainId.toString(16)}`,
        status: `Connected to ${MONAD_NETWORKS[networkKey].chainName}`,
      };

      if (isContractConfigured()) {
        const contract = new Contract(GARDEN_CONTRACT_ADDRESS, GARDEN_ABI, provider);
        next.owner = await contract.owner();
      } else {
        next.owner = "Deploy contract, then set VITE_GARDEN_CONTRACT_ADDRESS";
      }

      setChain(next);
    } catch (error) {
      setChain((current) => ({ ...current, status: error instanceof Error ? error.message : "Wallet connection failed" }));
    }
  }

  async function readCheckIn(nft: NftHealth) {
    try {
      if (!isContractConfigured()) {
        throw new Error("Set VITE_GARDEN_CONTRACT_ADDRESS after deployment.");
      }
      if (!ethers.isAddress(contractInput)) {
        throw new Error("Collection contract must be a full 0x address before reading on-chain.");
      }
      const provider = await getBrowserProvider();
      const contract = new Contract(GARDEN_CONTRACT_ADDRESS, GARDEN_ABI, provider);
      const key = getCheckInKey(contractInput, nft.tokenId);
      const result = await contract.checkIns(key);
      const score = Number(result.healthScore || 0);
      setChain((current) => ({
        ...current,
        onchainScore: score ? `${score}/100 at ${new Date(Number(result.updatedAt) * 1000).toLocaleString()}` : "No on-chain check-in yet",
        status: "Read check-in from contract",
      }));
    } catch (error) {
      setChain((current) => ({ ...current, status: error instanceof Error ? error.message : "Read failed" }));
    }
  }

  async function writeCheckIn(nft: NftHealth) {
    try {
      if (!isContractConfigured()) {
        throw new Error("Set VITE_GARDEN_CONTRACT_ADDRESS after deployment.");
      }
      if (!ethers.isAddress(contractInput)) {
        throw new Error("Collection contract must be a full 0x address before writing on-chain.");
      }

      await switchToMonad(networkKey);
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      if (chain.owner && account.toLowerCase() !== chain.owner.toLowerCase()) {
        throw new Error("Only the deployed Garden contract owner can write check-ins.");
      }
      const contract = new Contract(GARDEN_CONTRACT_ADDRESS, GARDEN_ABI, signer);
      const spriteCid = `ipfs://sprite-${nft.seed.toString(16)}`;
      const dataCid = `ipfs://analysis-${nft.seed.toString(16)}`;
      const tx = await contract.checkIn(contractInput, nft.tokenId, nft.score, spriteCid, dataCid);
      setChain((current) => ({ ...current, txHash: tx.hash, status: "Transaction submitted" }));
      await tx.wait();
      setChain((current) => ({ ...current, txHash: tx.hash, status: "Check-in confirmed on-chain" }));
    } catch (error) {
      setChain((current) => ({ ...current, status: error instanceof Error ? error.message : "Write failed" }));
    }
  }

  function handleImage(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => setReferenceImage(String(reader.result)));
    reader.readAsDataURL(file);
  }

  return (
    <main className="shell">
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#">
          <span className="brand-mark" aria-hidden="true" />
          <span>Monad NFT Garden</span>
        </a>
        <div className="nav-actions">
          <div className="network-toggle" role="group" aria-label="Select Monad network">
            {(["testnet", "mainnet"] as MonadNetworkKey[]).map((item) => (
              <button
                key={item}
                className={`filter ${networkKey === item ? "is-active" : ""}`}
                type="button"
                onClick={() => setNetworkKey(item)}
              >
                {item === "testnet" ? "Testnet" : "Mainnet"}
              </button>
            ))}
          </div>
          <button className="icon-button" type="button" onClick={connectWallet}>
            {chain.account ? shortAddress(chain.account) : "Connect"}
          </button>
          <a className="ghost-button" href="https://docs.monad.xyz/guides/deploy-smart-contract/index" target="_blank" rel="noreferrer">
            Deploy docs
          </a>
        </div>
      </nav>

      <section className="hero compact-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker">Monad testnet garden desk</p>
          <h1 id="hero-title">Is Monad NFT really dead?</h1>
          <p className="hero-text">
            Drop a wallet or collection into the planter. Each token gets a little garden body, a health mood,
            and an on-chain check-in trail when you want to stamp it.
          </p>
          <form className="scan-form" onSubmit={analyze}>
            <label className="input-wrap">
              <span>Wallet or contract</span>
              <input value={walletInput} onChange={(event) => setWalletInput(event.target.value)} spellCheck={false} placeholder="0x..." />
            </label>
            <button className="primary-button" type="submit">
              Analyze
            </button>
          </form>
          <div className="signal-row" aria-label="Summary metrics">
            <div><strong>{counts.alive}</strong><span>sprouting</span></div>
            <div><strong>{counts.watch}</strong><span>wilt watch</span></div>
            <div><strong>{counts.dead}</strong><span>dormant</span></div>
          </div>
        </div>

        <aside className="snapshot" aria-label="Garden health snapshot">
          <div className="snapshot-head"><span>Garden score</span><strong>{portfolioScore}</strong></div>
          <div className="health-orbit" aria-hidden="true">
            <img src="/assets/featured-specimen.png" alt="" />
            <span /><span /><span /><span />
          </div>
          <dl className="snapshot-list">
            <div><dt>Floor ATH</dt><dd>{topAth.toFixed(1)} MON</dd></div>
            <div><dt>Current floor</dt><dd>{avgFloor.toFixed(1)} MON</dd></div>
            <div><dt>Holders</dt><dd>{holders.toLocaleString()}</dd></div>
            <div><dt>Last trade</dt><dd>{lastTrade}m ago</dd></div>
          </dl>
        </aside>
      </section>

      <section className="workspace garden-first" aria-label="NFT sandbox">
        <aside className="control-panel">
          <div className="panel-section">
            <h2>Garden ledger</h2>
            <p>{chain.status}</p>
          </div>
          <div className="panel-section chain-card">
            <dl>
              <div><dt>Account</dt><dd>{shortAddress(chain.account)}</dd></div>
              <div><dt>Chain</dt><dd>{chain.chainId || "Not connected"}</dd></div>
              <div><dt>Garden contract</dt><dd>{shortAddress(GARDEN_CONTRACT_ADDRESS)}</dd></div>
              <div><dt>Owner</dt><dd>{chain.owner ? shortAddress(chain.owner) : "Unknown"}</dd></div>
              <div><dt>Last check-in</dt><dd>{chain.onchainScore || "None read"}</dd></div>
              <div><dt>Last tx</dt><dd>{chain.txHash ? shortAddress(chain.txHash) : "None"}</dd></div>
            </dl>
          </div>
          <div className="panel-section">
            <label className="input-wrap compact">
              <span>Collection contract</span>
              <input value={contractInput} onChange={(event) => setContractInput(event.target.value)} />
            </label>
            <label className="input-wrap compact">
              <span>Sprite reference</span>
              <input type="file" accept="image/*" onChange={(event) => handleImage(event.target.files?.[0])} />
            </label>
            <div className="sample-card">
              <img src={referenceImage} alt="Reference NFT sprite" />
              <span>Reference pinned for the selected specimen</span>
            </div>
          </div>
          <div className="panel-section">
            <h3>Health formula</h3>
            <ul className="formula-list">
              <li><span>40%</span> floor resilience</li>
              <li><span>25%</span> recent trades</li>
              <li><span>20%</span> holder spread</li>
              <li><span>15%</span> rarity and traits</li>
            </ul>
          </div>
        </aside>

        <div className="garden-wrap">
          <div className="garden-toolbar">
            <div>
              <h2>Specimen beds</h2>
              <p>20 NFTs analyzed from {walletInput.slice(0, 10)}...</p>
            </div>
            <div className="filter-group" role="group" aria-label="Filter NFTs">
              {(["all", "alive", "watch", "dead"] as Array<Status | "all">).map((item) => (
                <button key={item} className={`filter ${filter === item ? "is-active" : ""}`} type="button" onClick={() => setFilter(item)}>
                  {item === "all" ? "All" : item === "alive" ? "Sprout" : item === "watch" ? "Watch" : "Dormant"}
                </button>
              ))}
            </div>
          </div>

          <div className="garden garden-world" aria-live="polite">
            {visible.map((nft) => (
              <article
                className={`plot ${getStatusClass(nft.status)}`}
                key={nft.id}
                style={
                  {
                    "--x": `${slots[nft.id - 1][0]}%`,
                    "--y": `${slots[nft.id - 1][1]}%`,
                  } as React.CSSProperties
                }
              >
                <Creature nft={nft} />
                <button className="plot-button" type="button" aria-label={`Inspect ${nft.name}`} onClick={() => setSelected(nft)}>
                  <span className="nft-meta">
                    <span>
                      <strong>{nft.name}</strong>
                      <span>#{String(nft.id).padStart(3, "0")} / score {nft.score}</span>
                    </span>
                  <span className="status-pill">{nft.status === "alive" ? "Sprout" : nft.status === "watch" ? "Watch" : "Dormant"}</span>
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <section className="detail-modal is-open" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-shell">
              <button className="close-button" type="button" onClick={() => setSelected(null)}>Close</button>
              <div className={`modal-art ${selected.status}`}>
                {referenceImage && <img className="reference-image" src={referenceImage} alt="" />}
                <Creature nft={selected} large />
              </div>
              <div className="modal-body">
                <p className="kicker">{selected.status === "alive" ? "Sprout" : selected.status === "watch" ? "Watch" : "Dormant"} / health score {selected.score}</p>
                <h2 id="modal-title">{selected.name} #{String(selected.id).padStart(3, "0")}</h2>
                <p>
                  This specimen is grown from token activity: floor resilience, trade pulse, holder spread,
                  and rarity signals all nudge the garden mood.
                </p>
                <dl className="metric-grid">
                  {[
                    ["Token ID", selected.tokenId],
                    ["Minted by", selected.minter],
                    ["Floor ATH", `${selected.floorAth.toFixed(1)} MON`],
                    ["Current floor", `${selected.floorNow.toFixed(1)} MON`],
                    ["24h trades", selected.trades],
                    ["Holders", selected.holders.toLocaleString()],
                    ["Traits", selected.traits],
                    ["Rarity rank", `#${selected.rarity}`],
                  ].map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
                <div className="modal-actions">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={!canWriteCheckIn}
                    title={canWriteCheckIn ? "Store this health check-in on-chain" : "Connect the Garden contract owner wallet to write"}
                    onClick={() => writeCheckIn(selected)}
                  >
                    Write check-in
                  </button>
                  <button className="ghost-button" type="button" onClick={() => readCheckIn(selected)}>Read on-chain</button>
                </div>
                <div className="reason-box">
                  <h3>Why this score?</h3>
                  <p>{buildReason(selected)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
