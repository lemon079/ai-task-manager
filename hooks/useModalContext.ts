import { ModalContext } from "@/app/context/ModalContext";
import { useContext } from "react";

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return ctx;
};
