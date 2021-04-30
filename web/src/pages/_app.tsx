import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";

import React from "react";
import theme from "../theme";
import '../stylesheets/index.css';

export default function MyApp({ Component, pageProps }: any) {
  return (    
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider options={{ useSystemColorMode: true, initialColorMode: "dark" }}>
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>    
  );
}
