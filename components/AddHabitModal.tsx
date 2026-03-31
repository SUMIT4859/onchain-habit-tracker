"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string
  ) => Promise<{ hash?: string; error?: string }>;
  isLoading: boolean;
}

export function AddHabitModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: AddHabitModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.length > 50) {
      setError("Title must be less than 50 characters");
      return;
    }

    if (description.length > 200) {
      setError("Description must be less than 200 characters");
      return;
    }

    const result = await onSubmit(title.trim(), description.trim());

    if (result?.error) {
      setError(result.error);
    } else {
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle("");
      setDescription("");
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl glass neu-shadow">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Create New Habit
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Title Field */}
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Habit Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Morning meditation"
                      disabled={isLoading}
                      className="w-full rounded-lg bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground neu-inset focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {title.length}/50 characters
                    </p>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Description{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a brief description of your habit..."
                      rows={3}
                      disabled={isLoading}
                      className="w-full resize-none rounded-lg bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground neu-inset focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {description.length}/200 characters
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading || !title.trim()}
                    whileHover={
                      !isLoading && title.trim() ? { scale: 1.02 } : {}
                    }
                    whileTap={!isLoading && title.trim() ? { scale: 0.98 } : {}}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Habit</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
