"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar } from "lucide-react";
import { createTask } from "@/lib/actions/task";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useMedia from "use-media";
import { useRouter } from "next/navigation";

interface AddTaskModalProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export default function AddTaskModal({
  variant = "default",
  className,
  label = "Add Task",
  showIcon = true,
}: AddTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isDesktop = useMedia({ minWidth: "768px" });
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setIsPending(true);
    try {
      await createTask({
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
      });

      toast.success("Task created successfully");
      setTitle("");
      setPriority("medium");
      setDueDate("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create task");
    } finally {
      setIsPending(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-xs font-medium">
            Task Title
          </Label>
          <Input
            id="title"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="text-base sm:text-sm"
            autoFocus
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority" className="text-xs font-medium">
            Priority
          </Label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((p) => (
              <Button
                key={p}
                type="button"
                variant={priority === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPriority(p)}
                className={`flex-1 sm:flex-initial min-h-[36px] ${
                  priority === p ? "" : "text-muted-foreground"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dueDate" className="text-xs font-medium">
            Due Date (Optional)
          </Label>
          <div className="relative">
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
              className="pl-10 text-base sm:text-sm min-h-[38px]"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="min-h-[40px] sm:min-h-[36px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="min-h-[40px] sm:min-h-[36px]"
        >
          {isPending ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );

  const triggerButton = (
    <Button variant={variant} className={`cursor-pointer ${className || ""}`}>
      {showIcon && <Plus className="size-3.5 mr-1.5" />}
      {label && <span>{label}</span>}
    </Button>
  );

  if (!isDesktop) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[85vh]">
          <DrawerHeader className="px-0 pt-0 text-left">
            <DrawerTitle>Create New Task</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-1">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
