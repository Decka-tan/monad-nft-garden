import { GARDEN_CONTRACT_ADDRESS } from "../chain/config";
import { shortAddress } from "../lib/format";
import type { ChainState } from "../types";

type Props = {
  chain: ChainState;
  contractInput: string;
  onContractChange: (value: string) => void;
  referenceImage: string;
  onImage: (file: File | undefined) => void;
  apiBase: string;
};

export function ControlPanel({
  chain,
  contractInput,
  onContractChange,
  referenceImage,
  onImage,
  apiBase,
}: Props) {
  return (
    <aside className="control-panel">
      <div className="panel-section">
        <h2>Garden ledger</h2>
        <p>{chain.status}</p>
        <p style={{ opacity: 0.75, fontSize: "0.85rem" }}>
          API: {apiBase}
        </p>
      </div>

      <div className="panel-section chain-card">
        <dl>
          <div>
            <dt>Account</dt>
            <dd>{shortAddress(chain.account)}</dd>
          </div>
          <div>
            <dt>Chain</dt>
            <dd>{chain.chainId || "Not connected"}</dd>
          </div>
          <div>
            <dt>Garden contract</dt>
            <dd>{shortAddress(GARDEN_CONTRACT_ADDRESS)}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>
              {chain.owner
                ? shortAddress(chain.owner)
                : "Unknown"}
            </dd>
          </div>
          <div>
            <dt>Last check-in</dt>
            <dd>{chain.onchainScore || "None read"}</dd>
          </div>
          <div>
            <dt>Last tx</dt>
            <dd>
              {chain.txHash
                ? shortAddress(chain.txHash)
                : "None"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="panel-section">
        <label className="input-wrap compact">
          <span>Collection contract</span>
          <input
            value={contractInput}
            onChange={(e) =>
              onContractChange(e.target.value)
            }
          />
        </label>
        <label className="input-wrap compact">
          <span>Sprite reference</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              onImage(e.target.files?.[0])
            }
          />
        </label>
        <div className="sample-card">
          <img
            src={referenceImage}
            alt="Reference NFT sprite"
          />
          <span>
            Reference pinned for the selected specimen
          </span>
        </div>
      </div>

      <div className="panel-section">
        <h3>Health formula</h3>
        <ul className="formula-list">
          <li>
            <span>40%</span> floor resilience
          </li>
          <li>
            <span>25%</span> recent trades
          </li>
          <li>
            <span>20%</span> holder spread
          </li>
          <li>
            <span>15%</span> rarity and traits
          </li>
        </ul>
      </div>
    </aside>
  );
}
