import "../styles/tailwind.css";
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

if (process.browser) {
  try {
    window.ethereum.autoRefreshOnNetworkChange = false;
  } catch (e) {}
}
