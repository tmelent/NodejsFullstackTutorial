import { StarIcon } from "@chakra-ui/icons";
import { Text, Flex, Box } from "@chakra-ui/react";
import React from "react";
import { CommentFragmentFragment } from "../generated/graphql";
import parseDate from "../utils/parseDate";
import { CommentUpvoteSection } from "./CommentUpvoteSection";
import { EditDeleteCommentButtons } from "./EditDeleteCommentButtons";

interface CommentBodyProps {
  c: CommentFragmentFragment;
  setMode: any;
}

export const CommentBody: React.FC<CommentBodyProps> = ({ c, setMode }) => {
  return (
    <Flex      
      alignItems="center"
      p={7}
      shadow="md"
      borderWidth="1px"
    >
      <CommentUpvoteSection comment={c} />
      <Box>
        <Flex alignItems="center">
          <strong>{c.author.username}</strong>
          {c.isOP ? <StarIcon ml={2} /> : null}
        </Flex>
        {c.createdAt !== c.updatedAt ? (
          <Text ml="auto">edited at {parseDate(c.updatedAt)}</Text>
        ) : (
          <Text>posted at {parseDate(c.createdAt)}</Text>
        )}
        <Text mt={4}>{c.text}</Text>
      </Box>
      <Box ml="auto">
        <EditDeleteCommentButtons
          id={c.id}
          authorId={c.author.id}
          setMode={setMode}
        />
      </Box>
    </Flex>
  );
};
