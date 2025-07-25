"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import { useAuth } from "@clerk/nextjs";

export function LatestPost() {
  const { orgId, userId, orgRole, isLoaded, isSignedIn } = useAuth();

  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="p-5 text-red-500">
          {latestPost.map((post) => {
            console.log("Post:", post);

            return (
              <div>
                <div key={post.id} className="mb-4 rounded-xl border p-2">
                  <h2 className="text-2xl font-bold">{post.name}</h2>
                  <p className="text-sm text-gray-500">
                    Created by{" "}
                    {post.author ? post.author.name : "Unknown Author"}
                  </p>
                </div>
              </div>
            );
          })}
        </p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
