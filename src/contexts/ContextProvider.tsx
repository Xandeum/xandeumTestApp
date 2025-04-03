import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { Cluster, clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { notify } from "../utils/notifications";
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';
import dynamic from "next/dynamic";

const ReactUIWalletModalProviderDynamic = dynamic(
    async () =>
        (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
    { ssr: false }
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();
    const { networkConfiguration } = useNetworkConfiguration();
    const network = networkConfiguration as WalletAdapterNetwork;
    let endpoint = useMemo(() => clusterApiUrl(network), [network]);

    if (network === WalletAdapterNetwork.Devnet) {
        // endpoint = "https://devnet.helius-rpc.com/?api-key=2aca1e9b-9f51-44a0-938b-89dc6c23e9b4";
        endpoint = "http://8.52.151.4:8899";
    }
    if (network === WalletAdapterNetwork.Mainnet) {
        // endpoint = "https://red-yolo-mountain.solana-mainnet.quiknode.pro/174b836a161a7cafc760c335f3930638cf9f19ec/";
        endpoint = "https://rpc.helius.xyz/?api-key=2aca1e9b-9f51-44a0-938b-89dc6c23e9b4";
        // endpoint = "https://solana-mainnet.g.alchemy.com/v2/tEJrU0zUSsVQBDrV87jEi5hu0Bn388aW";
    }

    const wallets = useMemo(
        () => [
        ],
        []
    );

    const onError = useCallback(
        (error: WalletError) => {
            if (error.message.includes("User rejected the request")) {
                console.warn("User rejected the transaction.");
                notify({ type: 'error', message: "You rejected the transaction. Please try again if needed." });
                return;
            } else {
                // Log other unexpected errors
                console.error("An unexpected error occurred:", error);

            }
            // notify({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
            // console.error(error);
        },
        []
    );

    return (
        // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
                <ReactUIWalletModalProviderDynamic>
                    {children}
                </ReactUIWalletModalProviderDynamic>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <NetworkConfigurationProvider>
                <AutoConnectProvider>
                    <WalletContextProvider>{children}</WalletContextProvider>
                </AutoConnectProvider>
            </NetworkConfigurationProvider >
        </>
    );
};
