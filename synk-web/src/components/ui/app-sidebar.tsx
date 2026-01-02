import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Bell, LogOut, Sparkles } from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader />

      <SidebarContent />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="rounded-lg">AP</AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Aditya Patil</span>
                    <span className="truncate text-xs">aditya@email.com</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56"
                side="right"
                align="end"
                sideOffset={4}
              >
                {/* 🔹 USER INFO (TOP) */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatar.png" alt="shadcn" />
                    <AvatarFallback className="rounded-lg">SH</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col text-sm leading-tight">
                    <span className="font-semibold">shadcn</span>
                    <span className="text-xs text-muted-foreground">
                      m@example.com
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>

                {/* <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem> */}

                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
