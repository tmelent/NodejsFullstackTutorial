import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import router from "next/router";
import React from "react";
import { useDeleteCommentMutation, useMeQuery } from "../generated/graphql";
import { ActionAlert } from "./ActionAlert";
interface EditDeleteCommentButtonsProps {
  id: number;
  authorId: number;
}

export const EditDeleteCommentButtons: React.FC<EditDeleteCommentButtonsProps> = ({
  id,
  authorId: authorId,
}) => {
  const [, deleteComment] = useDeleteCommentMutation();
  const [{ data: user }] = useMeQuery();
  if (user?.me?.id !== authorId) {
    return null;
  }
  return (
    <Flex>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          mr={4}
          icon={<EditIcon />}
          aria-label="edit comment"
        />
      </NextLink>     
      <ActionAlert
        onClick={async () => {
          await deleteComment({ id });
        }}
        ariaLabel="Delete comment"
        colorScheme="red"
        icon={<DeleteIcon />}
        text="Delete comment"
      />
    </Flex>
  );
};
