"use client";

import { useRef, useState } from "react";
import { Chrome, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthPanel() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="rounded-[1.8rem] border border-border bg-card p-5 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-white">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="font-[var(--font-telugu)] text-2xl font-black">సైన్ ఇన్</h1>
            <p className="text-sm text-muted-foreground">Guest browsing, OTP, Google and email login ready</p>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-muted-foreground">Phone OTP</label>
          <div className="flex gap-2">
            <div className="grid h-12 w-16 place-items-center rounded-full border border-border bg-muted text-sm font-black">+91</div>
            <Input inputMode="tel" autoComplete="tel-national" placeholder="Mobile number" className="flex-1" />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  refs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => updateOtp(index, event.target.value)}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                className="h-12 rounded-2xl border border-border bg-muted text-center text-lg font-black outline-none focus:border-primary"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
          <Button className="w-full">
            <Phone className="size-4" />
            Continue with OTP
          </Button>
        </div>
      </section>
      <section className="grid gap-3">
        <Button variant="secondary" className="w-full">
          <Chrome className="size-4" />
          Continue with Google
        </Button>
        <Button variant="secondary" className="w-full">
          <Mail className="size-4" />
          Continue with Email
        </Button>
        <Button variant="glass" className="w-full">
          <UserRound className="size-4" />
          Browse as Guest
        </Button>
      </section>
    </div>
  );
}
