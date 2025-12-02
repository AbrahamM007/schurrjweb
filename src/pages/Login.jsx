import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Loader2, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Registration Logic
        if (securityCode !== 'schurrjweb') {
          throw new Error('Invalid Security Code. Access Denied.');
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/admin');
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-schurr-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-schurr-green/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-schurr-green to-schurr-darkGreen rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-schurr-green/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              {isLogin ? 'Admin Access' : 'Admin Registration'}
            </h1>
            <p className="text-white/40 font-mono text-sm mt-2">Schurr Journalism Web Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-white/60 mb-2">Email Command</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all placeholder:text-white/20"
                placeholder="admin@schurr.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/60 mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                />
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-bold uppercase text-schurr-green mb-2 mt-4">Master Security Code</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      required={!isLogin}
                      className="w-full p-3 bg-schurr-green/10 border border-schurr-green/50 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all placeholder:text-white/20"
                      placeholder="Enter Master Code"
                    />
                    <KeyRound size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-schurr-green" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-schurr-green text-white hover:bg-schurr-green/80 border-0 h-12 shadow-lg shadow-schurr-green/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Authenticate' : 'Register Admin')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-white/40 hover:text-white transition-colors underline"
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/20 font-mono">
              Restricted Area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
