import { FileObject, StorageError } from '@supabase/storage-js';
import { fetchDirectory } from '@supabase-cache-helpers/storage-core';
import {
  useQuery as useReactQuery,
  UseQueryResult as UseReactQueryResult,
  UseQueryOptions as UseReactQueryOptions,
} from '@tanstack/react-query';

import { StorageFileApi, encode } from '../lib';

function buildDirectoryQueryOpts(
  fileApi: StorageFileApi,
  path: string,
  config?: Omit<
    UseReactQueryOptions<FileObject[] | undefined, StorageError>,
    'queryKey' | 'queryFn'
  >,
): UseReactQueryOptions<FileObject[] | undefined, StorageError> {
  return {
    queryKey: encode([fileApi, path]),
    queryFn: () => fetchDirectory(fileApi, path),
    ...config,
  };
}

/**
 * Convenience hook to fetch a directory from Supabase Storage using React Query.
 *
 * @param fileApi The StorageFileApi instance.
 * @param path The path to the directory.
 * @param config The React Query configuration.
 * @returns An UseQueryResult containing an array of FileObjects
 */
function useDirectory(
  fileApi: StorageFileApi,
  path: string,
  config?: Omit<
    UseReactQueryOptions<FileObject[] | undefined, StorageError>,
    'queryKey' | 'queryFn'
  >,
): UseReactQueryResult<FileObject[] | undefined, StorageError> {
  return useReactQuery(buildDirectoryQueryOpts(fileApi, path, config));
}

export { useDirectory };
