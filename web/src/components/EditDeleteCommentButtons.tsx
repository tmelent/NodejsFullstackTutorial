import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import React from "react";
import { useDeleteCommentMutation, useMeQuery } from "../generated/graphql";
import { ActionAlert } from "./ActionAlert";
interface EditDeleteCommentButtonsProps {
  id: number;
  authorId: number;
  setMode: any;
}

export const EditDeleteCommentButtons: React.FC<EditDeleteCommentButtonsProps> = ({
  id,
  authorId: authorId,
  setMode,
}) => {
  const [, deleteComment] = useDeleteCommentMutation();
  const [{ data: user }] = useMeQuery();
  if (user?.me?.id !== authorId) {
    return null;
  }
  return (
    <Flex>
      <IconButton
        onClick={() => setMode({ editingId: id })}
        as={Link}        
        className="editBtn"
        mr={4}
        icon={<EditIcon />}
        aria-label="edit comment"
      />
      <ActionAlert
        onClick={async () => {
          await deleteComment({ id });
        }}
        ariaLabel="Delete comment"
        className="deleteBtn"
        icon={<DeleteIcon />}
        text="Delete comment"
      />
    </Flex>
  );
};
