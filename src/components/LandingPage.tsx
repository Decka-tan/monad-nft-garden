type Props = {
  onDemo: () => void;
  onConnect: () => void;
  walletStatus: string;
};

export function LandingPage({
  onDemo,
  onConnect,
  walletStatus,
}: Props) {
  const showError =
    /failed|rejected|denied|no wallet|install/i.test(
      walletStatus,
    );

  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Primary">
        <a className="landing-brand" href="#top">
          <img src="/assets/ui/logo-icon.png" alt="" />
          <span>
            <strong>Monad</strong>
            <small>NFT Garden</small>
          </span>
        </a>
        <div className="landing-nav-actions">
          <span className="built-on">Built on Monad</span>
          <button
            className="landing-connect"
            type="button"
            onClick={onConnect}
          >
            Connect wallet
          </button>
        </div>
      </nav>

      <section
        id="top"
        className="landing-hero"
        aria-labelledby="landing-title"
      >
        <div className="landing-copy">
          <p className="landing-kicker">Proof of Care for NFTs</p>
          <h1 id="landing-title">
            Your NFTs are waiting for care.
          </h1>
          <p className="landing-intro">
            Turn Monad holdings into living health signals,
            then preserve every care check-in on-chain.
          </p>
          <div className="landing-cta-row">
            <button
              className="hero-primary"
              type="button"
              onClick={onDemo}
            >
              Open demo garden
            </button>
            <button
              className="hero-secondary"
              type="button"
              onClick={onConnect}
            >
              Grow my garden
            </button>
          </div>
          {showError && (
            <p className="landing-error" role="status">
              {walletStatus}
            </p>
          )}
        </div>

        <div className="landing-proof" aria-label="Product summary">
          <strong>See the signal.</strong>
          <span>Floor resilience, trade pulse, holder spread, rarity.</span>
          <i aria-hidden="true" />
          <strong>Leave a record.</strong>
          <span>A lightweight Proof of Care stored on Monad.</span>
        </div>
      </section>
    </main>
  );
}
