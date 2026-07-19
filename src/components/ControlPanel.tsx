import {
  MONAD_NETWORKS,
  gardenContractAddressFor,
  type MonadNetworkKey,
} from "../chain/config";
import { shortAddress } from "../lib/format";
import type { ChainState } from "../types";

type Props = {
  chain: ChainState;
  dataSource: string;
  networkKey: MonadNetworkKey;
};

export function ControlPanel({
  chain,
  dataSource,
  networkKey,
}: Props) {
  const isDemo =
    dataSource === "mock" || dataSource.startsWith("demo");
  const liveFailed = dataSource === "live-error";
  const passportAddress = gardenContractAddressFor(networkKey);

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
        <strong>
          {isDemo
            ? "Demo market model"
            : liveFailed
              ? "Live data unavailable"
              : "Live garden data"}
        </strong>
        <p>
          {isDemo
            ? "Health values are deterministic sample data. Contract reads are always labeled separately."
            : liveFailed
              ? "No placeholder portfolio was substituted. Check the inline provider error."
              : "Ownership, metadata, and care freshness were read directly from Monad."}
        </p>
      </div>

      <dl className="care-ledger">
        <div>
          <dt>Wallet</dt>
          <dd>{shortAddress(chain.account)}</dd>
        </div>
        <div>
          <dt>Passport</dt>
          <dd>
            {/^0x0{40}$/i.test(passportAddress)
              ? "Not deployed"
              : shortAddress(passportAddress)}
          </dd>
        </div>
        <div>
          <dt>Last care read</dt>
          <dd>{chain.onchainScore || "No record read"}</dd>
        </div>
        <div>
          <dt>Transaction</dt>
          <dd>
            {chain.txHash ? (
              <a
                href={`${MONAD_NETWORKS[networkKey].blockExplorerUrls[0]}/tx/${chain.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {shortAddress(chain.txHash)}
              </a>
            ) : (
              "None"
            )}
          </dd>
        </div>
      </dl>

      <p className="chain-status" role="status">
        {chain.status}
      </p>

      <div className="formula">
        <h3>{isDemo ? "Demo health model" : "Live care state"}</h3>
        {isDemo ? (
          <>
            <div><span>Floor resilience</span><strong>40%</strong></div>
            <div><span>Trade pulse</span><strong>25%</strong></div>
            <div><span>Holder spread</span><strong>20%</strong></div>
            <div><span>Rarity signal</span><strong>15%</strong></div>
          </>
        ) : (
          <>
            <div><span>Owner</span><strong>Verified</strong></div>
            <div><span>Metadata</span><strong>Onchain URI</strong></div>
            <div><span>Health</span><strong>Care freshness</strong></div>
          </>
        )}
      </div>
    </aside>
  );
}
