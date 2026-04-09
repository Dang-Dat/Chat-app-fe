import * as React from "react"


import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Moon, Sun } from "lucide-react"
import { Switch } from "../ui/switch";
import CreateNewChat from "../chat/CreateNewChat";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import GroupChatList from "../chat/GroupChatList";
import ConversationSkeleton from "../skeleton/ConversationSkeleton";
import AddFriendModal from "../chat/AddFriendModal";
import DirectMessageList from "../chat/DirectMessageList";
import { useThemeStore } from "@/stores/useThemeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { loading: convoLoading } = useChatStore();

  return (
    <Sidebar
      variant="inset"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<div />}
              className="bg-gradient-primary h-auto py-3 hover:bg-gradient-primary"
            >
              <div className="flex w-full items-center px-4 justify-between transition-smooth">
                <h1 className="text-xl font-bold text-white tracking-tight italic select-none">DX</h1>
                <div 
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Sun className={`size-4 ${isDark ? 'text-white/40' : 'text-white'} transition-colors`} />
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    className="data-[checked]:bg-white/40 data-[unchecked]:bg-white/20"
                  />
                  <Moon className={`size-4 ${!isDark ? 'text-white/40' : 'text-white'} transition-colors`} />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel className="uppercase text-xs font-bold tracking-widest text-muted-foreground/70">
              GROUPS
            </SidebarGroupLabel>
            <NewGroupChatModal />
          </div>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <GroupChatList />}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel className="uppercase text-xs font-bold tracking-widest text-muted-foreground/70">
              FRIENDS
            </SidebarGroupLabel>
            <SidebarGroupAction
              title="Add Friend"
              className="cursor-pointer"
            >
              <AddFriendModal />
            </SidebarGroupAction>
          </div>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <DirectMessageList />}
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>


      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
