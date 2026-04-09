import { useAuthStore } from "@/stores/useAuthStore";
import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

const Logout = () => {
    const { signOut, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/signin");
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <Button variant="completeGhost" onClick={handleLogout} disabled={loading}>
            <LogOut className="text-destructive" />
            Log out
        </Button>
    )
};
export default Logout;