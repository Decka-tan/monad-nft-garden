import type { OnchainNftRead } from "../chain/nft";
import type { NftHealth } from "../types";
import { buildReason } from "../garden/reasons";
import { shortAddress, statusPill } from "../lib/format";
import { Creature } from "./Creature";

type Props = {
  nft: NftHealth;
  canRead: boolean;
  canWrite: boolean;
  onClose: () => void;
  onWrite: () => void;
  onRead: () => void;
  onReadNft: () => void;
  nftRead: {
    loading: boolean;
    data: OnchainNftRead | null;
    error: string;
  };
};

export function NftModal({
  nft,
  canRead,
  canWrite,
  onClose,
  onWrite,
  onRead,
  onReadNft,
  nftRead,
}: Props) {
  const isLive = nft.dataOrigin === "live";
  const metrics: Array<[string, string | number]> = isLive
    ? [
        ["Owner", shortAddress(nft.owner || "")],
        ["Collection", shortAddress(nft.collection || "")],
        ["Token ID", `#${nft.tokenId}`],
        ["Metadata traits", nft.traits],
        [
          "Proof of Care",
          nft.proofUpdatedAt
            ? new Date(nft.proofUpdatedAt).toLocaleDateString()
            : "Not recorded",
        ],
        ["Source", "Monad RPC"],
      ]
    : [
        ["Floor ATH", `${nft.floorAth.toFixed(1)} MON`],
        ["Current floor", `${nft.floorNow.toFixed(1)} MON`],
        ["Trades in 30d", nft.trades],
        ["Holders", nft.holders.toLocaleString()],
        ["Traits", nft.traits],
        ["Rarity rank", `#${nft.rarity}`],
      ];

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          type="button"
          onClick={onClose}
          aria-label="Close NFT details"
        >
          Close
        </button>

        <div className={`modal-creature ${nft.status}`}>
          {nftRead.data?.imageUrl || nft.imageUrl ? (
            <img
              className="onchain-nft-image"
              src={nftRead.data?.imageUrl || nft.imageUrl || ""}
              alt={nftRead.data?.nftName || nft.name}
            />
          ) : (
            <Creature nft={nft} large useSprite />
          )}
          <span className="modal-health">{nft.score}</span>
        </div>

        <div className="modal-content">
          <p className="modal-status">
            {statusPill(nft.status)} {isLive ? "care state" : "health"}
          </p>
          <h2 id="modal-title">
            {nft.name}
            {!nft.name.includes(`#${nft.tokenId}`) &&
              ` #${nft.tokenId}`}
          </h2>
          <p className="modal-reason">{buildReason(nft)}</p>

          <dl className="metric-grid">
            {metrics.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <section className="contract-readout">
            <div>
              <h3>NFT contract</h3>
              <p>
                {isLive
                  ? "Ownership and metadata verified by the live API."
                  : "Read ownership and metadata directly from Monad."}
              </p>
            </div>
            <button
              className="read-button"
              type="button"
              onClick={onReadNft}
              disabled={nftRead.loading}
            >
              {nftRead.loading ? "Reading..." : isLive ? "Refresh NFT" : "Verify NFT"}
            </button>

            {nftRead.data && (
              <dl className="nft-proof" role="status">
                <div>
                  <dt>Collection</dt>
                  <dd>{nftRead.data.collectionName}</dd>
                </div>
                <div>
                  <dt>Token</dt>
                  <dd>{nftRead.data.nftName}</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>{shortAddress(nftRead.data.owner)}</dd>
                </div>
              </dl>
            )}
            {nftRead.error && (
              <p className="read-error" role="alert">
                {nftRead.error}
              </p>
            )}
          </section>

          <div className="proof-actions">
            <button
              className="primary-button"
              type="button"
              disabled={!canWrite}
              onClick={onWrite}
              title={
                canWrite
                  ? "Record this health state on Monad"
                  : "Connect the token owner and configure the passport contract"
              }
            >
              Record Proof of Care
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={onRead}
              disabled={!canRead}
            >
              Read care record
            </button>
          </div>
          {(!canRead || !canWrite) && (
            <p className="proof-hint">
              {!canRead
                ? "Proof of Care is deployed on Monad Mainnet."
                : "Connect the verified token owner to record care."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
