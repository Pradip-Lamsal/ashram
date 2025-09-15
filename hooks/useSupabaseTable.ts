"use client";

import client from "@/app/api/client";
import { Donation, Donor, Receipt, SMSEvent } from "@/types/index";
import { useCallback, useEffect, useState } from "react";

export interface TableHookResult<T extends { id: string }> {
  rows: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  insertRow: (payload: Partial<T>) => Promise<T>;
  updateRow: (id: string, payload: Partial<T>) => Promise<T>;
  deleteRow: (id: string) => Promise<void>;
  softDeleteRow: (id: string) => Promise<void>;
}

export function useSupabaseTable<T extends { id: string }>(
  table: string,
  select = "*",
  includeDeleted = false
): TableHookResult<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = client.from(table).select(select);

      if (!includeDeleted) {
        query = query.is("deleted_at", null);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setRows(data as unknown as T[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [table, select, includeDeleted]);

  const insertRow = async (payload: Partial<T>): Promise<T> => {
    const { data, error } = await client
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);

    setRows((prev) => [data as T, ...prev]);
    return data as T;
  };

  const updateRow = async (id: string, payload: Partial<T>): Promise<T> => {
    const { data, error } = await client
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    setRows((prev) =>
      prev.map((item) => (item.id === id ? (data as T) : item))
    );

    return data as T;
  };

  const deleteRow = async (id: string): Promise<void> => {
    const { error } = await client.from(table).delete().eq("id", id);

    if (error) throw new Error(error.message);

    setRows((prev) => prev.filter((item) => item.id !== id));
  };

  const softDeleteRow = async (id: string): Promise<void> => {
    const { error } = await client
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);

    if (!includeDeleted) {
      setRows((prev) => prev.filter((item) => item.id !== id));
    }
  };

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return {
    rows,
    loading,
    error,
    refresh: fetchRows,
    insertRow,
    updateRow,
    deleteRow,
    softDeleteRow,
  };
}

// Specialized hooks for your tables
export const useDonors = () => useSupabaseTable<Donor>("donors");
export const useDonations = () => useSupabaseTable<Donation>("donations");
export const useReceipts = () => useSupabaseTable<Receipt>("receipts");
export const useEvents = () =>
  useSupabaseTable<{
    id: string;
    name: string;
    event_date: string;
    description?: string;
    created_by?: string;
    created_at: string;
    deleted_at?: string | null;
  }>("events");
export const useSMSEvents = () => useSupabaseTable<SMSEvent>("sms_events");
