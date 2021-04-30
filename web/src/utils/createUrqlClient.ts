import {
  dedupExchange,
  Exchange,
  fetchExchange,
  gql,
  stringifyVariables,
} from "@urql/core";
import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import { pipe, tap } from "wonka";
import {
  DeleteCommentMutationVariables,
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  UpdateCommentMutationVariables,
  VoteCommentMutationVariables,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { isServer } from "./isServer";
const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        console.log("error catched:", error?.message);
        Router.replace("/login");
      }
    })
  );
};

//

const cursorPostsPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(entityKey, fieldKey) as string;
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;

      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

const cursorCommentsPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(
      (info) =>
        info.fieldName === fieldName &&
        info.arguments!.postId ===
          parseInt(stringifyVariables(fieldArgs.postId))
    );
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(entityKey, fieldKey) as string;
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];

    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "comments") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });
    return {
      __typename: "PaginatedComments",
      hasMore,
      comments: results,
    };
  };
};

function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || {});
  });
}

const invalidateAllComments = (cache: Cache) => {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "comments");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "comments", fi.arguments || {});
  });
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
          PaginatedComments: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPostsPagination(),
            comments: cursorCommentsPagination(),
          },
        },
        updates: {
          Mutation: {
            updateComment: (_result, args, cache, _info) => {
              const { id, text } = args as UpdateCommentMutationVariables;              
              cache.writeFragment(
                gql`
                  fragment wfg on Comment {
                    updatedAt
                    text
                  }
                `,
                { id, text, updatedAt: Date.now() }
              );
            },
            deleteComment: (_result, args, cache, _info) => {
              cache.invalidate({
                __typename: "Comment",
                id: (args as DeleteCommentMutationVariables).id,
              });
            },
            createComment: (_result, _args, cache, _info) => {
              invalidateAllComments(cache);
            },
            voteComment: (_result, args, cache, _info) => {
              const { commentId, value } = args as VoteCommentMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Comment {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: commentId }
              );
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }

                const newPoints =
                  (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                    fragment __ on Comment {
                      points
                      voteStatus
                    }
                  `,
                  { id: commentId, points: newPoints, voteStatus: value }
                );
              }
            },
            createPost: (_result, _args, cache, _info) => {
              invalidateAllPosts(cache);
            },
            updatePost: (_result, _args, cache, _info) => {
              invalidateAllPosts(cache);
            },
            deletePost: (_result, args, cache, _info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, _info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }
                const newPoints =
                  (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },

            logout: (_result, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateAllPosts(cache);
              invalidateAllComments(cache);
            },

            register: (_result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      ssrExchange,
      errorExchange,
      fetchExchange,
    ],
  };
};
