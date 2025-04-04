import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";
import React from "react";

const Home: NextPage = (props) => {
  return (
    <div className="w-full md:w-3/4">
      <Head>
        <title>Xandeum Test App</title>
        <meta
          name="description"
          content="Xandeum Test App"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
