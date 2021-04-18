import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  CommentFragmentFragment,
  useVoteCommentMutation,
} from "../generated/graphql";

interface CommentUpvoteSectionProps {
  comment: CommentFragmentFragment;
}

export const CommentUpvoteSection: React.FC<CommentUpvoteSectionProps> = ({
  comment,
}) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteCommentMutation();
  return (
    <Flex
      mr={8}
      ml={2}
      justifyContent="center"
      alignItems="center"
      direction="column"
    >
      <IconButton
        onClick={async () => {
          if (comment.voteStatus === 1) {
            return;
          }
          setLoadingState("upvote-loading");
          await vote({
            commentId: comment.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "upvote-loading"}
        colorScheme={comment.voteStatus === 1 ? "green" : undefined}
        icon={<ChevronUpIcon />}
        aria-label="Upvote"
        h={8}
      />{" "}
      {comment.points}
      <IconButton
        onClick={async () => {
          if (comment.voteStatus === -1) {
            return;
          }
          setLoadingState("downvote-loading");
          await vote({
            commentId: comment.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downvote-loading"}
        colorScheme={comment.voteStatus === -1 ? "orange" : undefined}
        icon={<ChevronDownIcon />}
        aria-label="Downvote"
        h={8}
      />
    </Flex>
  );
};
