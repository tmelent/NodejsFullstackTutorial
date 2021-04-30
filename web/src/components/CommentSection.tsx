import { Button, Flex, Stack } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { useCommentsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { CommentBody } from "./CommentBody";
import { CommentCreateForm } from "./CommentCreateForm";
import EditCommentForm from "./EditCommentForm";


interface CommentSectionProps {
  postId: number;
  comment: any;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [variables, setVariables] = useState({
    limit: 5,
    postId: postId,
    cursor: null as null | string,
  });
  const [mode, setMode] = useState({
    editingId: null as null | number,
  });
  const [{ data, error, fetching }] = useCommentsQuery({ variables });
  if (!fetching && !data) {
    return <div>query failed: {error?.message}</div>;
  }

  const isEditing = (id: number) => id === mode.editingId;

  return (
    <div>
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          <CommentCreateForm postId={postId} />
          {data!.comments.comments.map((c) =>
            !c ? null : isEditing(c.id) ? (
              <EditCommentForm
                setMode={setMode}
                key={`editing-comment-${c.id}`}
                commentId={c.id}
              />
            ) : (
              <CommentBody key={`comment-${c.id}`} c={c} setMode={setMode} />
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
            className="submitBtn"
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </div>
  );
};

export default withUrqlClient(createUrqlClient)(CommentSection as any);
