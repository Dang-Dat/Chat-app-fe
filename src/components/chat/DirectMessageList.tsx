
import { useChatStore } from '@/stores/useChatStore'
import DirectMessageCard from './DirectMessageCard';
const DirectMessageList = () => {
    const { conversations } = useChatStore();

  if(!conversations) return;
  const directConversations = conversations.filter((conversation) => conversation.type === "direct");

    return (
        <div className='flex-1 overflow-y-auto p-2 space-y-2'>
            {directConversations.map((conversation) => (
                <DirectMessageCard convo={conversation} key={conversation._id} />
            ))}
        </div>
    )
}

export default DirectMessageList