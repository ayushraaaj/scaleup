"use client";
import { api } from "@/services/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const Signup = () => {
    const router = useRouter();
    const [user, setUser] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true);

    const onSignup = async () => {
        try {
            setLoading(true);

            const res = await api.post("/auth/signup", user);
            toast.success("Welcome to ScaleUp!");

            setTimeout(() => router.push("/login"), 1000);
        } catch (error: any) {
            toast.error(error?.response?.data.message || "Failed to scale up");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const isFormValid = Object.values(user).every(
            (val) => val.trim().length > 0,
        );
        setButtonDisabled(!isFormValid);
    }, [user]);

    return (
        <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 mb-12">
                    <div className="h-8 w-8 bg-black flex items-center justify-center rounded-sm rotate-[-10deg]">
                        <span className="text-white font-black text-xl">S</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-black uppercase italic">
                        ScaleUp
                    </span>
                </div>

                <div className="space-y-2 mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        Create your account
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Elevate your content and start monetizing your
                        expertise.
                    </p>
                </div>

                <form
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSignup();
                    }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Full Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-black border-l-4 focus:border-l-black transition-all"
                                placeholder="Ayush Raj"
                                value={user.fullname}
                                onChange={(e) =>
                                    setUser({
                                        ...user,
                                        fullname: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-black border-l-4 focus:border-l-black transition-all"
                                placeholder="ayush123"
                                value={user.username}
                                onChange={(e) =>
                                    setUser({
                                        ...user,
                                        username: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-black border-l-4 focus:border-l-black transition-all"
                            placeholder="ayush@scaleup.com"
                            value={user.email}
                            onChange={(e) =>
                                setUser({ ...user, email: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-black border-l-4 focus:border-l-black transition-all"
                            placeholder="••••••••"
                            value={user.password}
                            onChange={(e) =>
                                setUser({ ...user, password: e.target.value })
                            }
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={buttonDisabled || loading}
                            className="w-full bg-black text-white py-4 font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400"
                        >
                            {loading ? "Joining..." : "Join ScaleUp"}
                            {!loading && (
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-gray-600">
                        Already part of the network?{" "}
                        <Link
                            href="/login"
                            className="font-bold text-black border-b-2 border-black pb-0.5 hover:text-gray-600 hover:border-gray-400 transition-all"
                        >
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
