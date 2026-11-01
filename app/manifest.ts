import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "neuratask-ai-pwa",
    name: "NeuraTask - AI Task Manager",
    short_name: "NeuraTask",
    description: "Next-generation intelligent task management and AI automation",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#09090b",
    background_color: "#09090b",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Add Task",
        short_name: "Add Task",
        description: "Quickly create a new task in NeuraTask",
        url: "/task-ai?action=new-task&source=pwa_shortcut",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Chat with Agent",
        short_name: "AI Agent",
        description: "Chat with the NeuraTask AI assistant",
        url: "/task-ai?source=pwa_shortcut",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
