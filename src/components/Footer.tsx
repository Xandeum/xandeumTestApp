import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from "../assets/XANDEUM_Logo.png"
import React from 'react';
export const Footer: FC = () => {
    return (
        <div className="flex">
            <footer className="border-t-2 border-[#141414] bg-black hover:text-white w-screen flex flex-row items-center justify-center md:justify-between" >
                <div className="ml-12 py-6 mr-12">
                    <Image
                        src={logo}
                        alt="Xandeum logo"
                        width={60}
                        height={40}
                    />
                </div>
                {/* <div className="grid-flow-col gap-4 text-center  mr-12">
                    <div>
                        <p className="text-white text-base font-bold hover:text-primary-dark transition-all duration-200">
                            © 2023 Xandeum Labs.
                        </p>
                        <p>
                            All rights reserved.
                        </p>
                    </div>
                </div> */}
                <div className="grid-flow-col gap-4 text-center mr-12 hidden md:flex">
                    <div>
                        <p className="text-white text-base font-light cursor-default ">
                            Powered by
                        </p>
                        <a
                            rel="noreferrer"
                            href="https://xandeum.network/"
                            target="_blank"
                            className="text-white text-base font-bold hover:text-primary-dark transition-all duration-200"
                        >
                            Xandeum
                        </a>
                    </div>
                </div>

            </footer>
        </div>
    );
};
