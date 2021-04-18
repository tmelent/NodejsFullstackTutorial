import DataLoader from "dataloader";
import { CommentUpvote } from "../entities/CommentUpvote";
export const createCommentUpvoteLoader = () =>
  new DataLoader<{ commentId: number; postId: number; userId: number }, CommentUpvote | null>(
    async (keys) => {
      const upvotes = await CommentUpvote.findByIds(keys as any);
      const upvotesIdsToUpvote: Record<string, CommentUpvote> = {};
      upvotes.forEach((upvote) => {
        upvotesIdsToUpvote[`${upvote.userId}|${upvote.commentId}`] = upvote;
      });

      return keys.map(
        (key) => upvotesIdsToUpvote[`${key.userId}|${key.commentId}`]
      );
    }
  );
