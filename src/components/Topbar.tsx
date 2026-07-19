import type { MonadNetworkKey } from "../chain/config";
import { shortAddress } from "../lib/format";

type Props = {
  networkKey: MonadNetworkKey;
  onNetwork: (key: MonadNetworkKey) => void;
  account: string;
  onConnect: () => void;
  onHome: () => void;
};

export function Topbar({
  networkKey,
  onNetwork,
  account,
  onConnect,
  onHome,
}: Props) {
  return (
    <nav className="topbar" aria-label="Primary">
      <button className="brand" type="button" onClick={onHome}>
        <img
          className="brand-icon"
          src="/assets/ui/logo-icon.png"
          alt=""
        />
        <span>
          <strong>Monad</strong>
          <small>NFT Garden</small>
        </span>
      </button>
      <div className="nav-actions">
        <div
          className="network-toggle"
          role="group"
          aria-label="Select Monad network"
        >
          {(["testnet", "mainnet"] as MonadNetworkKey[]).map(
            (item) => (
              <button
                key={item}
                className={`filter ${networkKey === item ? "is-active" : ""}`}
                type="button"
                onClick={() => onNetwork(item)}
              >
                {item === "testnet" ? "Testnet" : "Mainnet"}
              </button>
            ),
          )}
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onConnect}
        >
          {account ? shortAddress(account) : "Connect"}
        </button>
      </div>
    </nav>
  );
}
