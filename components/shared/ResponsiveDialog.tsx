"use client";

import * as React from "react";
import { useMedia } from "use-media";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { useModalContext } from "@/hooks/useModalContext";

interface ResponsiveDialogProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    breakpoint?: string;
}

export function ResponsiveDialog({
    title,
    description,
    children,
    breakpoint = "(max-width: 768px)",
}: ResponsiveDialogProps) {
    const isMobile = useMedia(breakpoint);
    const { modalOpen, setModalOpen } = useModalContext(); // ✅ state from context

    if (isMobile) {
        return (
            <Drawer open={modalOpen} onOpenChange={setModalOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        {description && <DrawerDescription>{description}</DrawerDescription>}
                    </DrawerHeader>
                    <div className="p-4">{children}</div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
