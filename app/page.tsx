"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  PenSquare,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Globe,
  Award,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  featuredImage?: string;
  createdAt: Date | string;
  readTime?: number;
  category?: string;
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

interface Author {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  _count: {
    posts: number;
    followers: number;
  };
}

// Loading skeleton components
const PostsSkeleton = () => (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="border-muted/20 shadow-lg animate-pulse">
        <div className="relative h-48 bg-muted rounded-t-lg"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="space-y-1">
              <div className="h-3 bg-muted rounded w-20"></div>
              <div className="h-2 bg-muted rounded w-16"></div>
            </div>
          </div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-full mb-2"></div>
          <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="h-3 bg-muted rounded w-8"></div>
              <div className="h-3 bg-muted rounded w-8"></div>
            </div>
            <div className="h-3 bg-muted rounded w-12"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const AuthorsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="text-center border-muted/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-24 mx-auto mb-1"></div>
          <div className="h-3 bg-muted rounded w-16 mx-auto mb-3"></div>
          <div className="h-3 bg-muted rounded w-full mb-2"></div>
          <div className="h-3 bg-muted rounded w-3/4 mx-auto mb-4"></div>
          <div className="flex justify-center gap-4 mb-4">
            <div className="h-3 bg-muted rounded w-12"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
          <div className="h-8 bg-muted rounded w-full"></div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const MainPostsSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border-muted/20 shadow-lg animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="space-y-1">
              <div className="h-3 bg-muted rounded w-24"></div>
              <div className="h-2 bg-muted rounded w-20"></div>
            </div>
          </div>
          <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="h-3 bg-muted rounded w-8"></div>
              <div className="h-3 bg-muted rounded w-8"></div>
            </div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [featuredAuthors, setFeaturedAuthors] = useState<Author[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);

  // Individual loading states
  const [postsLoading, setPostsLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalAuthors: 0,
    totalReads: 0,
  });
  const [email, setEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      if (!authLoading) {
        // Fetch data independently with individual loading states
        fetchPosts().catch(console.error);
        fetchFeaturedAuthors().catch(console.error);
        fetchTrendingPosts().catch(console.error);
        fetchStats().catch(console.error);
      }
    };

    initializeData();
  }, [authLoading, user, router]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setPostsLoading(true);
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (pageNum === 1) {
        setPosts(data.posts || []);
        setFilteredPosts(data.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setFilteredPosts((prev) => [...prev, ...(data.posts || [])]);
      }

      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchFeaturedAuthors = async () => {
    try {
      setAuthorsLoading(true);
      const response = await fetch("/api/authors/featured");
      if (response.ok) {
        const data = await response.json();
        setFeaturedAuthors(data.authors || []);
      }
    } catch (error) {
      console.error("Error fetching featured authors:", error);
      setFeaturedAuthors([]);
    } finally {
      setAuthorsLoading(false);
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      setTrendingLoading(true);
      const response = await fetch("/api/posts/trending");
      if (response.ok) {
        const data = await response.json();
        setTrendingPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      setTrendingPosts([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default stats values
    } finally {
      setStatsLoading(false);
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

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmail("");
        // Show success message
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
    } finally {
      setNewsletterLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  // Show auth loading only for the hero section user info
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        {/* Hero Section with Auth Loading */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
          <div className="relative z-20 container mx-auto px-4 py-20">
            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
              <div className="flex-1 text-center lg:text-left space-y-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                  <span className="text-white">Welcome to Skylink Blog</span>
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                    Stories That
                    <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Shape Minds
                    </span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-200 max-w-2xl">
                    Join thousands of writers and readers in the most engaging
                    storytelling community.
                  </p>
                </div>

                {/* Loading state for user info */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-64"></div>
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/hero.png"
                    alt="Skylink Blog Community"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Hero Section - Always visible */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>

        <div className="relative z-20 container mx-auto px-4 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
            <div className="flex-1 text-center lg:text-left space-y-8">
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-white">Welcome to Skylink Blog</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Stories That
                  <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Shape Minds
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-gray-200 max-w-2xl">
                  Join thousands of writers and readers in the most engaging
                  storytelling community. Share your voice, discover new
                  perspectives.
                </p>
              </div>

              {/* User Welcome or CTA */}
              <div className="space-y-4">
                {user ? (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12 border-2 border-white/30">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          Welcome back, {user.name}!
                        </h3>
                        <p className="text-gray-300">{user.username}</p>
                      </div>
                    </div>
                    <p className="text-gray-200 mb-4">
                      Ready to share your next story with the world?
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Start Your Journey
                    </h3>
                    <p className="text-gray-200 mb-4">
                      Join our community of passionate writers and readers
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    <Link href={user ? "/posts/new" : "/login"}>
                      <PenSquare className="mr-2 h-5 w-5" />
                      {user ? "Write Your Story" : "Join Skylink"}
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full bg-transparent"
                    asChild
                  >
                    <Link href="#featured">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Explore Stories
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero.png"
                  alt="Skylink Blog Community"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Floating Stats Cards - Show with loading or actual data */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-black rounded-full p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-black">
                          {stats.totalAuthors.toLocaleString()}+
                        </p>
                        <p className="text-sm text-gray-600">Active Writers</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-black rounded-full p-2">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-black">
                          {stats.totalReads.toLocaleString()}+
                        </p>
                        <p className="text-sm text-gray-600">Stories Read</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <Sparkles className="h-8 w-8 text-white/30" />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse">
          <Star className="h-6 w-6 text-white/20" />
        </div>
      </section>

      {/* Stats Section - Always visible */}
      <section className="py-16 bg-gradient-to-r from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-white/20 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-24 mx-auto"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {stats.totalPosts.toLocaleString()}+
                  </h3>
                  <p className="text-gray-300">Published Stories</p>
                </>
              )}
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-white/20 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-28 mx-auto"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {stats.totalAuthors.toLocaleString()}+
                  </h3>
                  <p className="text-gray-300">Creative Writers</p>
                </>
              )}
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
              <p className="text-gray-300">Countries Reached</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Posts - Show loading or content */}
      <section className="py-16 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-full mb-4">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Trending Now</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Stories Everyone's Reading
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover the most engaging content from our community
              </p>
            </div>

            {trendingLoading ? (
              <PostsSkeleton />
            ) : trendingPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trendingPosts.slice(0, 6).map((post, index) => (
                  <Card
                    key={post.id}
                    className="group hover:shadow-2xl transition-all duration-300 border-muted/20 overflow-hidden"
                  >
                    <div className="relative">
                      {post.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.featuredImage || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-black/80 text-white border-0">
                              #{index + 1} Trending
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={post.author.avatar || "/placeholder.svg"}
                            alt={post.author.name}
                          />
                          <AvatarFallback>
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {post.author.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{post.author.username}
                          </p>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post._count.comments}
                          </span>
                        </div>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime} min
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  No trending posts available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Authors - Show loading or content */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-full mb-4">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Featured Authors</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Voices That Inspire
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Meet the talented writers shaping our community
              </p>
            </div>

            {authorsLoading ? (
              <AuthorsSkeleton />
            ) : featuredAuthors.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {featuredAuthors.map((author) => (
                  <Card
                    key={author.id}
                    className="text-center hover:shadow-xl transition-all duration-300 border-muted/20"
                  >
                    <CardContent className="p-6">
                      <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-muted">
                        <AvatarImage
                          src={author.avatar || "/placeholder.svg"}
                          alt={author.name}
                        />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                          {author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="font-bold text-lg mb-1">{author.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        @{author.username}
                      </p>

                      {author.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {author.bio}
                        </p>
                      )}

                      <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-4">
                        <span>{author._count.posts} posts</span>
                        <span>{author._count.followers} followers</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        <Link
                          href={`/authors/${author.username}`}
                          className="flex items-center gap-2"
                        >
                          View Profile
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  No featured authors available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Posts Section - Show loading or content */}
      <section
        id="featured"
        className="py-16 bg-gradient-to-br from-background to-muted/10"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                <BookOpen className="inline-block mr-3 h-8 w-8" />
                Featured Stories
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Handpicked stories that showcase the best of our community
              </p>
            </div>

            {postsLoading ? (
              <PostsSkeleton />
            ) : filteredPosts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.slice(0, 6).map((post) => (
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
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  No featured posts available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Always visible */}
      <section className="py-16 bg-gradient-to-r from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
                  <Mail className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">
                    Stay Connected
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Never Miss a Story
                </h2>
                <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                  Get the best stories delivered to your inbox weekly. Join
                  thousands of readers who trust Skylink.
                </p>
              </div>

              <form
                onSubmit={handleNewsletterSignup}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                  required
                />
                <Button
                  type="submit"
                  disabled={newsletterLoading}
                  className="bg-white text-black hover:bg-gray-100 font-semibold px-8"
                >
                  {newsletterLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>

              <p className="text-sm text-gray-300 mt-4">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All Posts Section - Show loading or content */}
      <section className="py-16 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-2">
                  <Zap className="inline-block mr-3 h-8 w-8" />
                  Latest Stories
                </h2>
                <p className="text-xl text-muted-foreground">
                  Fresh perspectives from our community
                </p>
              </div>
              <div className="w-full max-w-md">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>

            {postsLoading ? (
              <MainPostsSkeleton />
            ) : filteredPosts.length > 0 ? (
              <>
                <div className="grid gap-8 lg:grid-cols-2">
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

                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={loadMore}
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 rounded-full border-2 hover:bg-black hover:text-white transition-all duration-300 bg-transparent"
                    >
                      Load More Stories
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-3xl p-12 max-w-md mx-auto">
                  <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    No Stories Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Be the pioneer and share the first story with our community!
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-black hover:bg-gray-800"
                  >
                    <Link href="/posts/new">
                      <PenSquare className="mr-2 h-5 w-5" />
                      Write First Story
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Footer - Always visible */}
      <footer className="bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white rounded-lg p-2">
                    <Sparkles className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold">Skylink Blog</h3>
                </div>
                <p className="text-gray-300 mb-6 max-w-md">
                  Empowering voices, connecting minds, and building a community
                  where every story matters. Join us in shaping the future of
                  digital storytelling.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <a href="mailto:nahomtewdorsm@gmail.com">
                      <Mail className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <a
                      href="https://www.linkedin.com/company/skylinkict/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <a
                      href="https://www.instagram.com/skylink_technologies/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  </Button>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Explore</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link
                      href="/posts"
                      className="hover:text-white transition-colors"
                    >
                      All Stories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/authors"
                      className="hover:text-white transition-colors"
                    >
                      Authors
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="hover:text-white transition-colors"
                    >
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/trending"
                      className="hover:text-white transition-colors"
                    >
                      Trending
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Community */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Community</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-white transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/guidelines"
                      className="hover:text-white transition-colors"
                    >
                      Guidelines
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/support"
                      className="hover:text-white transition-colors"
                    >
                      Support
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Skylink Blog. Crafted with ❤️ by
                Nahom Tewodros. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
