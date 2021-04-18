import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { CommentUpvote } from "./CommentUpvote";
import { User } from "./User";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  authorId!: number;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Boolean)
  @Column()
  isOP: boolean;

  @Field()
  @Column({ type: "int", default: 0 })
  isReplyTo: number;

  @Field(() => Int)
  @Column()
  postId!: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post[];

  @OneToMany(() => CommentUpvote, (commentUpvote) => commentUpvote.comment)
  commentUpvotes: CommentUpvote[];
}
