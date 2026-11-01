"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar } from "lucide-react";
import { useTaskAgent } from "@/hooks/useTaskAgent";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useMedia from "use-media";

interface AddTaskModalProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export default function AddTaskModal({ variant = "default", className }: AddTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const isDesktop = useMedia({ minWidth: "768px" });
  const { mutate: sendMessage, isPending } = useTaskAgent();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const message = `Create a task: "${title}"${priority !== "medium" ? ` with ${priority} priority` : ""}${dueDate ? ` due on ${dueDate}` : ""}`;

    sendMessage(
      { input: message },
      {
        onSuccess: () => {
          toast.success("Task created successfully");
          setTitle("");
          setPriority("medium");
          setDueDate("");
          setOpen(false);
          queryClient.invalidateQueries({ queryKey: ["messages"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["calendar"] });
        },
      }
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-xs font-medium">Task Title</Label>
          <Input
            id="title"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="text-base sm:text-sm"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority" className="text-xs font-medium">Priority</Label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((p) => (
              <Button
                key={p}
                type="button"
                variant={priority === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPriority(p)}
                className={`flex-1 sm:flex-initial min-h-[36px] ${priority === p ? "" : "text-muted-foreground"}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dueDate" className="text-xs font-medium">Due Date (Optional)</Label>
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
    <Button variant={variant} className={`min-h-[40px] sm:min-h-[36px] ${className || ""}`}>
      <Plus className="size-4 mr-2" />
      Add Task
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
