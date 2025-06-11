import * as React from 'react';
import { useMemo } from 'react';

import { Trans } from '@lingui/react/macro';
import {
  type PaginationState,
  type Table as TanstackTable,
  type Updater,
  type VisibilityState,
  flexRender,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Download, Trash2 } from 'lucide-react';

import { StackAvatarsArtistWithTooltip } from '../components/lpm/stack-avatars-artist-with-tooltip';
// import { getCommonPinningStyles } from '../lib/data-table';
import { exportTableToCSV } from '../lib/export';
import { cn } from '../lib/utils';
// import { Button } from './button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from './data-table-action-bar';
import { DataTablePagination } from './data-table-pagination-pagination';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ScrollArea } from './scroll-area';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;

  columnVisibility?: VisibilityState;
  data: TData[];
  onEdit?: (data: TData) => void;
  onNavegate?: (data: TData) => void;
  onDelete?: (data: TData) => void;

  onMultipleDelete?: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
  onMoveDocument?: (data: TData) => void;
  perPage?: number;
  currentPage?: number;
  totalPages?: number;
  onRetry?: (data: TData) => void;
  onPaginationChange?: (_page: number, _perPage: number) => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
  skeleton?: {
    enable: boolean;
    rows: number;
    component?: React.ReactNode;
  };
  error?: {
    enable: boolean;
    component?: React.ReactNode;
  };
}

export type DataTableChildren<TData> = (_table: TanstackTable<TData>) => React.ReactNode;

export type { ColumnDef as DataTableColumnDef } from '@tanstack/react-table';
type enhancedAssignees = {
  artistName: string | null;
  id: number;
};

// export interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   actionBar?: React.ReactNode;

// }

