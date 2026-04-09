import { SidebarInset } from "../ui/sidebar"
import ChatWindowHeader from "./ChatWindowHeader"


const ChatWelcomeScreen = () => {
    return (
        <SidebarInset className="flex w-full h-full bg-transparent">
            <ChatWindowHeader />
            <div className="flex bg-primary-foreground rounded-2xl flex-1 items-center justify-center">
                <div className="text-center">

                    <h2 className="text-2xl font-bold mb-2 text-transparent">
                        Welcome to DX CHAT!
                    </h2>
                    <p className="text-muted-foreground">
                        Choose a conversation to start chatting!
                    </p>
                </div>
            </div>
        </SidebarInset>
    )
}

export default ChatWelcomeScreen
