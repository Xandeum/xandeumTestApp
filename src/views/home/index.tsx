'use client';
import React, { FC, useEffect, useRef, useState } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import xandeumLogo from "../../assets/XandeumLogoStandard.png"

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { LinearProgress } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import confetti from 'canvas-confetti';

import Loader from 'components/Loader';
import { CURRENT_ERA, MAX_PNODES, MAX_PNODES_PER_WALLET, PNODE_DISCOUNT_PRICE, PNODE_PRICE, PROGRAM, TREASURY, XANDMint } from 'CONSTS';
import { notify } from 'utils/notifications';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import dynamic from 'next/dynamic';
import { markCodeUsed, verifyCode } from 'services/discountCodeService';
import { updatePurchases } from 'services/purchaseService';
import { BN } from '@project-serum/anchor';
import { getGlobalAccountData, getPnodeOwnerAccountData } from 'helpers/pNodeHelpers';
import Image from 'next/image';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const HomeView: FC = ({ }) => {

  const wallet = useWallet();
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  // const { connection } = useConnection();
  const [dataReadError, setDataReadError] = useState<boolean>(false);
  const [isBigBangProcessing, setIsBigBangProcessing] = useState<boolean>(false);
  const [isArmageddonProcessing, setIsArmageddonProcessing] = useState<boolean>(false);
  const [showPopupPurchase, setShowPopupPurchase] = useState<boolean>(false);
  const [txId, setTxId] = useState<string>('');
  const timerRef = useRef(null); // Ref to store the timer ID

  //read global account data
  useEffect(() => {


  }, [wallet])

  //function related to bigBang
  const onBigBang = async () => {
    try {
      setIsBigBangProcessing(true);

      if (!wallet?.connected || !wallet?.publicKey) {
        notify({ type: 'error', message: 'Error!', description: `Please connect your wallet first` });
        setIsBigBangProcessing(false);
        return;
      }


    } catch (error) {
      console.log("error while bigbang >>>", error);
      setIsBigBangProcessing(false);
      return;
    }
  }

  //function related to armageddon
  const onArmageddon = async () => {
    try {
      setIsBigBangProcessing(true);

      if (!wallet?.connected || !wallet?.publicKey) {
        notify({ type: 'error', message: 'Error!', description: `Please connect your wallet first` });
        setIsBigBangProcessing(false);
        return;
      }


    } catch (error) {
      console.log("error while armageddon >>>", error);
      setIsBigBangProcessing(false);
      return;
    }
  }

  return (
    <div className="container flex mx-auto flex-col items-center w-full max-w-4xl p-4 mb-10">


      <h2 className="text-3xl font-medium text-white md:leading-tight  my-5">Test App</h2>


      <div className='flex flex-col gap-8 bg-tiles border-xnd w-full text-white p-5  mt-8 relative md:mb-0 mb-28 text-base'>
        {/* <div className="absolute -inset-2 -z-10 bg-gradient-to-r from-[#fda31b] via-[#622657] to-[#198476] border-xnd blur  "></div> */}



        <button type="button" className="btn bg-[#D98C18] hover:bg-[#fda31b] border-xnd border-none px-6 text-lg group flex p-2 gap-2 items-center justify-center self-center border-xnd font-normal focus:outline-none text-white disabled:bg-opacity-50 disabled:opacity-50 w-fit min-w-[14rem]"
          onClick={onBigBang}
          disabled={isBigBangProcessing || !wallet?.connected || !wallet?.publicKey}
        >
          {
            isBigBangProcessing ?
              <Loader />
              :
              <span className="block group-disabled:hidden normal-case" >
                bigBang
              </span>
          }
          <div className="hidden group-disabled:block normal-case">
            bigBang
          </div>
        </button>

        <button type="button" className="btn bg-[#D98C18] hover:bg-[#fda31b] border-xnd border-none px-6 text-lg group flex p-2 gap-2 items-center justify-center self-center border-xnd font-normal focus:outline-none text-white disabled:bg-opacity-50 disabled:opacity-50 w-fit min-w-[14rem]"
          onClick={onArmageddon}
          disabled={isArmageddonProcessing || !wallet?.connected || !wallet?.publicKey}
        >
          {
            isArmageddonProcessing ?
              <Loader />
              :
              <span className="block group-disabled:hidden normal-case" >
                armageddon
              </span>
          }
          <div className="hidden group-disabled:block normal-case">
            armageddon
          </div>
        </button>

      </div>

    </div>
  );
};
