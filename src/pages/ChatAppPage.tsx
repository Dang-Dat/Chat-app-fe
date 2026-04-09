import React, { useEffect } from 'react'
import Logout from '@/components/auth/LogOut'
import { useAuthStore } from '@/stores/useAuthStore'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import ChatWindowLayout from '@/components/chat/ChatWindowLayout'
import FriendRequestDialog from '@/components/friendRequest/FriendRequestDialog'
import { useFriendStore } from '@/stores/useFriendStore'
import { useChatStore } from '@/stores/useChatStore'

const ChatAppPage = () => {
    const user = useAuthStore((state) => state.user);
    const { isOpenRequestDialog, setOpenRequestDialog, getFriends, getAllFriendRequests } = useFriendStore();
    const { fetchConversations } = useChatStore();

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchConversations(),
                getFriends(),
                getAllFriendRequests()
            ]);
        };
        init();
    }, [fetchConversations, getFriends, getAllFriendRequests]);

    return (

        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-1 flex-col">
                    <ChatWindowLayout />
                </div>
            </SidebarInset>
            <FriendRequestDialog open={isOpenRequestDialog} setOpen={setOpenRequestDialog} />
        </SidebarProvider>

    )
}


export default ChatAppPage;