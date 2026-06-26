"use client";

import dynamic from "next/dynamic";

const PublicToolsClient = dynamic(() => import("./PublicToolsClient"), {
  ssr: false
});

export default function PublicToolsNoSSR() {
  return <PublicToolsClient />;
}
