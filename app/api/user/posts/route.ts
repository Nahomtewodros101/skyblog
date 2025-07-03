import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const totalPosts = await prisma.post.count({
      where: { authorId: user.id },
    })

    const hasMore = skip + limit < totalPosts

    return NextResponse.json({
      posts,
      hasMore,
      total: totalPosts,
    })
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
