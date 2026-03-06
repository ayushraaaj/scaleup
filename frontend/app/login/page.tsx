"use client";
import { api } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [user, setUser] = useState({ username_email: "", password: "" });

    const onLogin = async () => {
        try {
            setLoading(true);
            const res = await api.post("/auth/login", user);
            toast.success(res.data.message || "Welcome back to ScaleUp");
            // Add redirect logic here (e.g., router.push("/dashboard"))
        } catch (error: any) {
            toast.error(error?.response?.data.message || "Invalid credentials");
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
            <div className="w-full max-w-sm">
                {/* Brand Header */}
                <div className="flex items-center gap-2 mb-10 justify-center">
                    <div className="h-8 w-8 bg-black flex items-center justify-center rounded-sm rotate-[-10deg]">
                        <span className="text-white font-black text-xl">S</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-black uppercase italic">
                        ScaleUp
                    </span>
                </div>

                <div className="bg-white p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold mb-6 tracking-tight">
                        Login
                    </h2>

                    <form
                        className="space-y-5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            onLogin();
                        }}
                    >
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-black border-l-4 focus:border-l-black transition-all"
                                placeholder="name@company.com"
                                value={user.username_email}
                                onChange={(e) =>
                                    setUser({
                                        ...user,
                                        username_email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-black border-l-4 focus:border-l-black transition-all"
                                placeholder="••••••••"
                                value={user.password}
                                onChange={(e) =>
                                    setUser({
                                        ...user,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={buttonDisabled || loading}
                            className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800 transition-all disabled:bg-gray-200 disabled:text-gray-400 mt-2"
                        >
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    New to ScaleUp?{" "}
                    <Link
                        href="/signup"
                        className="font-bold text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-400 transition-all"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
