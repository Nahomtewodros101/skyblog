import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"
import { commentSchema } from "@/lib/validations"

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const body = await request.json()
    const { content } = commentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        postId: post.id,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
