"use client"

import * as React from "react"

// Simple toast interface
interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

// Simple toast function that uses browser alert for now
function toast({ title, description, variant }: ToastOptions) {
  const message = title && description 
    ? `${title}\n${description}` 
    : title || description || "Notification";
    
  if (variant === "destructive") {
    alert(`Error: ${message}`);
  } else {
    alert(message);
  }
  
  return {
    id: Date.now().toString(),
    dismiss: () => {},
    update: () => {},
  }
}

// Simple useToast hook
function useToast() {
  return {
    toast,
    dismiss: () => {},
    toasts: [],
  }
}

export { useToast, toast }
