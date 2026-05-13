"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import { queryClient } from "../lib/queryClient";
import { ErrorState } from "../components/common/ErrorState";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <ErrorState error={error} />}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
