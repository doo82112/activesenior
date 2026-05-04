"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("이메일 또는 비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 bg-card/30 p-8 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-accent/10 text-accent mb-2">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">로그인</h1>
          <p className="text-slate-400">다시 만나서 반갑습니다!</p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              <Input
                type="email"
                placeholder="이메일 주소"
                className="pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              <Input
                type="password"
                placeholder="비밀번호"
                className="pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg" isLoading={isLoading}>
            로그인하기
          </Button>
        </form>

        <div className="text-center text-sm text-slate-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-accent hover:underline font-medium">
            무료 회원가입
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
