import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "bg-white p-8 rounded-lg shadow w-96", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Login" }), _jsx("input", { className: "w-full border p-2 rounded mb-3", type: "email", placeholder: "Email", value: email, onChange: e => setEmail(e.target.value) }), _jsx("input", { className: "w-full border p-2 rounded mb-4", type: "password", placeholder: "Password", value: password, onChange: e => setPassword(e.target.value) }), _jsx("button", { className: "w-full bg-green-600 text-white py-2 rounded", onClick: () => signIn(email, password), children: "Sign In" })] }) }));
}
