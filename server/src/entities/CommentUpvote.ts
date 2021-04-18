import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Comment } from "./Comment";
import { User } from "./User";

@ObjectType()
@Entity()
export class CommentUpvote extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  user: User;

  @Field()
  @PrimaryColumn()
  commentId: number;

  @Field(() => Comment)
  @ManyToOne(() => Comment, (comment) => comment.commentUpvotes, {
    onDelete: "CASCADE",
  })
  comment: Comment;
}
