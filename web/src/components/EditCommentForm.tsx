import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import {
    useCommentQuery,
    useUpdateCommentMutation
} from "../generated/graphql";
import { InputField } from "./InputField";


interface EditCommentFormProps {
  commentId: number;
  setMode: any;
}

const EditCommentForm: React.FC<EditCommentFormProps> = ({
  commentId, setMode
}) => {
  
  const [ {data} ] = useCommentQuery({
    pause: commentId === -1,
    variables: { id: commentId },
  });

  const [, updateComment] = useUpdateCommentMutation();

  if (!data?.comment) {
    return null;
  }
  return (
    <Formik
      initialValues={{ text: data.comment.text }}
      onSubmit={async (values) => {
        await updateComment({ id: commentId, ...values });
        await setMode({editingId: null});
      }}
    >
      {({ isSubmitting }) => (
        <Form>       
          
          <InputField
            name="text"
            placeholder="text..."
            textarea={true}
            label="Edit your comment"
          />
          <Button
            mt={4}
            type="submit"
            isLoading={isSubmitting}
            colorScheme="teal"
          >
            Edit comment
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default EditCommentForm;