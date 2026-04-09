import { useAuthStore } from '@/stores/useAuthStore';
import  { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { accessToken, user, loading, fetchMe, refresh } = useAuthStore();
    const [starting, setStarting] = useState(true);


    useEffect(() => {
        const init = async () => {
            try {
                let token = accessToken;

                if (!token) {
                    token = await refresh();
                }

                if (token && !user) {
                    await fetchMe();
                }
            } catch (error) {
                console.log(error);
            } finally {
                setStarting(false);
            }
        };

        init();

    }, []);

    if (starting || loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!accessToken || !user) {
        return <Navigate to="/signin" replace />;
    }
    return (
        <>
            <Outlet>

            </Outlet>
        </>
    )
}

export default ProtectedRoute;