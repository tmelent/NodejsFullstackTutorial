import { Box, Button, Heading } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { SlateWindow } from "../components/slate";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="regular">
      <SlateWindow />
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <>
            <Heading mb={8}>Create post</Heading>
            <Form>
              <InputField name="title" placeholder="title" label="Title" />
              <Box mt={4} />
              <InputField
                name="text"
                placeholder="text..."
                textarea={true}
                label="Body"
              />
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                className="submitBtn"
              >
                Submit
              </Button>
            </Form>
          </>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
