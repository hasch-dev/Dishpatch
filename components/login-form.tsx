"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Invalid login credentials");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) throw new Error("Profile not found");

      router.push(profile.user_type === "chef" ? "/chef-dashboard" : "/user-dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full animate-in fade-in slide-in-from-bottom-4 duration-700", className)} {...props}>
      <div className="space-y-12">
        {/* Simple Header */}
        <div className="space-y-3">
          <h2 className="text-5xl font-serif text-foreground tracking-tight">
            Log <span className="italic text-primary">In</span>
          </h2>
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground font-bold">
            Enter your details below
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-12">
          <div className="space-y-10">
            {/* Email Field */}
            <div className="grid gap-3">
              <Label 
                htmlFor="email" 
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all text-lg placeholder:text-muted-foreground/20 px-0"
              />
            </div>

            {/* Password Field */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="password" 
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70"
                >
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] uppercase tracking-widest text-primary font-bold hover:opacity-70"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all text-lg px-0"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium text-center">
              {error}
            </p>
          )}

          <div className="pt-4 space-y-8">
            <Button 
              type="submit" 
              className="w-full h-16 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login to Account"}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground font-light">
                Don't have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-primary font-bold uppercase tracking-widest text-[10px] ml-2 hover:underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}