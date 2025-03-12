"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <button
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
