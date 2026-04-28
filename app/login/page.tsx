'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '../../lib/supabase/client';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginPage() {
  const router = useRouter();

  const supabase = useMemo(() => createClientSupabase(), []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const onChange = (handler: React.Dispatch<React.SetStateAction<string>>, e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    handler(e.target.value);
  };

  const handleSubmit = async () => {
    if (!username || !password) return;
    if (!emailRegex.test(username)) {
      setError('Invalid email format');
      return;
    }
    try {
      const { data, error } = isNewUser
        ? await supabase.auth.signUp({ email: username, password })
        : await supabase.auth.signInWithPassword({ email: username, password });
      if (error) throw error;
      if (isNewUser) {
        setIsNewUser(false);
        setError('User created! Verify your email.');
      }
      if (data.session) {
        router.push('/chats');
      }
    } catch (e: { message: string } | any) {
      console.error(e);
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-sm w-full p-6 bg-white rounded-2xl shadow-md space-y-4">
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => onChange(setUsername, e)}
          placeholder="Username"
        />

        <input
          type="password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => onChange(setPassword, e)}
          placeholder="Password"
        />
        {error && <div className="text-red-500">{error}</div>}
        <button
          className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          onClick={() => setIsNewUser(!isNewUser)}
        >
          {isNewUser ? 'Back to Sign in' : 'Sign up'}
        </button>

        <button
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={handleSubmit}
        >
          {isNewUser ? 'Create new user' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
