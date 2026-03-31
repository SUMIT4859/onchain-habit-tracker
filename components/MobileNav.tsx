"use client";

import { motion } from "framer-motion";
import { Home, Plus, BarChart3 } from "lucide-react";

interface MobileNavProps {
  onAddClick: () => void;
}

export function MobileNav({ onAddClick }: MobileNavProps) {
  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/30 pb-safe md:hidden"
    >
      <div className="flex items-center justify-around py-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 rounded-lg px-6 py-2 text-primary transition-colors"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </motion.button>

        <motion.button
          onClick={onAddClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground neu-shadow glow-primary -mt-6"
        >
          <Plus className="h-6 w-6" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 rounded-lg px-6 py-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs font-medium">Stats</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
