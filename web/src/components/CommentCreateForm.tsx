import { Button } from "@chakra-ui/react";
import { Formik, Form, useFormik } from "formik";
import React from "react";
import { useCreateCommentMutation } from "../generated/graphql";
import { useIsAuth } from "../utils/useIsAuth";
import { InputField } from "./InputField";

interface CommentCreateFormProps {
  postId: number;
}

export const CommentCreateForm: React.FC<CommentCreateFormProps> = ({
  postId,
}) => {
  const [, createComment] = useCreateCommentMutation();

  useIsAuth();
  return (
    <Formik
      initialValues={{ text: "", postId: postId, isReplyTo: 0 }}
      onSubmit={async (values, { resetForm }) => {
        const { error } = await createComment({ input: values });
        if (error) {
          alert(`Something went wrong: ${error}`);
        } else {
          resetForm();
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <InputField
            name="text"
            placeholder="Share your thoughts..."
            textarea={true}
            label="Write something"
          />
          <Button
            mt={4}
            type="submit"
            isLoading={isSubmitting}
            colorScheme="teal"
          >
            Submit comment
          </Button>
        </Form>
      )}
    </Formik>
  );
};
