import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import {
  fetchGarden,
  fetchGardenCollection,
  queueCreature,
} from "../api/garden";
import { getApiBase } from "../api/client";
import {
  chainIdFor,
  type MonadNetworkKey,
} from "../chain/config";
import {
  connectAndLoadOwner,
  readCheckIn,
  writeCheckIn,
} from "../chain/passport";
import { isContractConfigured } from "../chain/wallet";
import {
  DEMO_COLLECTION,
  DEMO_WALLET,
} from "../constants";
import { makeCollection } from "../garden/mockCollection";
import type { ChainState, NftHealth, Status } from "../types";

const emptyChain: ChainState = {
  account: "",
  chainId: "",
  owner: "",
  txHash: "",
  onchainScore: "",
  status: "Wallet not connected",
};

export function useGardenApp() {
  const [walletInput, setWalletInput] = useState(DEMO_WALLET);
  const [contractInput, setContractInput] =
    useState(DEMO_COLLECTION);
  const [nfts, setNfts] = useState(() =>
    makeCollection(DEMO_WALLET),
  );
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] =
    useState<NftHealth | null>(null);
  const [referenceImage, setReferenceImage] = useState(
    "/assets/featured-specimen.png",
  );
  const [chain, setChain] = useState<ChainState>(emptyChain);
  const [networkKey, setNetworkKey] =
    useState<MonadNetworkKey>("testnet");
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState("local-mock");
  const [apiNote, setApiNote] = useState("");

  const visible = useMemo(
    () =>
      nfts.filter(
        (nft) => filter === "all" || nft.status === filter,
      ),
    [filter, nfts],
  );

  const counts = useMemo(() => {
    const next = { alive: 0, watch: 0, dead: 0 };
    for (const nft of nfts) next[nft.status] += 1;
    return next;
  }, [nfts]);

  const portfolioScore = useMemo(() => {
    if (!nfts.length) return 0;
    const sum = nfts.reduce((s, n) => s + n.score, 0);
    return Math.round(sum / nfts.length);
  }, [nfts]);

  const topAth = useMemo(
    () => Math.max(...nfts.map((n) => n.floorAth), 0),
    [nfts],
  );

  const avgFloor = useMemo(() => {
    if (!nfts.length) return 0;
    return (
      nfts.reduce((s, n) => s + n.floorNow, 0) / nfts.length
    );
  }, [nfts]);

  const holders = useMemo(
    () => nfts.reduce((s, n) => s + n.holders, 0),
    [nfts],
  );

  const lastTrade = Math.max(8, 90 - (nfts[0]?.trades || 0));

  const canWriteCheckIn =
    isContractConfigured() &&
    ethers.isAddress(contractInput) &&
    Boolean(chain.account) &&
    Boolean(chain.owner) &&
    !chain.owner.startsWith("Deploy contract") &&
    chain.account.toLowerCase() ===
      chain.owner.toLowerCase();

  const chainIdNum = chainIdFor(networkKey);

  const loadGarden = useCallback(
    async (seedWallet: string, seedCollection: string) => {
      setLoading(true);
      setApiNote("");
      try {
        const onlyCollection =
          ethers.isAddress(seedCollection) &&
          seedCollection !== DEMO_COLLECTION &&
          !seedWallet.trim();

        const result = onlyCollection
          ? await fetchGardenCollection(
              seedCollection,
              chainIdNum,
            )
          : await fetchGarden(
              seedWallet.trim() ||
                seedCollection.trim() ||
                DEMO_WALLET,
              chainIdNum,
            );

        setNfts(result.nfts);
        setDataSource(result.source);
        setSelected(null);

        const firstCol = result.nfts[0]?.collection;
        if (firstCol && ethers.isAddress(firstCol)) {
          setContractInput(firstCol);
        }

        setChain((cur) => ({
          ...cur,
          onchainScore: "",
          txHash: "",
          status: `API analysis (${result.source}) via ${getApiBase()}`,
        }));

        if (result.limitations?.length) {
          setApiNote(result.limitations[0]);
        }
      } catch (error) {
        const seed =
          seedWallet.trim() ||
          seedCollection.trim() ||
          "monad-demo-wallet";
        setNfts(makeCollection(seed));
        setDataSource("local-fallback");
        setSelected(null);
        const msg =
          error instanceof Error ? error.message : "error";
        setChain((cur) => ({
          ...cur,
          onchainScore: "",
          txHash: "",
          status: `API offline — local mock (${msg})`,
        }));
        setApiNote(
          "Garden API unreachable; showing local mock.",
        );
      } finally {
        setLoading(false);
      }
    },
    [chainIdNum],
  );

  useEffect(() => {
    void loadGarden(DEMO_WALLET, DEMO_COLLECTION);
  }, [loadGarden]);

  async function handleConnect() {
    try {
      const next = await connectAndLoadOwner(networkKey);
      setChain((cur) => ({ ...cur, ...next }));
      setWalletInput(next.account);
      void loadGarden(next.account, contractInput);
    } catch (error) {
      setChain((cur) => ({
        ...cur,
        status:
          error instanceof Error
            ? error.message
            : "Wallet connection failed",
      }));
    }
  }

  async function handleRead(nft: NftHealth) {
    try {
      if (!ethers.isAddress(contractInput)) {
        throw new Error(
          "Collection must be a full 0x address.",
        );
      }
      const text = await readCheckIn(contractInput, nft);
      setChain((cur) => ({
        ...cur,
        onchainScore: text,
        status: "Read check-in from contract",
      }));
    } catch (error) {
      setChain((cur) => ({
        ...cur,
        status:
          error instanceof Error
            ? error.message
            : "Read failed",
      }));
    }
  }

  async function handleWrite(nft: NftHealth) {
    try {
      if (!ethers.isAddress(contractInput)) {
        throw new Error(
          "Collection must be a full 0x address.",
        );
      }
      setChain((cur) => ({
        ...cur,
        status: "Transaction submitted",
      }));
      const hash = await writeCheckIn({
        collection: contractInput,
        nft,
        networkKey,
        owner: chain.owner,
      });
      setChain((cur) => ({
        ...cur,
        txHash: hash,
        status: "Check-in confirmed on-chain",
      }));
    } catch (error) {
      setChain((cur) => ({
        ...cur,
        status:
          error instanceof Error
            ? error.message
            : "Write failed",
      }));
    }
  }

  async function handleAwaken(nft: NftHealth) {
    try {
      const collection = nft.collection || contractInput;
      if (!ethers.isAddress(collection)) {
        throw new Error(
          "Need a full collection 0x address.",
        );
      }
      setChain((cur) => ({
        ...cur,
        status: "Queueing creature generation…",
      }));
      const result = await queueCreature({
        chainId: chainIdNum,
        collection,
        tokenId: nft.tokenId,
        persona: `${nft.name} in the Monad garden`,
      });
      const st = result.creature?.status || "queued";
      setChain((cur) => ({
        ...cur,
        status: `Creature ${st} (API, no on-chain inject)`,
      }));
      window.setTimeout(() => {
        void loadGarden(walletInput, contractInput);
      }, 1000);
    } catch (error) {
      setChain((cur) => ({
        ...cur,
        status:
          error instanceof Error
            ? error.message
            : "Creature queue failed",
      }));
    }
  }

  function handleImage(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setReferenceImage(String(reader.result));
    });
    reader.readAsDataURL(file);
  }

  return {
    walletInput,
    setWalletInput,
    contractInput,
    setContractInput,
    nfts,
    filter,
    setFilter,
    selected,
    setSelected,
    referenceImage,
    chain,
    networkKey,
    setNetworkKey,
    loading,
    dataSource,
    apiNote,
    visible,
    counts,
    portfolioScore,
    topAth,
    avgFloor,
    holders,
    lastTrade,
    canWriteCheckIn,
    loadGarden,
    handleConnect,
    handleRead,
    handleWrite,
    handleAwaken,
    handleImage,
    apiBase: getApiBase(),
  };
}
