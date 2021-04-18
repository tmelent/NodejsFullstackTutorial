import {
  Box,
  Button,
  Flex,



  Stack, Text
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { useCommentsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { CommentUpvoteSection } from "./CommentUpvoteSection";
import { EditDeleteCommentButtons } from "./EditDeleteCommentButtons";
// import { UpvoteSection } from "./UpvoteSection";

/*
TODO: Fix EditDeletePostButtons -> CommentButtons
*/
interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [variables, setVariables] = useState({
    limit: 15,
    postId: postId,
    cursor: null as null | string,
  });
  const [{ data, error, fetching }] = useCommentsQuery({ variables });

  if (!fetching && !data) {
    return <div>query failed: {error?.message}</div>;
  }
  return (
       
        <div>
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.comments.comments.map((c) =>
            !c ? null : (
              <Flex key={c.id} alignItems="center" p={7} shadow="md" borderWidth="1px">
               <CommentUpvoteSection comment={c} />
                <Box>
                  <strong>{c.author.username}</strong>
                  <Text mt={4}>{c.text}</Text>
                </Box>
                <Box ml="auto">
                  <EditDeleteCommentButtons id={c.id} authorId={c.author.id} />
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.comments.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables?.limit,
                postId: postId,
                cursor:
                  data.comments.comments[data.comments.comments.length - 1]
                    .createdAt,
              })
            }
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </div>
  );
};

export default withUrqlClient(createUrqlClient)(
  CommentSection as any
);
