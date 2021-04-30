import { Box, Flex } from "@chakra-ui/layout";
import { Button, Text, Link, LinkOverlay } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  const router = useRouter();
  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <div className="navbar-text">
        <NextLink href="/login">
          <Link mr={2} color="white">
            <b>Login</b>
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">
            <b>Register</b>
          </Link>
        </NextLink>
      </div>
    );
  } else {
    body = (
      <Flex align="center">
        <Box mr={6} className="navbar-text">
          {data.me.username}
        </Box>
        <Link
          className="navbar-text"
          onClick={async () => {
            await logout();
            router.reload();
          }}
          isLoading={logoutFetching}
        >
          logout
        </Link>
      </Flex>
    );
  }
  return (
    <Flex justifyItems="center" zIndex={1} position="sticky" top={0} className="navBar" p={4}>
      <Flex flex={1} m="auto" maxW={800} align="center">
        <NextLink href="/">
          <Text className="unselectable logo">Meowddit</Text>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
