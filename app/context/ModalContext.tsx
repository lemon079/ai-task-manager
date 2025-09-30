"use client";

import React, { createContext, useState } from "react";

type ModalContextType = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// ✅ create context with correct type
export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ modalOpen, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};