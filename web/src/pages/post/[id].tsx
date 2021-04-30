import { Box, Divider, Flex, Heading, Skeleton, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import CommentSection from "../../components/CommentSection";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { UpvoteSection } from "../../components/UpvoteSection";
import { PostSnippetFragment } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import parseDate from "../../utils/parseDate";
import { useGetIntId } from "../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import isUpdated from "../../utils/isUpdated";
const Post = ({}) => {
  const intId = useGetIntId();

  const [{ data, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return (
      <Layout>
        <Box p={8} shadow="md" borderWidth="1px">
          <Skeleton mb={6} height="30px" width="350px" />
          <Skeleton mb={4} height="20px" width="450px" />
          <Skeleton mb={4} height="20px" />
          <Skeleton mb={4} height="20px" />
        </Box>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Couldn't find post.</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={8} shadow="md" borderWidth="1px">
        <Flex alignItems="center">
          <UpvoteSection post={data.post as any} />
          <Box mt={2} >
            <Heading pb={4}>{data.post.title}</Heading>
            <Text pb={1}>
              posted by {data.post.creator.username} at{" "}
              {parseDate(data.post.createdAt)}
            </Text>

            {isUpdated(data.post as any) ? (
              <Text as='sup'>
                updated at {parseDate(data.post.updatedAt)}
              </Text>
            ) : null}
          </Box>

          <Box ml="auto">
            <EditDeletePostButtons
              id={intId}
              creatorId={data.post.creator.id}
            />
          </Box>
        </Flex>

        <Box mt={5} ml={2}>
          {data.post.text}
        </Box>
      </Box>
      <Divider mt={8} />
      <Heading mt={8} ml={0} as="h2" size="lg">
        Comments
      </Heading>
      <Divider mt={8} />
      <Box mt={8}>
        <CommentSection pageProps={null} postId={intId} />
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
