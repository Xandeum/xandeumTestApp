'use client';
import React, { FC, useEffect, useState } from 'react';

import Loader from 'components/Loader';
import { CURRENT_ERA, PROGRAM, XANDEUM_WS } from 'CONSTS';
import { notify } from 'utils/notifications';
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, Transaction, TransactionInstruction } from '@solana/web3.js';

import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Link from 'next/link';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
export const HomeView: FC = ({ }) => {

  const wallet = useWallet();

  const connection = new Connection('https://apis.trynet.xandeum.com', 'confirmed');

  const [isBigBangProcessing, setIsBigBangProcessing] = useState<boolean>(false);
  const [isArmageddonProcessing, setIsArmageddonProcessing] = useState<boolean>(false);

  const [txId, setTxId] = useState<string>('');
  const [fsId, setFsId] = useState<string>('');
  const [fsIdInput, setFsIdInput] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAirdropProcessing, setIsAirdropProcessing] = useState<boolean>(false);
  const [isFSDeleted, setIsFsDeleted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [statusCode, setStatusCode] = useState({
    bigbang: null,
    armageddon: null
  });

  // read user SOL balance 
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet.publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);
      }
    }
    fetchBalance();
  }, [wallet?.publicKey, wallet?.connected]);

  // function related to airdrop
  const onAirdrop = async () => {
    try {
      setIsAirdropProcessing(true);
      if (!wallet?.publicKey) {
        notify({ type: 'error', message: 'Error!', description: `Please connect your wallet first` });
        setIsAirdropProcessing(false);
        return;
      }
      await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL * 1);
      const balance = await connection.getBalance(wallet.publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
      setIsAirdropProcessing(false);
      notify({ type: 'success', message: 'Airdrop successful!', description: `1 SOL has been airdropped to your wallet` });
      window?.location?.reload();
      return;
    } catch (error) {
      console.log("error while airdrop : ", error)
      setIsAirdropProcessing(false);
      notify({ type: 'error', message: 'Error!', description: `Airdrop failed` });
      return;
    }
  }

  //function related to bigBang(insert)
  const onBigBang = async () => {
    try {
      setIsFsDeleted(false);
      setFsId('');
      setIsBigBangProcessing(true);

      if (!wallet?.publicKey) {
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
      const signedTx = await wallet.signTransaction(transaction);

      const tx = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true, });

      setTxId(tx);

      const ws = new WebSocket(XANDEUM_WS);

      // check websocket connection
      ws.addEventListener('open', () => {
        // console.log('WebSocket connection opened');
        const subscriptionMessage = {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "xandeumResultSubscribe",
          "params": [tx, { "commitment": "finalized" }]
        };

        ws.send(JSON.stringify(subscriptionMessage));
      });

      ws.addEventListener('message', (event) => {
        const d = JSON.parse(
          String(event.data).replace(/:\s*(\d{16,})/g, ': "$1"')
        );

        if (d.params && d.params.result && d.params.result.value && d.params.result.value.fsid) {
          // console.log('FSID after BigBang :', d.params.result.value);
          if (!fsId) {
            setStatusCode({ ...statusCode, bigbang: d.params?.result?.value?.status });
            setFsId(d.params.result.value?.fsid);
          }
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

    } catch (error) {
      console.log("error while bigbang : ", error);
      setIsBigBangProcessing(false);
      return;
    }
  }

  //function related to armageddon
  const onArmageddon = async () => {
    try {
      setIsArmageddonProcessing(true);
      setStatusCode({ ...statusCode, armageddon: null });

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
        Buffer.from(Uint8Array.of(...new BN(fsIdInput?.toString()).toArray("le", 8))),
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
      const signedTx = await wallet.signTransaction(transaction);

      const tx = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true, });

      setTxId(tx);

      const ws = new WebSocket(XANDEUM_WS);

      // check websocket connection
      ws.addEventListener('open', () => {
        // console.log('WebSocket connection opened');
        const subscriptionMessage = {
          "jsonrpc": "2.0",
          "id": 1,
          // "method": "xandeumResultUnscribe",
          "method": "xandeumResultSubscribe",
          "params": [tx, { "commitment": "finalized" }]
        };

        ws.send(JSON.stringify(subscriptionMessage));
      });

      ws.addEventListener('message', (event) => {

        const d = JSON.parse(
          String(event.data).replace(/:\s*(\d{16,})/g, ': "$1"')
        );

        if (d.params && d.params.result && d.params?.result?.value && d.params?.result?.value?.fsid) {
          // console.log('FSID after Aramageddon :', d.params?.result?.value);
          setIsFsDeleted(true);
          setMessage(d?.params?.result?.value?.message);

          if (d.params?.result?.value?.status == 0) {
            setStatusCode({ ...statusCode, armageddon: d.params?.result?.value?.status });
            setFsIdInput(d.params?.result?.value?.fsid)
            return;
          }
          return
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
      console.log("error while armageddon : ", error);
      setIsArmageddonProcessing(false);
      return;
    }
  }

  return (
    <div className="container flex mx-auto flex-col items-center w-full max-w-4xl p-4 mb-10" >
      <h2 className="text-3xl font-medium text-white md:leading-tight  my-5" > Xandeum Test App - TryNet </h2>

      < div className='flex flex-col gap-4 bg-tiles border-xnd w-full text-white p-3  mt-8 relative md:mb-0 mb-28 text-base' >
        <div className="absolute -inset-2 -z-10 bg-gradient-to-r from-[#fda31b] via-[#622657] to-[#198476] border-xnd blur  " > </div>
        < p className="font-medium text-white md:leading-tight text-justify  my-2" >
          This is a demo of the Xandeum Freiburg release.It showcases that xandeum - agave, our modified validator client, can intercept Xandeum Transactions that are wrapped into normal Solana transaction, decode them, send them through secure, high - perfomance and redundant communication channels through intermediate infrastructure and process them on a system named Atlas.
        </p>

        < p className="font-medium text-white md:leading-tight text-justify  my-2" >
          Missing the actual storage of data ? Freiburg is all the technical foundation - and data will be chunked into pages and sent to and stored on pNodes in the upcoming Munich release.
        </p>
        < p className="font-medium text-white md:leading-tight text-justify  my-2" >
          Now have fun playing God - run your own & apos; bigBang & apos;s to create a universe, a.k.a.file system, and destroy some universes via & apos; armageddon & apos;.
        </p>

        < p className="font-medium text-white md:leading-tight text-justify  my-2" >
          It looks simple and effortless - but it encompasses all the hard work of digging deep into the Solana inner workings and modify them for our purposes, creating that solid foundation for what & apos; s to come.
        </p>

        < p className="font-medium text-white md:leading-tight text-justify  my-2" >
          If it doesn’t look easy, you’re not working hard enough.
          < br />
          --Fred Astaire
        </p>
      </div>

      < div className='flex flex-col gap-4 bg-tiles border-xnd w-full text-white p-10  mt-14 relative md:mb-0 mb-28 text-base' >
        <div className="absolute -inset-2 -z-10 bg-gradient-to-r from-[#fda31b] via-[#622657] to-[#198476] border-xnd blur  " > </div>

        < h2 className="text-xl font-medium text-white md:leading-tight text-center  my-2" > Current Era: <span className='text-[#FDA31B]' > {CURRENT_ERA} </span></h2 >

        {!wallet?.connected ?
          <div className="flex flex-col items-center justify-center w-full mt-10" >
            <WalletMultiButtonDynamic className="btn btn-sm rounded-btn text-lg" style={{ "backgroundColor": '#FDA31b' }
            }>
              <AccountBalanceWalletIcon fontSize='medium' className='text-white mr-2' />
              Connect Wallet
            </WalletMultiButtonDynamic>
          </div>
          :
          <>
            <div className='flex flex-col items-center' >

              <div className="flex flex-row justify-center items-center w-full gap-4 mb-10" >
                <div className="font-normal text-right" > Your SOL balance: {solBalance} SOL </div>
              </div>

              {
                solBalance < 0.5 ?
                  <button type="button" className="btn bg-[#D98C18] hover:bg-[#fda31b] border-xnd border-none px-6 text-lg group flex p-2 gap-2 items-center justify-center self-center border-xnd font-normal focus:outline-none text-white disabled:bg-opacity-50 disabled:opacity-50 w-fit min-w-[14rem]"
                    onClick={onAirdrop}
                    disabled={isAirdropProcessing || !wallet?.publicKey
                    }
                  >
                    {
                      isAirdropProcessing ?
                        <Loader />
                        :
                        <span className="block group-disabled:hidden normal-case" >
                          Airdrop 1 SOL
                        </span>
                    }
                    <div className="hidden group-disabled:block normal-case" >
                      Airdrop 1SOL
                    </div>
                  </button>
                  :
                  <>
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
                      <div className="hidden group-disabled:block normal-case" >
                        bigBang
                      </div>
                    </button>


                    < div className='flex flex-row items-center justify-center relative mt-8' >
                      {
                        fsId ?
                          <div className="font-normal text-center">
                            File System Created Successfully.FSID: {fsId}
                            <div className="font-normal text-center" > Check it&apos;s there on < Link href={'https://showatlas.xandeum.network'} target='_blank' className='underline font-bold' > showatlas </Link></div >
                          </div>
                          :
                          isBigBangProcessing ?
                            <div className='flex flex-row items-center justify-center relative' >
                              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-[#FDA31B] mr-2' > </div>
                              < div className="font-normal text-center" > Waiting for FSID creation </div>
                            </div>
                            :
                            null
                      }
                    </div>

                    < div className='flex flex-col items-center mt-20' >
                      <div className="flex flex-row justify-center items-center w-full gap-4 mb-8" >
                        <div className="font-normal text-right" > FSID to Delete: </div>
                        < div className='flex flex-row items-center justify-center relative' >
                          <input
                            type="number"
                            min={0}
                            className='bg-tiles-dark border-xnd p-3 text-white focus:outline-none text-center max-w-20'
                            placeholder='FsID'
                            value={fsIdInput}
                            onChange={(e) => {
                              setIsFsDeleted(false);
                              const sanitizedValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                              setFsIdInput(Number(sanitizedValue)); // Pass sanitized value to the handler
                            }}
                            disabled={isArmageddonProcessing || !wallet?.publicKey}
                          />
                        </div>

                      </div>

                      < button type="button" className="btn bg-[#D98C18] hover:bg-[#fda31b] border-xnd border-none px-6 text-lg group flex p-2 gap-2 items-center justify-center self-center border-xnd font-normal focus:outline-none text-white disabled:bg-opacity-50 disabled:opacity-50 w-fit min-w-[14rem]"
                        onClick={onArmageddon}
                        disabled={isArmageddonProcessing || !wallet?.publicKey || fsIdInput == 0}
                      >
                        {
                          isArmageddonProcessing ?
                            <Loader />
                            :
                            <span className="block group-disabled:hidden normal-case" >
                              armageddon
                            </span>
                        }
                        <div className="hidden group-disabled:block normal-case" >
                          armageddon
                        </div>
                      </button>
                      < div className='flex flex-row items-center justify-center relative mt-8' >
                        {
                          isFSDeleted ?
                            <div className="font-normal text-center">
                              {message}
                              {
                                statusCode?.armageddon == 0 ?
                                  <div className="font-normal text-center" > Check it&apos;s there on < Link href={'https://showatlas.xandeum.network'} target='_blank' className='underline font-bold' > showatlas </Link></div >
                                  :
                                  null
                              }
                            </div>
                            :
                            isArmageddonProcessing ?
                              <div className='flex flex-row items-center justify-center relative' >
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-[#FDA31B] mr-2' > </div>
                                < div className="font-normal text-right" > Waiting for FSID deletion </div>
                              </div>
                              :
                              null
                        }
                      </div>
                    </div>
                  </>
              }
            </div>
          </>
        }
      </div>
    </div>
  );
};