import Link from "next/link";
import Image from "next/image";
import { formatDate, truncateText } from "@/lib/utils";
import { Heart, MessageCircle, User } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    excerpt?: string;
    slug: string;
    featuredImage?: string;
    createdAt: Date;
    author: {
      name: string;
      username: string;
      avatar?: string;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      {post.featuredImage && (
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <Image
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <User className="h-6 w-6" />
          )}
          <span>{post.author.name}</span>
          <span>•</span>
          <time>{formatDate(post.createdAt)}</time>
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-muted-foreground mb-4">
            {truncateText(post.excerpt, 150)}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{post._count.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post._count.comments}</span>
            </div>
          </div>

          <Link href={`/posts/${post.slug}`}>
            <span className="text-primary hover:underline text-sm">
              Read more
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
