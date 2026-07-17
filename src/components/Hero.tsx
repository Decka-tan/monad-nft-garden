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
  topAth,
  avgFloor,
  holders,
  lastTrade,
  dataSource,
}: Props) {
  return (
    <section
      className="hero compact-hero"
      aria-labelledby="hero-title"
    >
      <div className="hero-copy">
        <p className="kicker">
          Is Monad NFT really dead? We make these alive with
          this Sandbox.
        </p>
        <h1 id="hero-title">Is Monad NFT really dead?</h1>
        <p className="hero-text">
          Drop a wallet or collection into the planter. Each
          token gets a little garden body, a health mood, and
          an on-chain check-in when you want to stamp it.
        </p>
        <form className="scan-form" onSubmit={onAnalyze}>
          <label className="input-wrap">
            <span>Wallet or contract</span>
            <input
              value={walletInput}
              onChange={(e) => onWalletChange(e.target.value)}
              spellCheck={false}
              placeholder="0x..."
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </form>
        <div className="signal-row" aria-label="Summary metrics">
          <div>
            <strong>{counts.alive}</strong>
            <span>sprouting</span>
          </div>
          <div>
            <strong>{counts.watch}</strong>
            <span>wilt watch</span>
          </div>
          <div>
            <strong>{counts.dead}</strong>
            <span>dormant</span>
          </div>
        </div>
        {apiNote && (
          <p
            className="hero-text"
            style={{ opacity: 0.8, fontSize: "0.9rem" }}
          >
            {apiNote}
          </p>
        )}
      </div>

      <aside
        className="snapshot"
        aria-label="Garden health snapshot"
      >
        <div className="snapshot-head">
          <span>Garden score</span>
          <strong>{portfolioScore}</strong>
        </div>
        <div className="health-orbit" aria-hidden="true">
          <img src="/assets/featured-specimen.png" alt="" />
          <span />
          <span />
          <span />
          <span />
        </div>
        <dl className="snapshot-list">
          <div>
            <dt>Floor ATH</dt>
            <dd>{topAth.toFixed(1)} MON</dd>
          </div>
          <div>
            <dt>Current floor</dt>
            <dd>{avgFloor.toFixed(1)} MON</dd>
          </div>
          <div>
            <dt>Holders</dt>
            <dd>{holders.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Last trade</dt>
            <dd>{lastTrade}m ago</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{dataSource}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
