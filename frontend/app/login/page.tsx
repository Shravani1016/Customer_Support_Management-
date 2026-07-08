'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

type Tab = 'admin' | 'employee';
type View = 'login' | 'forgot' | 'otp' | 'reset';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('admin');
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const router = useRouter();

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    await login(email, password, rememberMe);
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    const me = await api.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const role = me.data.role;

    if (rememberMe) {
      localStorage.setItem("user", JSON.stringify(me.data));
    } else {
      sessionStorage.setItem("user", JSON.stringify(me.data));
    }

    if (tab === "admin") {
      if (role === "super_admin") {
        router.push("/super-admin/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        setError(`You are not allowed. Your role is: ${role}`);
      }
    } else {
      if (role === "manager" || role === "sales_rep") {
        router.push("/dashboard");
      } else {
        setError(`Please use Admin Login. Your role is: ${role}`);
      }
    }
  } catch (err: any) {
    setError(err?.response?.data?.detail || "Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/verify-otp', { email, otp });
      setView('reset');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
      });

      setSuccess('Password reset successfully! Please login.');
      setView('login');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-2xl font-bold">C</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">CRM App</h1>
      </div>

      {view === "login" && (
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab("admin");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "admin"
                ? "bg-white shadow text-blue-600"
                : "text-gray-500"
            }`}
          >
            🔐 Admin Login
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("employee");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "employee"
                ? "bg-white shadow text-blue-600"
                : "text-gray-500"
            }`}
          >
            👤 Employee Login
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {view === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                tab === "admin" ? "admin@crm.com" : "employee@company.com"
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-14 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : `Sign In as ${tab === "admin" ? "Admin" : "Employee"}`}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("forgot");
              setError("");
              setSuccess("");
            }}
            className="w-full text-center text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </form>
      )}

      {view === "forgot" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {tab === "admin"
              ? "🔗 Admin Password Reset"
              : "📧 Employee Password Reset"}
          </h2>

          <p className="text-sm text-gray-500">
            {tab === "admin"
              ? "Enter your admin email. We will send a reset link."
              : "Enter your email. We will send an OTP to reset your password."}
          </p>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : tab === "admin"
              ? "Send Reset Link"
              : "Send OTP"}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("login");
              setError("");
              setSuccess("");
            }}
            className="w-full text-center text-sm text-gray-500 hover:underline"
          >
            ← Back to Login
          </button>
        </form>
      )}

      {view === "otp" && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Enter OTP</h2>

          <p className="text-sm text-gray-500">
            Enter the 6-digit OTP sent to <strong>{email}</strong>
          </p>

          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("forgot");
              setError("");
            }}
            className="w-full text-center text-sm text-gray-500 hover:underline"
          >
            ← Resend OTP
          </button>
        </form>
      )}

      {view === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Set New Password
          </h2>

          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  </div>
);
}