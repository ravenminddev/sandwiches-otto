import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            userData: null,
            session: null, 
            esAdmin: false,
            isAuthenticated: false,
            loading: false,
            error: null,

            setUser: (user,Userdata, session, esAdmin) =>
                set({
                    user: user,
                    userData: Userdata,
                    session: session,
                    esAdmin: esAdmin,
                    isAuthenticated: true,
                    error: null
                }),
            
                setError: (error) => set({ error: error }),

                clearAuth: () =>
                set({
                    user: null,
                    userData: null,
                    session: null,
                    esAdmin: false,
                    isAuthenticated: false,
                    loading: false,
                    error: null
                }),

                setLoading: (loading) => set({ loading: loading })
        }),
        {
            name: "auth-storage",
        }
    )
);