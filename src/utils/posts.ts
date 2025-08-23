import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "@clerk/tanstack-react-start/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { db } from "../lib/db.js";
import type { Post } from "@prisma/client";

export const fetchPosts = createServerFn({ method: "GET" }).handler(async () => {
  const webRequest = getWebRequest();
  if (!webRequest) throw new Error("No request found");
  
  const { userId } = await getAuth(webRequest);
  if (!userId) throw new Error("Unauthorized");

  console.info(`Fetching posts for user ${userId}...`);

  const posts = await db.post.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return posts;
});

export const fetchPost = createServerFn({ method: "GET" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    console.info(`Fetching post with id ${data} for user ${userId}...`);

    const post = await db.post.findFirst({
      where: { 
        id: data,
        userId
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
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    console.info(`Creating post for user ${userId}...`);

    const post = await db.post.create({
      data: {
        ...data,
        userId,
      },
    });

    return post;
  });

export const updatePost = createServerFn({ method: "POST" })
  .validator((data: { id: string; title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    console.info(`Updating post ${data.id} for user ${userId}...`);

    const post = await db.post.updateMany({
      where: { 
        id: data.id,
        userId
      },
      data: {
        title: data.title,
        content: data.content,
      },
    });

    if (post.count === 0) {
      throw notFound();
    }

    return await db.post.findUnique({ where: { id: data.id } });
  });

export const deletePost = createServerFn({ method: "POST" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    console.info(`Deleting post ${data} for user ${userId}...`);

    const result = await db.post.deleteMany({
      where: { 
        id: data,
        userId
      },
    });

    if (result.count === 0) {
      throw notFound();
    }

    return { success: true };
  });

export type { Post };
