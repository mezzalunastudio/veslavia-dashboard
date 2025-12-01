"use client"

import {
  CreditCard,
  EllipsisVertical,
  LogOut,
  BellDot,
  CircleUser,
} from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, logout, loading, refreshUser } = useAuth() 
  const router = useRouter()

  // Pindahkan useEffect ke sini (di tingkat atas komponen)
  useEffect(() => {
    if (!user && !loading) {
      console.log('NavUser: No user data, attempting refresh...');
      refreshUser();
    }
  }, [user, loading, refreshUser]);

  const HandleLogout = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default link behavior
    e.stopPropagation() // Prevent event bubbling
    
    try {
      await logout()
      // Redirect will be handled by AuthContext
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user || loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="cursor-pointer opacity-50 animate-pulse"
            disabled
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <div className="h-4 w-4 bg-muted-foreground/20 rounded-full" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium bg-muted-foreground/20 rounded h-4 w-24 mb-1"></span>
              <span className="text-muted-foreground truncate text-xs bg-muted-foreground/20 rounded h-3 w-32"></span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {user.name ? (
                  <span className="text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Logo size={20} />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {user.name ? (
                    <span className="text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Logo size={20} />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.name || 'User'}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                  <span className="text-muted-foreground truncate text-xs capitalize">
                    {user.role} • {user.verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings/account">
                  <CircleUser className="mr-2 h-4 w-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings/notifications">
                  <BellDot className="mr-2 h-4 w-4" />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={HandleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}