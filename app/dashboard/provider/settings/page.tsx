"use client";

import { Bell, Lock, User, Mail, Shield } from "lucide-react";
import { useState } from "react";

export default function ProviderSettings() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        jobUpdates: true,
        marketing: false
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>

            {/* Notification Settings */}
            <div className="bg-white shadow-sm rounded-lg border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground">Notifications</h2>
                            <p className="text-sm text-muted-foreground">Choose how you want to be notified.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates via email.</p>
                        </div>
                        <button
                            onClick={() => toggleNotification('email')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${notifications.email ? "bg-primary" : "bg-gray-200"}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.email ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>
                    <div className="border-t border-border pt-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive real-time notifications on your device.</p>
                        </div>
                        <button
                            onClick={() => toggleNotification('push')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${notifications.push ? "bg-primary" : "bg-gray-200"}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.push ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>
                    <div className="border-t border-border pt-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive urgent job alerts via text message.</p>
                        </div>
                        <button
                            onClick={() => toggleNotification('sms')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${notifications.sms ? "bg-primary" : "bg-gray-200"}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications.sms ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white shadow-sm rounded-lg border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-foreground">Account</h2>
                            <p className="text-sm text-muted-foreground">Manage your account information.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">Change Email</p>
                                <p className="text-sm text-muted-foreground">Update your email address.</p>
                            </div>
                        </div>
                        <span className="text-primary text-sm font-medium">Update</span>
                    </button>
                    <div className="border-t border-border" />
                    <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">Change Password</p>
                                <p className="text-sm text-muted-foreground">Update your password securely.</p>
                            </div>
                        </div>
                        <span className="text-primary text-sm font-medium">Update</span>
                    </button>
                    <div className="border-t border-border" />
                    <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                            </div>
                        </div>
                        <span className="text-primary text-sm font-medium">Enable</span>
                    </button>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted">
                    Cancel
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-teal-800">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
