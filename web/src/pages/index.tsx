import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpvoteSection } from "../components/UpvoteSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import isUpdated from "../utils/isUpdated";
import parseDate from "../utils/parseDate";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });

  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>query failed: {error?.message}</div>;
  }
  return (
    <Layout>
      <Flex justifyItems="center">
        <Heading mb={8}>Feed</Heading>
        <NextLink href="/create-post">
          <Button ml='auto' className="createPostBtn">
            Create post
          </Button>
        </NextLink>
      </Flex>

      {!data && fetching ? (
        <Stack spacing={8} p={8}  shadow="md" borderWidth="1px">
          <Skeleton mb={6} height="30px" width="350px" />
          <Skeleton mb={4} height="20px" width="450px" />          
          <Skeleton mb={4} height="20px" />
        </Stack>        
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} className="contentFrame" >
                <UpvoteSection post={p} />
                <Box>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>
                    posted by {p.creator.username} at {parseDate(p.createdAt)}
                  </Text>
                  {isUpdated(p) ? (
                    <Text fontSize="sm" color="gray.400">
                      updated at {parseDate(p.updatedAt)}
                    </Text>
                  ) : null}

                  <Text mt={4}>{p.textSnippet} </Text>
                </Box>
                <Box ml="auto">
                  <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables?.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
            m="auto"
            my={8}
            className="submitBtn"
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
