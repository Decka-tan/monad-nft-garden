import type { FormEvent } from "react";
import { Topbar } from "./components/Topbar";
import { Hero } from "./components/Hero";
import { ControlPanel } from "./components/ControlPanel";
import { GardenGrid } from "./components/GardenGrid";
import { NftModal } from "./components/NftModal";
import { useGardenApp } from "./hooks/useGardenApp";

export default function App() {
  const app = useGardenApp();

  function onAnalyze(event: FormEvent) {
    event.preventDefault();
    void app.loadGarden(
      app.walletInput,
      app.contractInput,
    );
  }

  return (
    <main className="shell">
      <Topbar
        networkKey={app.networkKey}
        onNetwork={app.setNetworkKey}
        account={app.chain.account}
        onConnect={() => void app.handleConnect()}
      />

      <Hero
        walletInput={app.walletInput}
        onWalletChange={app.setWalletInput}
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
      />

      <section
        className="workspace garden-first"
        aria-label="NFT sandbox"
      >
        <ControlPanel
          chain={app.chain}
          contractInput={app.contractInput}
          onContractChange={app.setContractInput}
          referenceImage={app.referenceImage}
          onImage={app.handleImage}
          apiBase={app.apiBase}
        />
        <GardenGrid
          nfts={app.nfts}
          visible={app.visible}
          filter={app.filter}
          onFilter={app.setFilter}
          walletPreview={app.walletInput.slice(0, 10)}
          onSelect={app.setSelected}
        />
      </section>

      {app.selected && (
        <NftModal
          nft={app.selected}
          referenceImage={app.referenceImage}
          canWrite={app.canWriteCheckIn}
          onClose={() => app.setSelected(null)}
          onWrite={() =>
            void app.handleWrite(app.selected!)
          }
          onRead={() => void app.handleRead(app.selected!)}
          onAwaken={() =>
            void app.handleAwaken(app.selected!)
          }
        />
      )}
    </main>
  );
}
