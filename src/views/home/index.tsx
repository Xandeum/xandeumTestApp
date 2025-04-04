'use client';
import React, { FC, useEffect, useRef, useState } from 'react';

import { useWallet } from '@solana/wallet-adapter-react';

import Loader from 'components/Loader';
import { PROGRAM } from 'CONSTS';
import { notify } from 'utils/notifications';
import { ComputeBudgetProgram, Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

import { walletKeypair } from 'helpers/keypair';

import dynamic from 'next/dynamic';
import { getTransactionStatus } from 'components/GetTransactionStatus';
import { BN } from '@project-serum/anchor';

export const HomeView: FC = ({ }) => {

  // const wallet = useWallet();
  const wallet = Keypair.fromSecretKey(Uint8Array.from(walletKeypair.privateKey));

  const connection = new Connection('http://8.52.151.4:8899', 'confirmed');
  // const { connection } = useConnection();

  const [isBigBangProcessing, setIsBigBangProcessing] = useState<boolean>(false);
  const [isArmageddonProcessing, setIsArmageddonProcessing] = useState<boolean>(false);

  const [txId, setTxId] = useState<string>('');
  const [fsId, setFsId] = useState<string>('');


  //function related to bigBang(insert)
  const onBigBang = async () => {
    try {
      setIsBigBangProcessing(true);



      // if (!wallet?.connected || !wallet?.publicKey) {
      //   notify({ type: 'error', message: 'Error!', description: `Please connect your wallet first` });
      //   setIsBigBangProcessing(false);
      //   return;
      // }



      const keys = [
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        }

      ];

      const data = Buffer.concat([
        Buffer.from(Int8Array.from([0]).buffer)
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

      transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 3000000 }));
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      transaction.sign(wallet);

      const tx = await connection.sendRawTransaction(transaction.serialize());

      setTxId(tx);



      console.log("tx id >>> ", tx)
      const ws = new WebSocket('ws://8.52.151.4:8900');

      // check websocket connection
      ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');
      });

      ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');

        const subscriptionMessage = {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "xandeumResultSubscribe",
          "params": [tx, { "commitment": "finalized" }]
        };

        ws.send(JSON.stringify(subscriptionMessage));
      });

      ws.addEventListener('message', (event) => {
        // console.log('Received in Armageddon:', JSON.parse(event.data));
        const d = JSON.parse(
          String(event.data).replace(/:\s*(\d{16,})/g, ': "$1"')
        );

        if (d.params && d.params.result && d.params.result.value) {
          console.log('Value:', d.params.result.value);
        } else {
          // console.log('Value field not found');
        }

        setIsBigBangProcessing(false);

      });

      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setIsBigBangProcessing(false);

      });

      ws.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        setIsBigBangProcessing(false);

      });





      // //wait for 3 seconds
      // await new Promise((resolve) => setTimeout(resolve
      //   , 3000));

      // const confirmTx = await getTransactionStatus(tx);

      // // Check if the transaction has a status
      // const status = confirmTx?.ok;
      // if (!status) {
      //   notify({ type: 'error', message: 'Error!', description: 'Transaction status not found!' });
      //   setIsBigBangProcessing(false);
      //   return;
      // }

      // notify({ type: 'success', message: 'Success!', description: 'Transaction successful!' });
      // setIsBigBangProcessing(false);
      // return;


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

      if (!wallet?.publicKey) {
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

      const data = Buffer.concat([
        Buffer.from(Int8Array.from([1]).buffer), // 1 for armageddon
        Buffer.from(Uint8Array.of(...new BN("1498531940105142728").toArray("le", 8))),
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

      transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 3000000 }));
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      transaction.sign(wallet);

      const tx = await connection.sendRawTransaction(transaction.serialize());

      setTxId(tx);

      console.log("tx id >>> ", tx)
      const ws = new WebSocket('ws://8.52.151.4:8900');

      // check websocket connection
      ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');
      });

      ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');

        const subscriptionMessage = {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "xandeumResultUnscribe",
          "params": [tx, { "commitment": "finalized" }]
        };

        ws.send(JSON.stringify(subscriptionMessage));
      });

      ws.addEventListener('message', (event) => {
        // console.log('Received in Armageddon:', JSON.parse(event.data));
        const d = JSON.parse(
          String(event.data).replace(/:\s*(\d{16,})/g, ': "$1"')
        );

        if (d.params && d.params.result && d.params.result.value) {
          console.log('Value:', d.params.result.value);
        } else {
          // console.log('Value field not found');
        }
        setIsArmageddonProcessing(false);

      });

      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setIsArmageddonProcessing(false);

      });

      ws.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        setIsArmageddonProcessing(false);

      });


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
          disabled={isBigBangProcessing || !wallet?.publicKey}
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
          disabled={isArmageddonProcessing || !wallet?.publicKey}
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
