"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/dashboard"); 
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Visual Header */}
      <div className="space-y-4">
        <div className="h-12 w-12 rounded-full border border-primary/20 flex items-center justify-center mb-8">
          <Lock className="w-5 h-5 text-primary stroke-[1.5px]" />
        </div>
        <h2 className="text-5xl font-serif text-foreground tracking-tight">
          Reset <span className="italic text-primary">Key</span>
        </h2>
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground font-bold">Secure User Authentication</p>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-10">
        <div className="space-y-6">
          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-12 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all px-0 pr-10 placeholder:text-muted-foreground/20 text-lg tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-3 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="p-6 bg-primary/[0.02] border border-primary/10 space-y-3">
            <h4 className="text-[9px] uppercase tracking-widest font-bold text-primary">Requirement</h4>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              Choose a unique passphrase that reflects the exclusivity of your Dishpatch membership.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-[10px] uppercase tracking-widest text-destructive font-bold text-center italic italic">
            ! {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading || password.length < 6}
          className="w-full h-16 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-primary/10"
        >
          {isLoading ? 'Updating Secure Access...' : 'Save New Credentials'}
        </Button>
      </form>
    </div>
  );
}