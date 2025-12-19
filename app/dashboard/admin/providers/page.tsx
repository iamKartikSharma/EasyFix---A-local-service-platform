"use client";

import { useState } from "react";
import { User, Trash2, UserPlus, MoreVertical, Search, CheckCircle, XCircle } from "lucide-react";

// Mock Data
const initialProviders = [
    { id: 1, name: "John Smith", email: "john@example.com", service: "Plumber", status: "Verified", joined: "2023-01-15" },
    { id: 2, name: "Clean Co.", email: "info@cleanco.com", service: "Cleaner", status: "Verified", joined: "2023-02-10" },
    { id: 3, name: "FixIt Fast", email: "contact@fixit.com", service: "Repair", status: "Pending", joined: "2023-03-05" },
    { id: 4, name: "Electric Avenue", email: "support@electric.com", service: "Electrician", status: "Verified", joined: "2023-03-12" },
];

export default function ManageProviders() {
    const [providers, setProviders] = useState(initialProviders);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProvider, setNewProvider] = useState({ name: "", email: "", service: "" });

    // Kick / Remove Provider
    const handleKick = (id: number) => {
        if (confirm("Are you sure you want to remove this provider? This action cannot be undone.")) {
            setProviders(providers.filter(p => p.id !== id));
        }
    };

    // Add Provider
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const provider = {
            id: providers.length + 1,
            name: newProvider.name,
            email: newProvider.email,
            service: newProvider.service,
            status: "Pending",
            joined: new Date().toISOString().split('T')[0]
        };
        setProviders([...providers, provider]);
        setIsAddModalOpen(false);
        setNewProvider({ name: "", email: "", service: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">Manage Providers</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-teal-800 transition-colors"
                >
                    <UserPlus className="h-4 w-4" />
                    Add Provider
                </button>
            </div>

            {/* Provider List Table */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search providers..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border">
                            {providers.map((provider) => (
                                <tr key={provider.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                                {provider.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-foreground">{provider.name}</div>
                                                <div className="text-sm text-muted-foreground">{provider.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-foreground">{provider.service}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${provider.status === "Verified"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {provider.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {provider.joined}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleKick(provider.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                        >
                                            Kick / Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Provider Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAddModalOpen(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleAdd}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-foreground mb-4">Add New Provider</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Provider Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full border-border border rounded-md p-2"
                                                value={newProvider.name}
                                                onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full border-border border rounded-md p-2"
                                                value={newProvider.email}
                                                onChange={e => setNewProvider({ ...newProvider, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Service Type</label>
                                            <select
                                                className="w-full border-border border rounded-md p-2"
                                                value={newProvider.service}
                                                onChange={e => setNewProvider({ ...newProvider, service: e.target.value })}
                                            >
                                                <option value="">Select Service</option>
                                                <option value="Plumber">Plumber</option>
                                                <option value="Electrician">Electrician</option>
                                                <option value="Carpenter">Carpenter</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-teal-800 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Add Provider
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
