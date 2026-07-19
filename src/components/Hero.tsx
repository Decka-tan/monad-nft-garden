import type { FormEvent } from "react";

type Props = {
  walletInput: string;
  onWalletChange: (value: string) => void;
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
};

export function Hero({
  walletInput,
  onWalletChange,
  loading,
  onAnalyze,
  counts,
  apiNote,
  portfolioScore,
  avgFloor,
  holders,
  lastTrade,
  dataSource,
}: Props) {
  const sourceLabel =
    dataSource === "mock" || dataSource.includes("local")
      ? "Demo model"
      : "Live data";

  return (
    <header className="garden-header">
      <div className="garden-heading">
        <div className="source-label">
          <span>{sourceLabel}</span>
          <span>Monad</span>
        </div>
        <h1>Your collection, as a living system.</h1>
        <p>
          Every creature translates four market signals into
          one health state you can understand at a glance.
        </p>
      </div>

      <form className="garden-search" onSubmit={onAnalyze}>
        <label>
          <span>Wallet or collection</span>
          <input
            value={walletInput}
            onChange={(event) =>
              onWalletChange(event.target.value)
            }
            placeholder="0x..."
            spellCheck={false}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Reading..." : "Grow garden"}
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
        </dl>
      </div>
    </header>
  );
}
