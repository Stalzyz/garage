"use client"

import { useState } from "react"
import { User, Lock, Bell, Save } from "lucide-react"
import { toast } from "sonner"

export default function ResellerSettingsPage() {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@apexautonetwork.com",
    phone: "+91 98000 11223",
    companyName: "Apex Auto Network LLC",
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
  })

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Profile details updated!")
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New password and confirm password do not match.")
      return
    }
    toast.success("Password changed successfully!")
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  return (
    <div className="p-8 space-y-8 bg-dash-bg-base text-white min-h-screen font-sans max-w-3xl">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage your reseller account profile, security, and notification preferences.</p>
      </div>

      {/* Profile Section */}
      <form onSubmit={handleSaveProfile} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" /> Profile Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Your Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Phone Number</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Company Name</label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-5 py-2 rounded-xl">
            Save Profile
          </button>
        </div>
      </form>

      {/* Password Section */}
      <form onSubmit={handleChangePassword} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" /> Security & Password
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-5 py-2 rounded-xl">
            Change Password
          </button>
        </div>
      </form>

      {/* Notifications */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-400" /> Notifications
        </h2>

        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <span className="font-semibold text-white block">Email Notifications</span>
            <span className="text-zinc-400">Receive email alerts for new garage signups, sales, and renewals.</span>
          </div>

          <button
            onClick={() => {
              setNotifications({ emailNotifications: !notifications.emailNotifications })
              toast.info(`Email notifications toggled ${!notifications.emailNotifications ? "ON" : "OFF"}`)
            }}
            className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${
              notifications.emailNotifications ? "bg-purple-600 justify-end" : "bg-white/10 justify-start"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

    </div>
  )
}
