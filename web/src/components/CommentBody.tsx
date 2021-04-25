import { StarIcon } from "@chakra-ui/icons";
import { Text, Flex, Box } from "@chakra-ui/react";
import React from "react";
import { CommentFragmentFragment } from "../generated/graphql";
import isUpdated from "../utils/isUpdated";
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
          <Text>posted at {parseDate(c.createdAt)}</Text>
          {isUpdated(c) ? <Text fontSize='sm' color='gray.400'>updated at {parseDate(c.updatedAt)}</Text>: null}
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
