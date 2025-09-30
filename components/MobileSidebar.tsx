"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import Sidebar from "./shared/Sidebar";
import useMedia from "use-media";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  // ✅ Detect if screen is >= 768px
  const isLargeScreen = useMedia({ minWidth: "768px" });

  // ✅ Close the drawer automatically when screen becomes large
  useEffect(() => {
    if (isLargeScreen && open) {
      setOpen(false);
    }
  }, [isLargeScreen, open]);

  return (
    <div className="flex md:hidden px-2 items-center justify-between">
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline" className="m-2">
            <Menu size={24} />
          </Button>
        </DrawerTrigger>

        {/* Force drawer to take sidebar's width */}
        <DrawerContent className="!w-fit">
          <VisuallyHidden>
            <DrawerTitle>Mobile Navigation</DrawerTitle>
          </VisuallyHidden>
          <Sidebar onLinkClick={() => setOpen(false)} />
        </DrawerContent>
      </Drawer>
      <div>ICON</div>
    </div>
  );
}
