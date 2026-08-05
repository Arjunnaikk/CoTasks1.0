'use client'

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useGetUserSettingsQuery } from "@/services/queries";
import { useUpdateUserSettingsMutation } from "@/services/mutations";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ShieldAlert } from "lucide-react";

const NotificationSection = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const userEmail = session?.user?.email;

  const { data: settings, isLoading, error } = useGetUserSettingsQuery(userEmail);
  const updateSettingsMutation = useUpdateUserSettingsMutation();

  const [prefs, setPrefs] = useState({
    emailRemindersEnabled: true,
    personalEmailRemindersEnabled: true,
    groupEmailRemindersEnabled: true,
  });

  // Sync state once data loads
  useEffect(() => {
    if (settings) {
      setPrefs({
        emailRemindersEnabled: !!settings.email_reminders_enabled,
        personalEmailRemindersEnabled: !!settings.personal_email_reminders_enabled,
        groupEmailRemindersEnabled: !!settings.group_email_reminders_enabled,
      });
    }
  }, [settings]);

  const handleToggle = (key) => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!userEmail) return;

    try {
      await updateSettingsMutation.mutateAsync({
        userGmail: userEmail,
        emailRemindersEnabled: prefs.emailRemindersEnabled,
        personalEmailRemindersEnabled: prefs.personalEmailRemindersEnabled,
        groupEmailRemindersEnabled: prefs.groupEmailRemindersEnabled,
      });

      toast({
        title: "Settings Saved",
        description: "Your notification reminder settings have been updated.",
        variant: "dark",
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
        <p className="text-xs">Loading notification preferences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-400 text-center">
        <ShieldAlert className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-xs">Failed to load notification settings.</p>
      </div>
    );
  }

  return (
    <div className="text-white w-full max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Notification Settings</h3>
        <p className="text-zinc-400 text-xs mt-1">Configure how and when you receive task reminders and updates.</p>
      </div>

      {/* Main Mail Toggles Card */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden p-6 space-y-6">
        {/* Master Email Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-550/20 text-purple-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-200">Email Task Reminders</span>
              <span className="text-xs text-zinc-500 mt-0.5">Receive email reminders when your tasks are due or overdue.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("emailRemindersEnabled")}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              prefs.emailRemindersEnabled ? 'bg-purple-650' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                prefs.emailRemindersEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sub-Toggles (Only active if master toggle is enabled) */}
        <div className={`space-y-5 transition-all duration-300 ${
          prefs.emailRemindersEnabled ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'
        }`}>
          {/* Personal Task Toggle */}
          <div className="flex items-center justify-between pl-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-200">Personal Tasks Alerts</span>
              <span className="text-[11px] text-zinc-500 mt-0.5">Receive email warnings for tasks created in your personal lists.</span>
            </div>
            <button
              type="button"
              disabled={!prefs.emailRemindersEnabled}
              onClick={() => handleToggle("personalEmailRemindersEnabled")}
              className={`relative inline-flex h-4.5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.personalEmailRemindersEnabled ? 'bg-purple-650/80' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.personalEmailRemindersEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Group Task Toggle */}
          <div className="flex items-center justify-between pl-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-200">Group/Team Tasks Alerts</span>
              <span className="text-[11px] text-zinc-500 mt-0.5">Receive email warnings for collaborative team tasks assigned to you.</span>
            </div>
            <button
              type="button"
              disabled={!prefs.emailRemindersEnabled}
              onClick={() => handleToggle("groupEmailRemindersEnabled")}
              className={`relative inline-flex h-4.5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.groupEmailRemindersEnabled ? 'bg-purple-650/80' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.groupEmailRemindersEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-xs h-9 px-5 rounded-xl shadow-md flex items-center justify-center active:scale-95 duration-150 cursor-pointer"
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default NotificationSection;
