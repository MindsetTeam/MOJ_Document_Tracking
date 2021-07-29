import "../styles/globals.css";
import { SWRConfig } from "swr";
function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()).then(data=>data.data),
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
