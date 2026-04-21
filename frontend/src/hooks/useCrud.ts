import { useState, useEffect, useCallback } from "react";

interface CrudService<T> {
  getAll: () => Promise<T[]>;
  create?: (data: any) => Promise<T>;
  update?: (id: number, data: any) => Promise<T>;
  delete?: (id: number) => Promise<any>;
}

interface UseCrudResult<T> {
  data: T[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
  refetch: () => void;
  create: (payload: any) => Promise<boolean>;
  update: (id: number, payload: any) => Promise<boolean>;
  remove: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export function useCrud<T>(
  service: CrudService<T>,
  mapper: (raw: any) => T,
  fallback: T[] = [],
  idKey: string = "id"
): UseCrudResult<T> {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    service
      .getAll()
      .then((res) => {
        if (!cancelled) setData(res.map(mapper));
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudo conectar con el servidor. Mostrando datos demo.");
          setData(fallback);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  const clearError = useCallback(() => setSaveError(null), []);

  const create = useCallback(
    async (payload: any): Promise<boolean> => {
      if (!service.create) return false;
      setSaving(true);
      setSaveError(null);
      try {
        await service.create(payload);
        refetch();
        return true;
      } catch (e: any) {
        setSaveError(e?.message || "Error al crear el registro");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [service, refetch]
  );

  const update = useCallback(
    async (id: number, payload: any): Promise<boolean> => {
      if (!service.update) return false;
      setSaving(true);
      setSaveError(null);
      try {
        await service.update(id, payload);
        refetch();
        return true;
      } catch (e: any) {
        setSaveError(e?.message || "Error al actualizar el registro");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [service, refetch]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      if (!service.delete) return false;
      setSaving(true);
      setSaveError(null);
      try {
        await service.delete(id);
        refetch();
        return true;
      } catch (e: any) {
        setSaveError(e?.message || "Error al eliminar el registro");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [service, refetch]
  );

  return { data, loading, saving, error, saveError, refetch, create, update, remove, clearError };
}
