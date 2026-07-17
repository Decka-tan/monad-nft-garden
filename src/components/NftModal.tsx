import type { NftHealth } from "../types";
import { buildReason } from "../garden/reasons";
import { statusPill } from "../lib/format";
import { Creature } from "./Creature";

type Props = {
  nft: NftHealth;
  referenceImage: string;
  canWrite: boolean;
  onClose: () => void;
  onWrite: () => void;
  onRead: () => void;
  onAwaken: () => void;
};

export function NftModal({
  nft,
  referenceImage,
  canWrite,
  onClose,
  onWrite,
  onRead,
  onAwaken,
}: Props) {
  const metrics: Array<[string, string | number]> = [
    ["Token ID", nft.tokenId],
    ["Minted by", nft.minter],
    ["Floor ATH", `${nft.floorAth.toFixed(1)} MON`],
    ["Current floor", `${nft.floorNow.toFixed(1)} MON`],
    ["Trades (30d)", nft.trades],
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
        className="detail-modal is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-shell">
          <button
            className="close-button"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
          <div className={`modal-art ${nft.status}`}>
            {referenceImage && (
              <img
                className="reference-image"
                src={referenceImage}
                alt=""
              />
            )}
            <Creature nft={nft} large />
          </div>
          <div className="modal-body">
            <p className="kicker">
              {statusPill(nft.status)} / health score{" "}
              {nft.score}
            </p>
            <h2 id="modal-title">
              {nft.name} #{String(nft.id).padStart(3, "0")}
            </h2>
            <p>
              Grown from floor resilience, trade pulse,
              holder spread, and rarity signals.
            </p>
            <dl className="metric-grid">
              {metrics.map(([label, value]) => (
                <div key={String(label)}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="modal-actions">
              <button
                className="primary-button"
                type="button"
                disabled={!canWrite}
                title={
                  canWrite
                    ? "Store health check-in on-chain"
                    : "Connect owner wallet to write"
                }
                onClick={onWrite}
              >
                Write check-in
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={onRead}
              >
                Read on-chain
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={onAwaken}
              >
                Awaken creature
              </button>
            </div>
            <div className="reason-box">
              <h3>Why this score?</h3>
              <p>{buildReason(nft)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
