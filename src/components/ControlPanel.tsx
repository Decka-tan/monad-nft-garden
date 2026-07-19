import { GARDEN_CONTRACT_ADDRESS } from "../chain/config";
import { shortAddress } from "../lib/format";
import type { ChainState } from "../types";

type Props = {
  chain: ChainState;
  contractInput: string;
  onContractChange: (value: string) => void;
  dataSource: string;
};

export function ControlPanel({
  chain,
  contractInput,
  onContractChange,
  dataSource,
}: Props) {
  const isDemo =
    dataSource === "mock" || dataSource.includes("local");

  return (
    <aside className="field-notes" aria-label="Care record">
      <div className="notes-heading">
        <span>Care record</span>
        <h2>Proof of Care</h2>
        <p>
          Diagnose off-chain. Preserve the latest care record
          on Monad.
        </p>
      </div>

      <div className="source-disclosure">
        <strong>{isDemo ? "Demo market model" : "Live garden data"}</strong>
        <p>
          {isDemo
            ? "Health values are deterministic sample data. Contract reads are always labeled separately."
            : "Garden health was returned by the configured data service."}
        </p>
      </div>

      <dl className="care-ledger">
        <div>
          <dt>Wallet</dt>
          <dd>{shortAddress(chain.account)}</dd>
        </div>
        <div>
          <dt>Passport</dt>
          <dd>{shortAddress(GARDEN_CONTRACT_ADDRESS)}</dd>
        </div>
        <div>
          <dt>Last care read</dt>
          <dd>{chain.onchainScore || "No record read"}</dd>
        </div>
        <div>
          <dt>Transaction</dt>
          <dd>{chain.txHash ? shortAddress(chain.txHash) : "None"}</dd>
        </div>
      </dl>

      <p className="chain-status" role="status">
        {chain.status}
      </p>

      <label className="contract-field">
        <span>NFT collection contract</span>
        <input
          value={contractInput}
          onChange={(event) =>
            onContractChange(event.target.value)
          }
          spellCheck={false}
        />
      </label>

      <div className="formula">
        <h3>What shapes health</h3>
        <div><span>Floor resilience</span><strong>40%</strong></div>
        <div><span>Trade pulse</span><strong>25%</strong></div>
        <div><span>Holder spread</span><strong>20%</strong></div>
        <div><span>Rarity signal</span><strong>15%</strong></div>
      </div>
    </aside>
  );
}
