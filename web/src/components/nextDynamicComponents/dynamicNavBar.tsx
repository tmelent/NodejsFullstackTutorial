import dynamic from "next/dynamic";

export const NavBar = dynamic(import(".././NavBar"), { ssr: false });
