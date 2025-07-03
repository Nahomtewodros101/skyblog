"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  published: boolean;
  featuredImage?: string;
  author: {
    id: string;
  };
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  useEffect(() => {
    if (post && user) {
      if (post.author.id !== user.id && user.role !== "ADMIN") {
        toast.error("You don't have permission to edit this post");
        router.push(`/posts/${params.slug}`);
        return;
      }

      reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        tags: post.tags,
        published: post.published,
        featuredImage: post.featuredImage || "",
      });
    }
  }, [post, user, reset, router, params.slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        toast.error("Post not found");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PostInput) => {
    if (!post) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/posts?id=${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Post updated successfully!");
        router.push(`/posts/${result.slug}`);
      } else {
        toast.error(result.error || "Failed to update post");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/posts?id=${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.ok) {
        toast.success("Post deleted successfully!");
        router.push("/profile");
      } else {
        const result = await response.json();
        toast.error(result.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
          <p className="text-muted-foreground">Make changes to your post</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <Input
              id="title"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
              placeholder="Enter your post title"
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              Excerpt
            </label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              className={errors.excerpt ? "border-destructive" : ""}
              placeholder="Brief description of your post"
              rows={3}
            />
            {errors.excerpt && (
              <p className="text-destructive text-sm mt-1">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content *
            </label>
            <Textarea
              id="content"
              {...register("content")}
              className={errors.content ? "border-destructive" : ""}
              placeholder="Write your post content here..."
              rows={15}
            />
            {errors.content && (
              <p className="text-destructive text-sm mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="featuredImage"
              className="block text-sm font-medium mb-2"
            >
              Featured Image URL
            </label>
            <Input
              id="featuredImage"
              type="url"
              {...register("featuredImage")}
              className={errors.featuredImage ? "border-destructive" : ""}
              placeholder="https://example.com/image.jpg"
            />
            {errors.featuredImage && (
              <p className="text-destructive text-sm mt-1">
                {errors.featuredImage.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="technology, programming, web development"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              {...register("published")}
              className="rounded border-gray-300"
            />
            <label htmlFor="published" className="text-sm font-medium">
              Published
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button type="submit" disabled={updating}>
                {updating ? "Updating..." : "Update Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>

            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
