"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar } from "lucide-react";
import { useTaskAgent } from "@/hooks/useTaskAgent";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddTaskModalProps {
    variant?: "default" | "outline" | "ghost";
    className?: string;
}

export default function AddTaskModal({ variant = "default", className }: AddTaskModalProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [dueDate, setDueDate] = useState("");

    const { mutate: sendMessage, isPending } = useTaskAgent();
    const queryClient = useQueryClient();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Please enter a task title");
            return;
        }

        // Use AI agent to create the task
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
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} className={className}>
                    <Plus className="size-4 mr-2" />
                    Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Task Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter task title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <div className="flex gap-2">
                                {(["low", "medium", "high"] as const).map((p) => (
                                    <Button
                                        key={p}
                                        type="button"
                                        variant={priority === p ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPriority(p)}
                                        className={priority === p ? "" : "text-muted-foreground"}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date (Optional)</Label>
                            <div className="relative">
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={isPending}
                                    className="pl-10"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
