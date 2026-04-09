import { toast } from "sonner";
import type { Conversation } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ImagePlus, Send, Smile } from "lucide-react";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {

    const { user } = useAuthStore();
    const { sendDirectMessage, sendGroupMessage } = useChatStore();
    const [value, setValue] = useState("");

    if (!user) return;

    const sendMessage = async () => {
        if (!value.trim()) return;
        const currValue = value;
        setValue("");
        try {
            if (selectedConvo.type === "direct") {
                const otherUser = selectedConvo.participants
                    .filter((p) => (p._id || p.id) !== (user._id || user.id))[0];

                await sendDirectMessage((otherUser._id || otherUser.id || otherUser.userId)!, currValue);
            } else {
                await sendGroupMessage((selectedConvo._id || selectedConvo.id)!, currValue);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message!");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
            <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 transition-smooth"
            >
                <ImagePlus className="size-4" />
            </Button>

            <div className="flex-1 relative">
                <Input
                    onKeyPress={handleKeyPress}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
                ></Input>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 hover:bg-primary/10 transition-smooth"
                            >
                                <Smile className="size-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-auto p-0 border-none shadow-xl">
                            <EmojiPicker
                                onChange={(emoji: string) => setValue(v => v + emoji)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <Button
                onClick={sendMessage}
                className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
                disabled={!value.trim()}
            >
                <Send className="size-4 text-white" />
            </Button>
        </div>
    )
}

export default MessageInput