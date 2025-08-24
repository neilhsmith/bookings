import { getAuth } from "@clerk/tanstack-react-start/server";
import type { Post } from "@prisma/client";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

import { db } from "../lib/db.js";
import { SERVER_ERRORS, validateAndSanitizeId, validateAndSanitizePostData } from "./validation.js";

export const fetchPosts = createServerFn({ method: "GET" }).handler(async () => {
  const webRequest = getWebRequest();
  if (!webRequest) throw new Error(SERVER_ERRORS.NO_REQUEST);

  const { userId } = await getAuth(webRequest);
  if (!userId) throw new Error(SERVER_ERRORS.UNAUTHORIZED);

  console.info(`Fetching posts for user ${userId}...`);

  const posts = await db.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return posts;
});

export const fetchPost = createServerFn({ method: "GET" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error(SERVER_ERRORS.NO_REQUEST);

    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error(SERVER_ERRORS.UNAUTHORIZED);

    console.info(`Fetching post with id ${data} for user ${userId}...`);

    // Validate and sanitize the post ID
    const validatedId = validateAndSanitizeId(data, "postId");

    const post = await db.post.findFirst({
      where: {
        id: validatedId,
        userId,
      },
    });

    if (!post) {
      throw notFound();
    }

    return post;
  });

export const createPost = createServerFn({ method: "POST" })
  .validator((data: { title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error(SERVER_ERRORS.NO_REQUEST);

    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error(SERVER_ERRORS.UNAUTHORIZED);

    console.info(`Creating post for user ${userId}...`);
    console.info("Data received:", data);

    // Validate and sanitize the post data
    const validatedData = validateAndSanitizePostData(data);

    const post = await db.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        userId,
      },
    });

    return post;
  });

export const updatePost = createServerFn({ method: "POST" })
  .validator((data: { id: string; title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error(SERVER_ERRORS.NO_REQUEST);

    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error(SERVER_ERRORS.UNAUTHORIZED);

    console.info(`Updating post ${data.id} for user ${userId}...`);

    // Validate and sanitize the post data
    const validatedPostData = validateAndSanitizePostData({
      title: data.title,
      content: data.content,
    });
    const validatedId = validateAndSanitizeId(data.id, "postId");

    const post = await db.post.updateMany({
      where: {
        id: validatedId,
        userId,
      },
      data: {
        title: validatedPostData.title,
        content: validatedPostData.content,
      },
    });

    if (post.count === 0) {
      throw notFound();
    }

    return await db.post.findUnique({ where: { id: validatedId } });
  });

export const deletePost = createServerFn({ method: "POST" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error(SERVER_ERRORS.NO_REQUEST);

    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error(SERVER_ERRORS.UNAUTHORIZED);

    console.info(`Deleting post ${data} for user ${userId}...`);

    // Validate and sanitize the post ID
    const validatedId = validateAndSanitizeId(data, "postId");

    const result = await db.post.deleteMany({
      where: {
        id: validatedId,
        userId,
      },
    });

    if (result.count === 0) {
      throw notFound();
    }

    return { success: true };
  });

export type { Post };
