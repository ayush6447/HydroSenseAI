import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn } = useAuth()
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow w-96">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <input className="w-full border p-2 rounded mb-3" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded mb-4" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-green-600 text-white py-2 rounded" onClick={() => signIn(email, password)}>Sign In</button>
      </div>
    </div>
  )
}
