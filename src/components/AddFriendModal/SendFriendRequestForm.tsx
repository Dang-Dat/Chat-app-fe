import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModal";
import { Label } from "../ui/label";
import { DialogFooter, DialogClose, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface SendFriendRequestFormProps {
    register: UseFormRegister<IFormValues>;
    errors?: FieldErrors<IFormValues>;
    loading: boolean;
    searchedUsername: string;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    onBack: () => void;
}

const SendFriendRequestForm = ({
    register,
    errors,
    loading,
    searchedUsername,
    onSubmit,
    onBack,
}: SendFriendRequestFormProps) => {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Send friend request</DialogTitle>
                <DialogDescription>
                    You are sending a request to <span className="font-semibold text-primary">@{searchedUsername}</span>
                </DialogDescription>
            </DialogHeader>

            <form
                onSubmit={onSubmit}
                className="space-y-4"
            >
                <div className="space-y-2">
                    <Label
                        htmlFor="message"
                        className="text-sm font-semibold"
                    >
                        Message
                    </Label>

                    <Textarea
                        id="message"
                        placeholder="Say something to get started..."
                        className="glass border-border/50 focus:border-primary/50 min-h-[100px] transition-smooth resize-none"
                        {...register("message")}
                    />
                    {errors?.message && (
                        <p className="error-message">{errors.message.message}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="glass hover:bg-muted"
                        onClick={onBack}
                        disabled={loading}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    
                    <DialogClose render={<Button type="button" variant="outline" className="flex-1 glass" />}>
                        Cancel
                    </DialogClose>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
                    >
                        {loading ? (
                            <span>Sending...</span>
                        ) : (
                            <>
                                <UserPlus className="size-4 mr-2" /> Add Friend
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
};

export default SendFriendRequestForm;
