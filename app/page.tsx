"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { BookOpen, PenSquare, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  featuredImage?: string;
  createdAt: Date | string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setError(null);
      const headers: HeadersInit = user
        ? { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
        : {};
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`, {
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();

      if (pageNum === 1) {
        setPosts(data.posts || []);
        setFilteredPosts(data.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setFilteredPosts((prev) => [...prev, ...(data.posts || [])]);
      }

      setHasMore(data.hasMore || false);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      setError(
        error.message.includes("Failed to fetch posts")
          ? "Unable to connect to the database. Please check your network or database settings and try again."
          : error.message
      );
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter((post) =>
      [post.title, post.excerpt]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredPosts(filtered);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-background">
        <div className="animate-pulse space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black/20 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Discover Stories That Inspire
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Join the Skylink Blog community to read, write, and share
                amazing stories from around the world.
              </p>
              {/* Welcome Message and User Info */}
              <div className="mb-6">
                {user ? (
                  <>
                    <h2 className="text-2xl font-semibold text-foreground">
                      Welcome, {user.name}!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Username: @{user.username}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      Explore and share your stories with the Skylink Blog
                      community.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-foreground">
                      Welcome to Skylink Blog!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Sign in to share your stories with the community.
                    </p>
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-black/20 hover:bg-black"
                >
                  <Link href={user ? "/posts/new" : "/login"}>
                    <PenSquare className="mr-2 h-5 w-5" />
                    {user ? "Write a Post" : "Sign In to Write"}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 relative h-[400px]">
              <Image
                src="/hero.png"
                alt="Blogging inspiration"
                fill
                className="object-cover rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
          <Sparkles className="absolute top-10 right-10 h-12 w-12 text-primary/50 animate-pulse hidden md:block" />
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchPosts(1)}>Retry</Button>
          </div>
        </section>
      )}

      {/* Featured Posts Section */}
      {filteredPosts.length > 0 && !error && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              <BookOpen className="inline-block mr-2 h-6 w-6" />
              Featured Posts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.slice(0, 3).map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    createdAt:
                      typeof post.createdAt === "string"
                        ? new Date(post.createdAt)
                        : post.createdAt,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts Section */}
      {!error && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                <BookOpen className="inline-block mr-2 h-6 w-6" />
                All Posts
              </h2>
              <div className="max-w-md w-full">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
            <div className="space-y-8">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    createdAt:
                      typeof post.createdAt === "string"
                        ? new Date(post.createdAt)
                        : post.createdAt,
                  }}
                />
              ))}
            </div>

            {filteredPosts.length === 0 && !loading && (
              <div className="text-center py-12">
                <Sparkles className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                <p className="text-xl text-muted-foreground mb-4">
                  No posts found.
                </p>
                <Button asChild variant="outline">
                  <Link href="/posts/new">Be the first to share a story!</Link>
                </Button>
              </div>
            )}

            {hasMore && filteredPosts.length > 0 && (
              <div className="text-center mt-12">
                <Button onClick={loadMore}>Load More Posts</Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className="container mx-auto px-4 py-12 border-t border-muted">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Join the Skylink Community
          </h3>
          <p className="text-muted-foreground mb-6">
            Connect with us on social media and stay updated with the latest
            stories.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" asChild>
              <a
                href="mailto:nahomtewdorsm@gmail.com"
                className="text-muted-foreground hover:text-primary"
              >
                Email
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a
                href="https://www.linkedin.com/company/skylinkict/"
                className="text-muted-foreground hover:text-primary"
              >
                LinkedIn
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a
                href="https://www.instagram.com/skylink_technologies/"
                className="text-muted-foreground hover:text-primary"
              >
                Instagram
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            © {new Date().getFullYear()} Skylink Blog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
