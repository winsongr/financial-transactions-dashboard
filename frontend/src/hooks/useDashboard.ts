import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast.ts';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getDashboardSummary,
  getSchemes,
  getUserAggregates,
  exportReport,
  uploadCsv,
  getSchemeDistribution,
} from '../lib/api.ts';
import type { DashboardSummary, Scheme, User, SchemeDistribution } from '../lib/types.ts';

const REFRESH_INTERVAL_MS = 3 * 60 * 1000; 
const FILTER_LOADING_DELAY_MS = 800;

export function useDashboard() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, forceRerender] = useState(0); 

  const {
    data: summary,
    isPending: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery<DashboardSummary, Error>({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const {
    data: schemes,
    isPending: isSchemesLoading,
    error: schemesError,
    refetch: refetchSchemes,
  } = useQuery<Scheme[], Error>({
    queryKey: ['schemes'],
    queryFn: getSchemes,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const {
    data: users,
    isPending: isUsersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery<User[], Error>({
    queryKey: ['user-aggregates'],
    queryFn: getUserAggregates,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const exportMutation = useMutation({
    mutationFn: exportReport,
    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nav-dashboard-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Download Complete',
        description: 'PDF report has been downloaded.',
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to download report.';
      toast({
        title: 'Export Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (summaryError) {
      toast({
        title: 'Error',
        description: summaryError.message || 'Failed to load dashboard summary.',
        variant: 'destructive',
      });
    }
  }, [summaryError, toast]);

  useEffect(() => {
    setLastUpdated(new Date());
    const interval = setInterval(() => {
      refetchSummary();
      refetchSchemes();
      refetchUsers();
      setLastUpdated(new Date());
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetchSummary, refetchSchemes, refetchUsers]);

  useEffect(() => {
    const timer = setInterval(() => {
      forceRerender((v) => v + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadCsv(file);
      toast({
        title: 'Upload Successful',
        description: 'CSV file uploaded successfully.',
      });
      refetchSummary();
      refetchSchemes();
      refetchUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload CSV.';
      toast({
        title: 'Upload Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [toast, refetchSummary, refetchSchemes, refetchUsers]);

  const handleFilterChange = useCallback((value: string) => {
    setIsLoading(true);
    setFilter(value);
    setTimeout(() => setIsLoading(false), FILTER_LOADING_DELAY_MS);
  }, []);

  function getTimeAgo(date: Date | null): string {
    if (!date) return 'Just now';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  return {
    summary,
    isSummaryLoading,
    summaryError,
    schemes,
    isSchemesLoading,
    schemesError,
    users,
    isUsersLoading,
    usersError,
    exportMutation,
    filter,
    setFilter: handleFilterChange,
    isLoading,
    uploading,
    fileInputRef,
    handleUploadClick,
    handleFileChange,
    lastUpdated,
    getTimeAgo,
  };
}

export function useSchemeDistribution() {
  const { toast } = useToast();
  const { data = [], error, isLoading, refetch } = useQuery<SchemeDistribution[], Error>({
    queryKey: ['scheme-distribution'],
    queryFn: getSchemeDistribution,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch scheme distribution.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return { data, error, isLoading, refetch };
} 