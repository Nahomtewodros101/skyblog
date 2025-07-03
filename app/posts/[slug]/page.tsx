"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, User, Edit } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"

interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  featuredImage?: string
  tags: string[]
  published: boolean
  createdAt: Date
  author: {
    id: string
    name: string
    username: string
    avatar?: string
    bio?: string
  }
  comments: Array<{
    id: string
    content: string
    createdAt: Date
    author: {
      name: string
      username: string
      avatar?: string
    }
  }>
  likes: Array<{
    user: {
      name: string
      username: string
    }
  }>
  _count: {
    likes: number
    comments: number
  }
}

export default function PostPage() {
  const params = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchPost()
    }
  }, [params.slug])

  useEffect(() => {
    if (post && user) {
      const userLiked = post.likes.some((like) => like.user.username === user.username)
      setLiked(userLiked)
    }
  }, [post, user])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        toast.error("Post not found")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      toast.error("Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts")
      return
    }

    try {
      const response = await fetch(`/api/posts/${params.slug}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        // Refresh post to get updated like count
        fetchPost()
        toast.success(data.message)
      } else {
        toast.error("Failed to toggle like")
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("Failed to toggle like")
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to comment")
      return
    }

    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/posts/${params.slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ content: commentContent }),
      })

      if (response.ok) {
        setCommentContent("")
        fetchPost() // Refresh to show new comment
        toast.success("Comment added successfully")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add comment")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The post you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const canEdit = user && (user.id === post.author.id || user.role === "ADMIN")

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {post.featuredImage && (
          <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
            <Image src={post.featuredImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">@{post.author.username}</p>
                <p className="text-sm text-muted-foreground">{formatDate(new Date(post.createdAt))}</p>
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center space-x-2">
                <Link href={`/posts/${post.slug}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none mb-8">
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>

        <div className="flex items-center space-x-6 py-6 border-y">
          <Button
            variant="ghost"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${liked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            <span>{post._count.likes}</span>
          </Button>

          <div className="flex items-center space-x-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span>{post._count.comments}</span>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Comments ({post._count.comments})</h2>

          {user && (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows={4}
                className="mb-4"
              />
              <Button type="submit" disabled={submittingComment}>
                {submittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          )}

          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                {comment.author.avatar ? (
                  <Image
                    src={comment.author.avatar || "/placeholder.svg"}
                    alt={comment.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="font-medium">{comment.author.name}</p>
                    <p className="text-sm text-muted-foreground">@{comment.author.username}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(new Date(comment.createdAt))}</p>
                  </div>
                  <p className="text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {post.comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </section>
      </article>
    </div>
  )
}
