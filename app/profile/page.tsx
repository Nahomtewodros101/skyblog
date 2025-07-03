"use client"

import { useEffect, useState } from "react"

import { useAuth } from "@/contexts/AuthContext"

import { useRouter } from "next/navigation"

import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { userUpdateSchema, type UserUpdateInput } from "@/lib/validations"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"

import { PostCard } from "@/components/PostCard"

import { User, Edit } from "lucide-react"

import toast from "react-hot-toast"

import Link from "next/link"

interface UserPost {
  id: string

  title: string

  excerpt?: string

  slug: string

  featuredImage?: string

  createdAt: Date

  published: boolean

  _count: {
    likes: number

    comments: number
  }
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()

  const router = useRouter()

  const [posts, setPosts] = useState<UserPost[]>([])

  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)

  const [updating, setUpdating] = useState(false)

  const {
    register,

    handleSubmit,

    formState: { errors },

    reset,
  } = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")

      return
    }

    if (user) {
      reset({
        name: user.name,

        bio: user.bio || "",

        avatar: user.avatar || "",
      })

      fetchUserPosts()
    }
  }, [user, isLoading, router, reset])

  const fetchUserPosts = async () => {
    try {
      const response = await fetch("/api/user/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })

      const data = await response.json()

      setPosts(data.posts)
    } catch (error) {
      console.error("Error fetching user posts:", error)

      toast.error("Failed to fetch your posts")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UserUpdateInput) => {
    setUpdating(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },

        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")

        setEditing(false)

        // You might want to update the user context here
      } else {
        const result = await response.json()

        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-24 h-24 bg-muted rounded-full"></div>

            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48"></div>

              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg border p-8 mb-8">
          {/* Edit button at top on mobile, hidden on desktop */}

          <div className="flex justify-end mb-4 md:hidden">
            <Button variant="outline" onClick={() => setEditing(!editing)}>
              <Edit className="h-4 w-4 mr-2" />

              {editing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6 flex-1 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-24 h-24 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-12 w-12" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold truncate">{user.name}</h1>

                <p className="text-muted-foreground truncate">@{user.username}</p>

                <p className="text-muted-foreground text-sm truncate">{user.email}</p>

                {user.bio && <p className="mt-2 text-sm md:text-base">{user.bio}</p>}
              </div>
            </div>

            {/* Edit button on desktop, hidden on mobile */}

            <div className="hidden md:block ml-4">
              <Button variant="outline" onClick={() => setEditing(!editing)}>
                <Edit className="h-4 w-4 mr-2" />

                {editing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>

          {editing && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>

                <Input id="name" {...register("name")} className={errors.name ? "border-destructive" : ""} />

                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
                  Bio
                </label>

                <Textarea id="bio" {...register("bio")} className={errors.bio ? "border-destructive" : ""} rows={3} />

                {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium mb-2">
                  Avatar URL
                </label>

                <Input
                  id="avatar"
                  type="url"
                  {...register("avatar")}
                  className={errors.avatar ? "border-destructive" : ""}
                />

                {errors.avatar && <p className="text-destructive text-sm mt-1">{errors.avatar.message}</p>}
              </div>

              <div className="flex items-center space-x-4">
                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Update Profile"}
                </Button>

                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Posts ({posts.length})</h2>

            <Button asChild>
              <Link href="/posts/new">Write New Post</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <PostCard
                  post={{
                    ...post,

                    author: {
                      name: user.name,

                      username: user.username,

                      avatar: user.avatar,
                    },
                  }}
                />

                {!post.published && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Draft</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't written any posts yet.</p>

              <Button asChild>
                <a href="/posts/new">Write Your First Post</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
