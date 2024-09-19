import dynamic from "next/dynamic";

const ZkAuthExample = dynamic(() => import("./zk-auth"), { ssr: false });

export default function HomePage() {
  return (
    <main>
      <ZkAuthExample />
    </main>
  );
}
