import Script from "next/script";

export default function LiveSiteShell() {
  return (
    <>
      <link rel="stylesheet" href="/live-site/assets/index-CZ0ifNGa.css" />
      <div id="root" />
      <Script
        src="/live-site/assets/index-DOsJZNIp.js"
        type="module"
        strategy="afterInteractive"
      />
    </>
  );
}
