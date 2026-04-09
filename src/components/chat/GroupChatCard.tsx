
import type { Conversation } from '@/types/chat'
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import ChatCard from './ChatCard';
import { cn } from '@/lib/utils';
import UnreadCountBadge from './UnreadConutBadge';
import GroupChatAvatar from './GroupChatAvatar';

const GroupChatCard = ({ convo }: { convo: Conversation }) => {

    const { user } = useAuthStore();
    const { activeConversationId, setActiveConversation, messages, fetchMessages } = useChatStore();

    if (!user || !user._id || !convo._id) return null;
    const unreadCount = convo.unreadCounts[user._id] || 0;
    const name = convo.group?.name ?? "";

    const handleSelectConversation = async (id: string) => {
        setActiveConversation(id);
        if (!messages[id]) {
            await fetchMessages();
        }
    };

    return (
        <ChatCard
            convoId={convo._id}
            name={name}
            timestamp={
                convo.lastMessage?.createdAt ? new Date(convo.lastMessage.createdAt) : undefined
            }
            isActive={activeConversationId === convo._id}
            onSelect={handleSelectConversation}
            unreadCount={unreadCount}
            leftSection={
                <>
                    {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
                    <GroupChatAvatar
                        type="chat"
                        participants={convo.participants}
                    />
                </>
            }
            subtitle={
                <p className={cn(
                    "text-sm truncate text-muted-foreground"
                )}>
                    {convo.participants.length} members
                </p>
            }
        />
    )
}

export default GroupChatCard