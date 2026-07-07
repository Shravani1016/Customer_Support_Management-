"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Profile = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export default function ProfileModule() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile/");
      setProfile(res.data);
      setFullName(res.data.full_name);
    } catch {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async () => {
    try {
      await api.put("/api/profile/", {
        full_name: fullName,
      });

      toast.success("Profile updated");
      fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Both password fields are required");
      return;
    }

    try {
      await api.patch("/api/profile/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password");
    }
  };

  if (!profile) {
    return <div className="text-white">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          My Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View and update your account details.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Profile Details</h2>

        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-black"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            value={profile.email}
            disabled
            className="w-full border rounded-lg px-4 py-2 text-gray-500 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Role</label>
          <input
            value={profile.role}
            disabled
            className="w-full border rounded-lg px-4 py-2 text-gray-500 bg-gray-100"
          />
        </div>

        <button
          onClick={updateProfile}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Save Profile
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>

        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-black"
        />

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-black"
        />

        <button
          onClick={changePassword}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}