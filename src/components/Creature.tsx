import type { CSSProperties } from "react";
import type { NftHealth } from "../types";

type Props = {
  nft: NftHealth;
  large?: boolean;
  useSprite?: boolean;
};

export function Creature({
  nft,
  large = false,
  useSprite = false,
}: Props) {
  const glow =
    nft.status === "alive"
      ? "34px"
      : nft.status === "watch"
        ? "12px"
        : "0px";

  const glowColor =
    nft.status === "alive"
      ? `${nft.colors[0]}66`
      : nft.status === "watch"
        ? "#f3c45b55"
        : "transparent";

  const spriteId = String(((nft.id - 1) % 20) + 1).padStart(
    2,
    "0",
  );
  const overlayOffset =
    nft.status === "alive"
      ? 0
      : nft.status === "watch"
        ? 3
        : 6;
  const overlayId = String(
    overlayOffset + ((nft.id - 1) % 3) + 1,
  ).padStart(2, "0");

  const spriteSrc =
    nft.spriteUrl ||
    `/assets/creatures/creature-${spriteId}.png`;

  const style = {
    "--size": `${large ? nft.size * 1.7 : nft.size}px`,
    "--tilt": `${nft.tilt}deg`,
    "--c1": nft.colors[0],
    "--c2": nft.colors[1],
    "--glow": glow,
    "--glow-color": glowColor,
  } as CSSProperties;

  return (
    <>
      <div className="pedestal" />
      <div
        className={`creature ${useSprite ? "use-sprite" : ""}`}
        style={style}
      >
        {useSprite && (
          <img
            className="creature-sprite"
            src={spriteSrc}
            alt=""
          />
        )}
        {useSprite && (
          <img
            className="health-overlay"
            src={`/assets/overlays/health-${overlayId}.png`}
            alt=""
          />
        )}
        <span className="creature-leaf" aria-hidden="true" />
        <span className="creature-face" aria-hidden="true">
          <span className="creature-eye" />
          <span className="creature-eye" />
          <span className="creature-mouth" />
        </span>
      </div>
    </>
  );
}
