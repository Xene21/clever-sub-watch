"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(v) {
          if (ref.current) {
            ref.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export function Stats() {
  const stats = [
    { value: 847, prefix: "$", suffix: "", label: "Avg savings/yr" },
    { value: 12, prefix: "", suffix: "+", label: "Subs per user" },
    { value: 99.9, prefix: "", suffix: "%", decimals: 1, label: "Uptime" },
    { value: 50, prefix: "", suffix: "K+", label: "Users" },
  ];

  return (
    <section className="relative py-20 border-y border-white/6 bg-[radial-gradient(ellipse_at_center,hsl(43_57%_65%/0.05),transparent_70%)] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: i * 0.1, 
                type: "spring", 
                bounce: 0.4 
              }}
              className={`flex flex-col items-center justify-center text-center ${
                i !== stats.length - 1 ? "md:border-r md:border-white/6" : ""
              }`}
            >
              <div className="font-display font-bold text-5xl md:text-6xl tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-2">
                <AnimatedNumber 
                  value={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                  decimals={stat.decimals} 
                />
              </div>
              <p className="text-sm text-muted-foreground/70 tracking-wide uppercase font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
