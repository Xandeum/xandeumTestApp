'use client';
import React, { FC, useEffect, useRef, useState } from 'react';

import { useWallet } from '@solana/wallet-adapter-react';

import Loader from 'components/Loader';
import { PROGRAM } from 'CONSTS';
import { notify } from 'utils/notifications';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

import dynamic from 'next/dynamic';

export const HomeView: FC = ({ }) => {

  const wallet = useWallet();
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  // const { connection } = useConnection();

  const [isBigBangProcessing, setIsBigBangProcessing] = useState<boolean>(false);
  const [isArmageddonProcessing, setIsArmageddonProcessing] = useState<boolean>(false);

  const [txId, setTxId] = useState<string>('');


  //function related to bigBang
  const onBigBang = async () => {
    try {
      setIsBigBangProcessing(true);

      if (!wallet?.connected || !wallet?.publicKey) {
        notify({ type: 'error', message: 'Error!', description: `Please connect your wallet first` });
        setIsBigBangProcessing(false);
        return;
      }

      const keys = [
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        }

      ];

      const fsIdBuffer = Buffer.alloc(8);
      // Write the fsId string into the buffer using UTF-8 encoding
      const fsId = 'bigBang';
      fsIdBuffer.write(fsId, 'utf8');

      const data = Buffer.concat([
        Buffer.from(Int8Array.from([0]).buffer),
        fsIdBuffer,
      ]);


      const txIx = new TransactionInstruction({
        keys: keys,
        programId: PROGRAM,
        data: data,
      });

      const transaction = new Transaction().add(txIx);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext('confirmed');

      // transaction.recentBlockhash = blockhash;
      // transaction.feePayer = wallet.publicKey;
      // wallet.signTransaction(transaction);

      // const simulate = await connection.simulateTransaction(transaction);
      // console.log("simulate >>> ", simulate);
      // return;

      const tx = await wallet?.sendTransaction(transaction, connection, {
        minContextSlot,
        skipPreflight: true,
        preflightCommitment: 'processed'
      });

      setTxId(tx);

      //wait for 3 seconds
      await new Promise((resolve) => setTimeout(resolve
        , 3000));

      const confirmTx = await connection?.getSignatureStatuses([tx], { searchTransactionHistory: true });

      // Check if the transaction has a status
      const status = confirmTx?.value[0];
      if (!status) {
        notify({ type: 'error', message: 'Error!', description: 'Transaction status not found!' });
        setIsBigBangProcessing(false);
        return;
      }

      // Check if the transaction failed
      if (status?.err) {
        notify({ type: 'error', message: 'Transaction failed!', description: 'Custom program error', txid: tx });
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
      setIsArmageddonProcessing(true);

      if (!wallet?.connected || !wallet?.publicKey) {
        notify({ type: 'error', message: 'Error!', description: `Please connect your wallet first` });
        setIsArmageddonProcessing(false);
        return;
      }

      const keys = [
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        }

      ];

      const fsIdBuffer = Buffer.alloc(8);
      // Write the fsId string into the buffer using UTF-8 encoding
      const fsId = 'bigBang';
      fsIdBuffer.write(fsId, 'utf8');

      const data = Buffer.concat([
        Buffer.from(Int8Array.from([1]).buffer), // 1 for armageddon
        fsIdBuffer,
      ]);


      const txIx = new TransactionInstruction({
        keys: keys,
        programId: PROGRAM,
        data: data,
      });

      const transaction = new Transaction().add(txIx);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext('confirmed');

      // transaction.recentBlockhash = blockhash;
      // transaction.feePayer = wallet.publicKey;
      // wallet.signTransaction(transaction);

      // const simulate = await connection.simulateTransaction(transaction);
      // console.log("simulate >>> ", simulate);
      // return;

      const tx = await wallet?.sendTransaction(transaction, connection, {
        minContextSlot,
        skipPreflight: true,
        preflightCommitment: 'processed'
      });

      setTxId(tx);

      //wait for 3 seconds
      await new Promise((resolve) => setTimeout(resolve
        , 3000));

      const confirmTx = await connection?.getSignatureStatuses([tx], { searchTransactionHistory: true });

      // Check if the transaction has a status
      const status = confirmTx?.value[0];
      if (!status) {
        notify({ type: 'error', message: 'Error!', description: 'Transaction status not found!' });
        setIsArmageddonProcessing(false);
        return;
      }

      // Check if the transaction failed
      if (status?.err) {
        notify({ type: 'error', message: 'Transaction failed!', description: 'Custom program error', txid: tx });
        setIsArmageddonProcessing(false);
        return;
      }


    } catch (error) {
      console.log("error while armageddon >>>", error);
      setIsArmageddonProcessing(false);
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
