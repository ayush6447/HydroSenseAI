import { useState } from 'react';
import { login } from '../api/auth';
export function useAuth() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const signIn = async (email, password) => {
        const r = await login(email, password);
        localStorage.setItem('token', r.data.access_token);
        setToken(r.data.access_token);
    };
    const signOut = () => { localStorage.removeItem('token'); setToken(null); };
    return { token, signIn, signOut, isAuthenticated: !!token };
}
