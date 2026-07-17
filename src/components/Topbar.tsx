import type { MonadNetworkKey } from "../chain/config";
import { shortAddress } from "../lib/format";

type Props = {
  networkKey: MonadNetworkKey;
  onNetwork: (key: MonadNetworkKey) => void;
  account: string;
  onConnect: () => void;
};

export function Topbar({
  networkKey,
  onNetwork,
  account,
  onConnect,
}: Props) {
  return (
    <nav className="topbar" aria-label="Primary">
      <a className="brand" href="#">
        <span className="brand-mark" aria-hidden="true" />
        <span>Monad NFT Garden</span>
      </a>
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
        <a
          className="ghost-button"
          href="https://docs.monad.xyz/guides/deploy-smart-contract/index"
          target="_blank"
          rel="noreferrer"
        >
          Deploy docs
        </a>
      </div>
    </nav>
  );
}
