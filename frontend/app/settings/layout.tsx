import React from "react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex-1 bg-background">
      <div className="container relative">
        <main className="relative min-h-screen py-6 lg:gap-10">{children}</main>
      </div>
    </div>
  );
}
