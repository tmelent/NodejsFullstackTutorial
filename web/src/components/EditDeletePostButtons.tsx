import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import router from "next/router";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import NextLink from "next/link";
import { ActionAlert } from "./ActionAlert";
interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: user }] = useMeQuery();
  if (user?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Flex>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          mr={4}
          icon={<EditIcon />}
          aria-label="edit post"
          className="editBtn"
        />
      </NextLink>     
      <ActionAlert
        onClick={async () => {
          await deletePost({ id });
          router.push("/");
        }}
        ariaLabel="Delete post"
        className="deleteBtn"
        icon={<DeleteIcon />}
        text="Delete post"
      />
    </Flex>
  );
};
