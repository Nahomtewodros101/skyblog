"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "./ui/button"
import { User, LogOut, Settings, PenTool } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              SkyBlog
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
                <Link href="/posts/new">
                  <Button variant="ghost" size="sm">
                    <PenTool className="h-4 w-4 mr-2" />
                    Write
                  </Button>
                </Link>

                {user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>

                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
