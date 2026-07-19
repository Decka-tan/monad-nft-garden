import type { FormEvent } from "react";
import type { MonadNetworkKey } from "../chain/config";

type Props = {
  collectionInput: string;
  onCollectionChange: (value: string) => void;
  tokenInput: string;
  onTokenChange: (value: string) => void;
  loading: boolean;
  onAnalyze: (event: FormEvent) => void;
  counts: { alive: number; watch: number; dead: number };
  apiNote: string;
  portfolioScore: number;
  topAth: number;
  avgFloor: number;
  holders: number;
  lastTrade: number;
  dataSource: string;
  nftCount: number;
  networkKey: MonadNetworkKey;
};

export function Hero({
  collectionInput,
  onCollectionChange,
  tokenInput,
  onTokenChange,
  loading,
  onAnalyze,
  counts,
  apiNote,
  portfolioScore,
  avgFloor,
  holders,
  lastTrade,
  dataSource,
  nftCount,
  networkKey,
}: Props) {
  const isLive = dataSource === "live";
  const liveSurface = isLive || dataSource === "live-error";
  const sourceLabel = isLive
    ? "Live onchain"
    : dataSource === "live-error"
      ? "Live read failed"
      : "Demo garden";

  return (
    <header className="garden-header">
      <div className="garden-heading">
        <div className="source-label">
          <span>{sourceLabel}</span>
          <span>Monad</span>
        </div>
        <h1>
          {liveSurface
            ? isLive
              ? "A verified NFT, growing on Monad."
              : "Read a verified NFT from Monad."
            : "Your collection, as a living system."}
        </h1>
        <p>
          {liveSurface
            ? isLive
              ? "Ownership, metadata, and care freshness read directly from Monad."
              : "Fix the network, contract, token, or provider configuration. No placeholder data is shown."
            : "Explore the visual model, then replace it with a live NFT search."}
        </p>
      </div>

      <form className="garden-search" onSubmit={onAnalyze}>
        <label>
          <span>NFT collection</span>
          <input
            value={collectionInput}
            onChange={(event) =>
              onCollectionChange(event.target.value)
            }
            placeholder="0x..."
            spellCheck={false}
          />
        </label>
        <label className="token-field">
          <span>Token ID</span>
          <input
            value={tokenInput}
            onChange={(event) => onTokenChange(event.target.value)}
            placeholder="3"
            inputMode="numeric"
            spellCheck={false}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Reading..." : "Read NFT"}
        </button>
        {apiNote && <small role="status">{apiNote}</small>}
      </form>

      <div className="garden-stats" aria-label="Garden health">
        <div className="score-stat">
          <strong>{portfolioScore}</strong>
          <span>garden health</span>
        </div>
        <dl>
          <div>
            <dt>Thriving</dt>
            <dd>{counts.alive}</dd>
          </div>
          <div>
            <dt>Needs care</dt>
            <dd>{counts.watch}</dd>
          </div>
          <div>
            <dt>Dormant</dt>
            <dd>{counts.dead}</dd>
          </div>
          {liveSurface ? (
            <>
              <div>
                <dt>NFTs read</dt>
                <dd>{nftCount}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{isLive ? "Monad RPC" : "Unavailable"}</dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>{networkKey === "mainnet" ? "Mainnet" : "Testnet"}</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Avg. floor</dt>
                <dd>{avgFloor.toFixed(1)} MON</dd>
              </div>
              <div>
                <dt>Holders</dt>
                <dd>{holders.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Trade pulse</dt>
                <dd>{lastTrade}m</dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </header>
  );
}
