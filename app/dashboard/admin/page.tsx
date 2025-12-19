"use client";

import { Users, ShieldCheck, AlertCircle, DollarSign } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-border">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-muted-foreground truncate">Total Users</dt>
                                    <dd className="text-2xl font-semibold text-foreground">1,234</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-teal-800"> View all </a>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-border">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ShieldCheck className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-muted-foreground truncate">Verified Providers</dt>
                                    <dd className="text-2xl font-semibold text-foreground">56</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted px-5 py-3">
                        <div className="text-sm">
                            <a href="/dashboard/admin/providers" className="font-medium text-primary hover:text-teal-800"> Manage providers </a>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-border">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-muted-foreground truncate">Pending Verifications</dt>
                                    <dd className="text-2xl font-semibold text-foreground">12</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-teal-800"> Review requests </a>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-border">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-muted-foreground truncate">Total Traffic</dt>
                                    <dd className="text-2xl font-semibold text-foreground">45k</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-teal-800"> View analytics </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-sm rounded-lg border border-border">
                <div className="px-4 py-5 sm:px-6 border-b border-border">
                    <h3 className="text-lg leading-6 font-medium text-foreground">Recent Activity</h3>
                </div>
                <ul className="divide-y divide-border">
                    {[1, 2, 3].map((item) => (
                        <li key={item} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary truncate">New Provider Application</p>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Just now
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-muted-foreground">
                                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                                        Plumbing Services Co.
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
