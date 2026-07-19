import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import {
  fetchDemoGarden,
  fetchGarden,
  fetchGardenNft,
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
import {
  readNftContract,
  type OnchainNftRead,
} from "../chain/nft";
import { isContractConfigured } from "../chain/wallet";
import {
  DEMO_COLLECTION,
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
  const [walletInput, setWalletInput] = useState(DEMO_COLLECTION);
  const [contractInput, setContractInput] =
    useState(DEMO_COLLECTION);
  const [tokenInput, setTokenInput] = useState("3");
  const [nfts, setNfts] = useState(() =>
    makeCollection(DEMO_COLLECTION),
  );
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] =
    useState<NftHealth | null>(null);
  const [referenceImage, setReferenceImage] = useState(
    "/assets/featured-specimen.png",
  );
  const [chain, setChain] = useState<ChainState>(emptyChain);
  const [networkKey, setNetworkKey] =
    useState<MonadNetworkKey>(() =>
      new URLSearchParams(window.location.search).get("network") ===
      "mainnet"
        ? "mainnet"
        : "testnet",
    );
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState("demo");
  const [apiNote, setApiNote] = useState("");
  const [nftRead, setNftRead] = useState<{
    loading: boolean;
    data: OnchainNftRead | null;
    error: string;
  }>({ loading: false, data: null, error: "" });

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

  const passportConfigured = isContractConfigured(networkKey);
  const canWriteCheckIn =
    passportConfigured &&
    ethers.isAddress(contractInput) &&
    Boolean(chain.account);

  const chainIdNum = chainIdFor(networkKey);

  const applyGardenResult = useCallback(
    (result: Awaited<ReturnType<typeof fetchGarden>>) => {
      setNfts(result.nfts);
      setDataSource(result.source);
      const requestedToken = new URLSearchParams(
        window.location.search,
      ).get("nft");
      setSelected(
        requestedToken
          ? result.nfts.find(
              (nft) => String(nft.tokenId) === requestedToken,
            ) || null
          : null,
      );

      const firstCol = result.nfts[0]?.collection;
      if (firstCol && ethers.isAddress(firstCol)) {
        setContractInput(firstCol);
      }
      if (result.nfts[0]?.tokenId !== undefined) {
        setTokenInput(String(result.nfts[0].tokenId));
      }

      setChain((cur) => ({
        ...cur,
        onchainScore: "",
        txHash: "",
        status:
          result.source === "mock"
            ? "Demo garden loaded. Search reads stay live."
            : "Live NFT data verified from Monad.",
      }));
      setApiNote(result.limitations?.[0] || "");
    },
    [],
  );

  const loadDemo = useCallback(async () => {
    setLoading(true);
    setApiNote("");
    try {
      const result = await fetchDemoGarden(
        DEMO_COLLECTION,
        10143,
      );
      applyGardenResult(result);
    } catch {
      setNfts(makeCollection(DEMO_COLLECTION));
      setDataSource("demo-local");
      setApiNote("Local demo garden. Search reads stay live.");
    } finally {
      setLoading(false);
    }
  }, [applyGardenResult]);

  const loadLiveNft = useCallback(
    async (collection: string, tokenId: string) => {
      setLoading(true);
      setApiNote("");
      try {
        const result = await fetchGardenNft(
          collection,
          tokenId,
          chainIdNum,
        );
        applyGardenResult(result);
      } catch (error) {
        setNfts([]);
        setDataSource("live-error");
        setSelected(null);
        const msg =
          error instanceof Error ? error.message : "error";
        setChain((cur) => ({
          ...cur,
          onchainScore: "",
          txHash: "",
          status: `Live NFT read failed: ${msg}`,
        }));
        setApiNote(msg);
      } finally {
        setLoading(false);
      }
    },
    [applyGardenResult, chainIdNum],
  );

  const loadWalletGarden = useCallback(
    async (wallet: string) => {
      setLoading(true);
      setApiNote("");
      try {
        const result = await fetchGarden(wallet, chainIdNum);
        applyGardenResult(result);
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "error";
        setNfts([]);
        setDataSource("live-error");
        setSelected(null);
        setApiNote(msg);
        setChain((cur) => ({
          ...cur,
          status: `Wallet index failed: ${msg}`,
        }));
      } finally {
        setLoading(false);
      }
    },
    [applyGardenResult, chainIdNum],
  );

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const collection = query.get("collection");
    const token = query.get("token");
    if (collection && token) {
      setContractInput(collection);
      setTokenInput(token);
      void loadLiveNft(collection, token);
      return;
    }
    void loadDemo();
  }, [loadDemo, loadLiveNft]);

  async function handleConnect() {
    try {
      const next = await connectAndLoadOwner(networkKey);
      setChain((cur) => ({ ...cur, ...next }));
      setWalletInput(next.account);
      void loadWalletGarden(next.account);
      return true;
    } catch (error) {
      setChain((cur) => ({
        ...cur,
        status:
          error instanceof Error
            ? error.message
            : "Wallet connection failed",
      }));
      return false;
    }
  }

  async function handleRead(nft: NftHealth) {
    try {
      const collection = nft.collection || contractInput;
      if (!ethers.isAddress(collection)) {
        throw new Error(
          "Collection must be a full 0x address.",
        );
      }
      const text = await readCheckIn(
        collection,
        nft,
        networkKey,
      );
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
      const collection = nft.collection || contractInput;
      if (!ethers.isAddress(collection)) {
        throw new Error(
          "Collection must be a full 0x address.",
        );
      }
      setChain((cur) => ({
        ...cur,
        status: "Transaction submitted",
      }));
      const hash = await writeCheckIn({
        collection,
        nft,
        networkKey,
      });
      await loadLiveNft(collection, String(nft.tokenId));
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

  async function handleNftContractRead(nft: NftHealth) {
    const collection = nft.collection || contractInput;
    if (!ethers.isAddress(collection)) {
      setNftRead({
        loading: false,
        data: null,
        error: "Enter a valid NFT collection address first.",
      });
      return;
    }

    setNftRead({ loading: true, data: null, error: "" });
    try {
      const data = await readNftContract(
        collection,
        nft.tokenId,
        networkKey,
      );
      setNftRead({ loading: false, data, error: "" });
    } catch (error) {
      setNftRead({
        loading: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "NFT contract read failed.",
      });
    }
  }

  function selectNft(nft: NftHealth | null) {
    setNftRead({ loading: false, data: null, error: "" });
    setSelected(nft);
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
        status: "Queueing creature generation...",
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
        void loadLiveNft(collection, String(nft.tokenId));
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
    tokenInput,
    setTokenInput,
    nfts,
    filter,
    setFilter,
    selected,
    setSelected: selectNft,
    nftRead,
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
    passportConfigured,
    loadDemo,
    loadLiveNft,
    loadWalletGarden,
    handleConnect,
    handleRead,
    handleWrite,
    handleAwaken,
    handleNftContractRead,
    handleImage,
    apiBase: getApiBase(),
  };
}
