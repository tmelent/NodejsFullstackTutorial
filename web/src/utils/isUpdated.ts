import {
  CommentFragmentFragment,
  PostSnippetFragment,
} from "../generated/graphql";

type EntityWithUpdatedCreatedValues =
  | PostSnippetFragment
  | CommentFragmentFragment;

export default function isUpdated(entity: EntityWithUpdatedCreatedValues) {
  return entity.createdAt !== entity.updatedAt;
}