export function DataTable<TData>({
  table,
  actionBar,
  className,
  columnVisibility,
  data,
  onMultipleDelete,
  isMultipleDelete = false,
  setIsMultipleDelete,
  error,
  onEdit,
  onRetry,
  onDelete,
  onNavegate,
  perPage,
  currentPage,
  totalPages,
  skeleton,
  onMoveDocument,
  hasFilters,
  onClearFilters,
  onPaginationChange,
  children,
  ...props
}: DataTableProps<TData>) {
  const dateColumnIds = [
    'releaseDate',
    'originalReleaseDate',
    'createdAt',
    'date',
    'preOrderDate',
    'lastProcessDate',
    'timedReleaseDate',
    'timedReleaseMusicServices',
    'importDate',
    'instantGratificationDate',
    'submittedAt',
    'lastModified',
    'startDate',
    'endDate',
  ];
  const actions = ['update-status', 'update-priority', 'export', 'delete'] as const;

  type Action = (typeof actions)[number];

  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const getIsActionPending = React.useCallback(
    (action: Action) => isMultipleDelete && currentAction === action,
    [isMultipleDelete, currentAction],
  );

  const pagination = useMemo<PaginationState>(() => {
    if (currentPage !== undefined && perPage !== undefined) {
      return {
        pageIndex: currentPage - 1,
        pageSize: perPage,
      };
    }

    return {
      pageIndex: 0,
      pageSize: 0,
    };
  }, [currentPage, perPage]);

  const manualPagination = Boolean(currentPage !== undefined && totalPages !== undefined);

  const rows = table.getFilteredSelectedRowModel().rows;

  const onhandleMultipleDelete = () => {
    const ids = rows.map((row) => (row.original as { id: unknown }).id);
    setIsMultipleDelete?.(true);
    onMultipleDelete?.(ids as number[]);
  };

  const onTaskExport = React.useCallback(() => {
    setCurrentAction('export');
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: true,
      });
    });
  }, [table]);
  const onTablePaginationChange = (updater: Updater<PaginationState>) => {
    if (typeof updater === 'function') {
      const newState = updater(pagination);

      onPaginationChange?.(newState.pageIndex + 1, newState.pageSize);
    } else {
      onPaginationChange?.(updater.pageIndex + 1, updater.pageSize);
    }
  };

  return (
    <div className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)} {...props}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild className="h-fit w-fit">
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-muted/50 cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{ maxWidth: '200px' }}
                        >
                          {cell.column.id === 'linerNotes' &&
                          typeof cell.getValue() === 'string' ? (
                            `${(cell.getValue() as string).substring(0, 50)}${(cell.getValue() as string).length > 50 ? '...' : ''}`
                          ) : cell.column.id === 'productPlayLink' && cell.getValue() ? (
                            <a
                              href={cell.getValue() as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Link
                            </a>
                          ) : (cell.column.id === 'fileName' && cell.getValue()) ||
                            (cell.column.id === 'title' && cell.getValue()) ? (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>{cell.getValue() as string}</TooltipTrigger>
                                  <TooltipContent className="break-words">
                                    {cell.getValue() as string}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          ) : cell.column.id === 'summary' && cell.getValue() ? (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>{cell.getValue() as string}</TooltipTrigger>
                                  <TooltipContent className="max-w-40 break-words">
                                    {cell.getValue() as string}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          ) : (cell.column.id === 'lpmArtists' && cell.getValue()) ||
                            (cell.column.id === 'isrcArtists' && cell.getValue()) ||
                            (cell.column.id === 'tuStreamsArtists' && cell.getValue()) ||
                            (cell.column.id === 'releasesArtists' && cell.getValue()) ? (
                            <>
                              {/* <TooltipProvider>
                                       <Tooltip>
                                         <TooltipTrigger>{cell.getValue() as string}</TooltipTrigger>
                                         <TooltipContent>{cell.getValue() as string}</TooltipContent>
                                       </Tooltip>
                                     </TooltipProvider> */}

                              <StackAvatarsArtistWithTooltip
                                enhancedAssignees={cell.getValue() as enhancedAssignees[]}
                              />
                            </>
                          ) : cell.column.id === 'trackPlayLink' && cell.getValue() ? (
                            <a
                              href={cell.getValue() as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Link
                            </a>
                          ) : cell.column.id === 'vevoChannel' && cell.getValue() ? (
                            <a
                              href={cell.getValue() as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Link
                            </a>
                          ) : cell.column.id === 'lyrics' && typeof cell.getValue() === 'string' ? (
                            `${(cell.getValue() as string).substring(0, 50)}${(cell.getValue() as string).length > 50 ? '...' : ''}`
                          ) : dateColumnIds.includes(cell.column.id) ? (
                            `${cell.getValue() ? format(cell.getValue() as Date, 'd MMM yyyy', { locale: es }) : '-'}`
                          ) : cell.column.id === 'writersComposers' &&
                            typeof cell.getValue() === 'string' ? (
                            `${(cell.getValue() as string).substring(0, 50)}${(cell.getValue() as string).length > 50 ? '...' : ''}`
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    {onEdit && (
                      <ContextMenuItem
                        onClick={() => {
                          onEdit(row.original);
                        }}
                        inset
                      >
                        Edit
                      </ContextMenuItem>
                    )}

                    {onNavegate && (
                      <ContextMenuItem
                        onClick={() => {
                          onNavegate(row.original);
                        }}
                        inset
                      >
                        View
                      </ContextMenuItem>
                    )}

                    {onRetry && (
                      <ContextMenuItem
                        onClick={() => {
                          onRetry(row.original);
                        }}
                        inset
                      >
                        Retry
                      </ContextMenuItem>
                    )}

                    {onMoveDocument && (
                      <ContextMenuItem
                        onClick={() => {
                          onMoveDocument(row.original);
                        }}
                        inset
                      >
                        Move To Folder
                      </ContextMenuItem>
                    )}

                    {onDelete && (
                      <ContextMenuItem
                        onClick={() => {
                          onDelete(row.original);
                        }}
                        inset
                      >
                        Delete
                      </ContextMenuItem>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
                // <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                //   {row.getVisibleCells().map((cell) => (
                //     <TableCell
                //       key={cell.id}
                //       style={{
                //         width: `${cell.column.getSize()}px`,
                //       }}
                //     >
                //       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                //     </TableCell>
                //   ))}
                // </TableRow>
              ))
            ) : error?.enable ? (
              <TableRow>
                {error.component ?? (
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Trans>Something went wrong.</Trans>
                  </TableCell>
                )}
              </TableRow>
            ) : skeleton?.enable ? (
              Array.from({ length: skeleton.rows }).map((_, i) => (
                <TableRow key={`skeleton-row-${i}`}>{skeleton.component ?? <Skeleton />}</TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <p>
                    <Trans>No results found</Trans>
                  </p>

                  {hasFilters && onClearFilters !== undefined && (
                    <button
                      onClick={() => onClearFilters()}
                      className="text-foreground mt-1 text-sm"
                    >
                      <Trans>Clear filters</Trans>
                    </button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
      </div>
    </div>
  );
}
