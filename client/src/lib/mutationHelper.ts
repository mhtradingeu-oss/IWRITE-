"use client";

import { useMutation, type MutationFunction, type UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type ToastMessage<TData, TVariables> =
  | string
  | ((params: { data?: TData; variables?: TVariables; error?: unknown }) => string);

interface CreateAppMutationOptions<TData, TVariables, TContext> {
  mutationFn: MutationFunction<TData, TVariables>;
  onSuccessMessage?: ToastMessage<TData, TVariables>;
  onErrorMessage?: ToastMessage<TData, TVariables>;
  invalidate?: string[];
  successToast?: boolean;
  errorToast?: boolean;
  retry?: number;
  debugLabel?: string;
  onSuccess?: UseMutationOptions<TData, unknown, TVariables, TContext>["onSuccess"];
  onError?: UseMutationOptions<TData, unknown, TVariables, TContext>["onError"];
}

function normalizeMessage<TData, TVariables>(message: ToastMessage<TData, TVariables> | undefined, params: {
  data?: TData;
  variables?: TVariables;
  error?: unknown;
}) {
  if (!message) return undefined;
  if (typeof message === "function") {
    return message(params);
  }
  return message;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "An unexpected error occurred";
  }
}

export function createAppMutation<TData, TVariables, TContext = unknown>(
  options: CreateAppMutationOptions<TData, TVariables, TContext>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const retryCount = options.retry ?? 1;

  return useMutation<TData, unknown, TVariables, TContext>({
    mutationFn: options.mutationFn,
    retry: retryCount,
    onSuccess: async (data, variables, context) => {
      const invalidationKeys = options.invalidate ?? [];
      invalidationKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      const message = normalizeMessage(options.onSuccessMessage, { data, variables });

      if (options.successToast !== false && message) {
        toast({
          title: message,
        });
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }

      if (import.meta.env.DEV && options.debugLabel) {
        console.debug(`[mutation:${options.debugLabel}] success`, { data, variables });
      }
    },
    onError: (error, variables, context) => {
      const normalized = normalizeError(error);
      const message = normalizeMessage(options.onErrorMessage, { error, variables });

      if (options.errorToast !== false && message) {
        toast({
          title: message,
          variant: "destructive",
        });
      } else if (options.errorToast !== false) {
        toast({
          title: normalized,
          variant: "destructive",
        });
      }

      if (options.onError) {
        options.onError(error, variables, context);
      }

      if (import.meta.env.DEV && options.debugLabel) {
        console.error(`[mutation:${options.debugLabel}] error`, { error, variables });
      }
    },
  });
}
