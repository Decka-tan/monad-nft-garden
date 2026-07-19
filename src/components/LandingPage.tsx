import { useRef } from "react";
import { LandingMotion } from "./MotionDirector";

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
  const rootRef = useRef<HTMLElement>(null);
  const showError =
    /failed|rejected|denied|no wallet|install/i.test(
      walletStatus,
    );

  return (
    <main className="landing-page" ref={rootRef}>
      <LandingMotion root={rootRef} />
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
            Verify a Monad NFT, turn care freshness into a
            living state, and preserve each check-in on-chain.
          </p>
          <div className="landing-cta-row">
            <button
              className="hero-primary"
              type="button"
              onClick={onDemo}
            >
              Enter live garden
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
          <span>Ownership, metadata, token identity, care freshness.</span>
          <i aria-hidden="true" />
          <strong>Leave a record.</strong>
          <span>A lightweight Proof of Care stored on Monad.</span>
        </div>
      </section>
    </main>
  );
}
