"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export default function NewPostPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const tagsInputRef = useRef<HTMLInputElement>(null); // Ref to control tags input focus

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
  });

  const onSubmit = async (data: PostInput) => {
    console.log("Form submitted with data:", data); // Debug log
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ ...data, published: true }), // Always publish the post
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Post published successfully!");
        router.push(`/posts/${result.slug}`);
      } else {
        console.error("API error:", result.error); // Debug log
        toast.error(result.error || "Failed to publish post");
      }
    } catch (error) {
      console.error("Submission error:", error); // Debug log
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">
            You must be logged in to create a post.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-muted-foreground">
            Share your thoughts with the world
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form behavior
            console.log("Form onSubmit triggered"); // Debug log
            handleSubmit(onSubmit)(e); // Explicitly call handleSubmit
          }}
          className="space-y-6"
        >
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
              Description
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
              ref={tagsInputRef}
              placeholder="technology, programming, web development"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent Enter from focusing or submitting unexpectedly
                  console.log("Enter key pressed in tags input"); // Debug log
                  handleSubmit(onSubmit)(); // Trigger form submission on Enter
                }
              }}
              onFocus={(e) => {
                // Prevent focus if form is submitting
                if (loading) {
                  e.target.blur();
                  console.log(
                    "Prevented focus on tags input during submission"
                  ); // Debug log
                }
              }}
            />
          </div>

          <div className="flex items-center space-x-4">
            <Button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                console.log("Publish Post button clicked"); // Debug log
                if (tagsInputRef.current) {
                  tagsInputRef.current.blur(); // Explicitly remove focus from tags input
                }
              }}
            >
              {loading ? "Publishing..." : "Publish Post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
