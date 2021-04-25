import { CommentUpvote } from "../entities/CommentUpvote";
import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Comment } from "../entities/Comment";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

// Fields:
//  id, authorId, points, isOP, postId, text
// Logic:
//  to add comment we need to know text, authorId (which is { req.session.id }), points (on default is 0), and postId
//  before adding comment we need to know if it is from OP or not to set 'OP' mark
//  to delete comment we need to check id and need to know authorId and postId
//  to reply on comment we need to set 'isReplyTo' value and generate reply tree
//  pagination is like in posts, i guess

@InputType()
class CommentInput {
  @Field()
  postId: number;

  @Field()
  text: string;

  @Field(() => Int, {defaultValue: null})
  isReplyTo: number;
}

@ObjectType()
class PaginatedComments {
  @Field(() => [Comment])
  comments: Comment[];
  @Field()
  hasMore: boolean;
}

@Resolver(Comment)
export class CommentResolver {
  @FieldResolver(() => User)
  author(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(comment.authorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() comment: Comment,
    @Ctx() { commentUpvoteLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const upvote = await commentUpvoteLoader.load({
      commentId: comment.id,
      postId: comment.postId,
      userId: req.session.userId,
    });
    return upvote ? upvote.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async voteComment(
    @Arg("commentId", () => Int) commentId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    const upVote = await CommentUpvote.findOne({ where: { commentId, userId } });
    // Checking if user wants to change existing vote value

    if (upVote && upVote.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        update "comment_upvote"
        set value = $1
        where "commentId" = $2 and "userId" = $3
      `,
          [realValue, commentId, userId]
        );

        await tm.query(
          `
        update comment
        set points = points + $1
        where id = $2
      `,
          [2 * realValue, commentId]
        ); // double because of this logic: -1 -> +1, +1 -> -1
      });
    } else if (!upVote) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
      insert into "comment_upvote"("userId", "commentId", "value")
      values ($1, $2, $3);
        `,
          [userId, commentId, realValue]
        );
        await tm.query(
          `
      update comment
      set points = points + $1
      where id = $2
        `,
          [realValue, commentId]
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedComments)
  async comments(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Arg("postId", () => Int) postId: number
  ): Promise<PaginatedComments> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne, postId];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    const comments = await getConnection().query(
      `
    select c.*
    from comment c
    ${cursor ? `where c."createdAt" < $3 and` : "where"} c."postId"=$2
    order by c."createdAt" DESC
    limit $1
    `,
      replacements
    );    
    return {
      comments: comments.slice(0, realLimit),
      hasMore: comments.length === realLimitPlusOne,
    };
  }

  @Query(() => Comment, { nullable: true })
  comment(@Arg("id", () => Int) id: number): Promise<Comment | undefined> {
    return Comment.findOne(id);
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("input") input: CommentInput,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
    const authorId = req.session.userId;
    const isOP =
      (await Post.findOne({ id: input.postId }))?.creatorId === authorId;
    return Comment.create({ ...input, authorId, isOP }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updateComment(
    @Arg("id", () => Int) id: number,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    return (
      await getConnection()
        .createQueryBuilder()
        .update(Comment)
        .set({ text })
        .where('id=:id and "authorId" = :authorId', {
          id,
          authorId: req.session.userId,
        })
        .returning("*")
        .execute()
    ).raw[0] as Comment;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Comment.delete({ id, authorId: req.session.userId });
    return true;
  }
}
