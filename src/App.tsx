import { useRef, useState, type FormEvent } from "react";
import type { NftHealth } from "./types";
import { Topbar } from "./components/Topbar";
import { Hero } from "./components/Hero";
import { ControlPanel } from "./components/ControlPanel";
import { GardenGrid } from "./components/GardenGrid";
import { NftModal } from "./components/NftModal";
import { LandingPage } from "./components/LandingPage";
import { GardenMotion } from "./components/MotionDirector";
import { useGardenApp } from "./hooks/useGardenApp";

export default function App() {
  const app = useGardenApp();
  const gardenRootRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(() =>
    new URLSearchParams(window.location.search).has("garden"),
  );

  function onAnalyze(event: FormEvent) {
    event.preventDefault();
    const query = new URLSearchParams(window.location.search);
    query.set("garden", "1");
    query.set("network", app.networkKey);
    query.set("collection", app.contractInput);
    query.set("token", app.tokenInput);
    query.delete("nft");
    window.history.replaceState(null, "", `?${query}`);
    void app.loadLiveNft(
      app.contractInput,
      app.tokenInput,
    );
  }

  async function connectAndEnter() {
    const connected = await app.handleConnect();
    if (connected) enterGarden();
  }

  function enterGarden() {
    window.history.replaceState(null, "", "?garden=1");
    setEntered(true);
  }

  function leaveGarden() {
    window.history.replaceState(
      null,
      "",
      window.location.pathname,
    );
    setEntered(false);
  }

  function selectNft(nft: NftHealth) {
    const query = new URLSearchParams(window.location.search);
    query.set("garden", "1");
    query.set("nft", String(nft.tokenId));
    window.history.replaceState(null, "", `?${query}`);
    app.setSelected(nft);
  }

  function closeNft() {
    const query = new URLSearchParams(window.location.search);
    query.delete("nft");
    window.history.replaceState(null, "", `?${query}`);
    app.setSelected(null);
  }

  if (!entered) {
    return (
      <LandingPage
        onDemo={enterGarden}
        onConnect={() => void connectAndEnter()}
        walletStatus={app.chain.status}
      />
    );
  }

  return (
    <main className="garden-app" ref={gardenRootRef}>
      <GardenMotion root={gardenRootRef} />
      <Topbar
        networkKey={app.networkKey}
        onNetwork={app.setNetworkKey}
        account={app.chain.account}
        onConnect={() => void app.handleConnect()}
        onHome={leaveGarden}
      />

      <Hero
        collectionInput={app.contractInput}
        onCollectionChange={app.setContractInput}
        tokenInput={app.tokenInput}
        onTokenChange={app.setTokenInput}
        loading={app.loading}
        onAnalyze={onAnalyze}
        counts={app.counts}
        apiNote={app.apiNote}
        portfolioScore={app.portfolioScore}
        topAth={app.topAth}
        avgFloor={app.avgFloor}
        holders={app.holders}
        lastTrade={app.lastTrade}
        dataSource={app.dataSource}
        nftCount={app.nfts.length}
        networkKey={app.networkKey}
      />

      <section
        className="garden-workspace"
        aria-label="NFT sandbox"
      >
        <GardenGrid
          nfts={app.nfts}
          visible={app.visible}
          filter={app.filter}
          onFilter={app.setFilter}
          walletPreview={app.contractInput.slice(0, 10)}
          onSelect={selectNft}
          loading={app.loading}
        />
        <ControlPanel
          chain={app.chain}
          dataSource={app.dataSource}
          networkKey={app.networkKey}
        />
      </section>

      {app.selected && (
        <NftModal
          nft={app.selected}
          canRead={app.passportConfigured}
          canWrite={
            app.canWriteCheckIn &&
            Boolean(app.selected.owner) &&
            app.chain.account.toLowerCase() ===
              app.selected.owner?.toLowerCase()
          }
          onClose={closeNft}
          onWrite={() =>
            void app.handleWrite(app.selected!)
          }
          onRead={() => void app.handleRead(app.selected!)}
          onReadNft={() =>
            void app.handleNftContractRead(app.selected!)
          }
          nftRead={app.nftRead}
        />
      )}
    </main>
  );
}
