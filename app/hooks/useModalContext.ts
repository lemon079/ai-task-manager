import { useContext } from "react";
import { ModalContext } from "../context/ModalContext";

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return ctx;
};
