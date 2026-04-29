"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user?.id).single();

      router.push(profile?.user_type === "chef" ? "/chef-dashboard" : "/user-dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full animate-in fade-in slide-in-from-bottom-4 duration-700", className)} {...props}>
      <div className="space-y-12">
        <div className="space-y-3">
          <h2 className="text-5xl font-mono text-foreground tracking-tight">
            Log <span className="italic text-primary">In</span>
          </h2>
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground font-bold">
            Enter your credentials
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-12">
          <div className="space-y-10">
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all text-lg placeholder:text-muted-foreground/20 px-4"
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">
                  Password
                </Label>
                <Link href="/auth/forgot-password" className="text-[10px] uppercase tracking-widest text-primary font-bold hover:opacity-70 transition-opacity">
                  Forgot Password? 
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all text-lg px-4 pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary focus:outline-none">
                  {showPassword ? <EyeOff className="h-5 w-5 stroke-[1.5px]" /> : <Eye className="h-5 w-5 stroke-[1.5px]" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[10px] uppercase tracking-widest text-destructive font-bold text-center italic">
              Error: {error}
            </p>
          )}

          <div className="pt-4 space-y-10">
            <Button type="submit" className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-primary/10" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Log in"}
            </Button>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-primary/10" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold text-center">
                New to the Experience? <Link href="/auth/sign-up" className="text-primary font-bold ml-2 hover:underline underline-offset-8 transition-all">Sign up Here</Link>
              </p>
              <div className="h-px w-8 bg-primary/10" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}