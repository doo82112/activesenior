"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      router.push("/login?message=회원가입이 완료되었습니다. 로그인해 주세요.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 bg-card/30 p-8 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-accent/10 text-accent mb-2">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">회원가입</h1>
          <p className="text-slate-400">액티브 시니어를 위한 첫 걸음</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              <Input
                placeholder="닉네임"
                className="pl-12"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
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
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              <Input
                type="password"
                placeholder="비밀번호 확인"
                className="pl-12"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg" isLoading={isLoading}>
            가입하기
          </Button>
        </form>

        <div className="text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            로그인하기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
