import type { CSSProperties } from "react";
import type { NftHealth, Status } from "../types";
import { PLOT_SLOTS } from "../constants";
import { statusPill } from "../lib/format";
import { Creature } from "./Creature";

type Props = {
  nfts: NftHealth[];
  visible: NftHealth[];
  filter: Status | "all";
  onFilter: (value: Status | "all") => void;
  walletPreview: string;
  onSelect: (nft: NftHealth) => void;
  loading: boolean;
};

const FILTERS: Array<Status | "all"> = [
  "all",
  "alive",
  "watch",
  "dead",
];

function filterLabel(item: Status | "all") {
  if (item === "all") return "All";
  if (item === "alive") return "Sprout";
  if (item === "watch") return "Watch";
  return "Dormant";
}

export function GardenGrid({
  nfts,
  visible,
  filter,
  onFilter,
  walletPreview,
  onSelect,
  loading,
}: Props) {
  return (
    <div className="garden-wrap">
      <div className="garden-toolbar">
        <div>
          <h2>The garden</h2>
          <p>
            {nfts.length} creatures seeded from {walletPreview}...
          </p>
        </div>
        <div
          className="filter-group"
          role="group"
          aria-label="Filter NFTs"
        >
          {FILTERS.map((item) => (
            <button
              key={item}
              className={`filter ${filter === item ? "is-active" : ""}`}
              type="button"
              onClick={() => onFilter(item)}
            >
              {filterLabel(item)}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`garden garden-world ${loading ? "is-loading" : ""}`}
        aria-busy={loading}
        aria-live="polite"
      >
        {loading && (
          <div className="garden-loading">
            <span />
            <strong>Reading the garden</strong>
          </div>
        )}
        {!loading && visible.length === 0 && (
          <div className="garden-empty">
            <strong>No creatures in this bed.</strong>
            <span>Choose another health filter.</span>
          </div>
        )}
        {visible.map((nft) => {
          const slot =
            PLOT_SLOTS[(nft.id - 1) % PLOT_SLOTS.length];
          const style = {
            "--x": `${slot[0]}%`,
            "--y": `${slot[1]}%`,
          } as CSSProperties;

          return (
            <article
              className={`plot ${nft.status}`}
              key={nft.id}
              style={style}
            >
              <Creature nft={nft} useSprite />
              <button
                className="plot-button"
                type="button"
                aria-label={`Inspect ${nft.name}`}
                onClick={() => onSelect(nft)}
              >
                <span className="nft-meta">
                  <span>
                    <strong>{nft.name}</strong>
                    <span>
                      #{String(nft.id).padStart(3, "0")} /
                      score {nft.score}
                    </span>
                  </span>
                  <span className="status-pill">
                    {statusPill(nft.status)}
                  </span>
                </span>
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
