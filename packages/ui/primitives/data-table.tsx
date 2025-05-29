import React, { useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import type {
  ColumnDef,
  PaginationState,
  Table as TTable,
  Updater,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnFiltersState } from '@tanstack/react-table';

import { StackAvatarsArtistWithTooltip } from '../components/lpm/stack-avatars-artist-with-tooltip';
import { Button } from './button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';
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

export type DataTableChildren<TData> = (_table: TTable<TData>) => React.ReactNode;

export type { ColumnDef as DataTableColumnDef } from '@tanstack/react-table';
type enhancedAssignees = {
  artistName: string | null;
  id: number;
};
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnVisibility?: VisibilityState;
  data: TData[];
  onEdit?: (data: TData) => void;
  onNavegate?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  onMoveDocument?: (data: TData) => void;
  perPage?: number;
  currentPage?: number;
  totalPages?: number;
  onRetry?: (data: TData) => void;
  onPaginationChange?: (_page: number, _perPage: number) => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
  children?: DataTableChildren<TData>;
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

export function DataTable<TData, TValue>({
  columns,
  columnVisibility,
  data,
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
}: DataTableProps<TData, TValue>) {
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

  const onTablePaginationChange = (updater: Updater<PaginationState>) => {
    if (typeof updater === 'function') {
      const newState = updater(pagination);

      onPaginationChange?.(newState.pageIndex + 1, newState.pageSize);
    } else {
      onPaginationChange?.(updater.pageIndex + 1, updater.pageSize);
    }
  };
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // Agregar estado local para la visibilidad de columnas
  const [localColumnVisibility, setLocalColumnVisibility] = useState<VisibilityState>(
    columnVisibility || {},
  );
  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setLocalColumnVisibility,

    state: {
      pagination: manualPagination ? pagination : undefined,
      columnVisibility: localColumnVisibility,
      columnFilters,
    },
    manualPagination,
    pageCount: totalPages,
    onPaginationChange: onTablePaginationChange,
  });

  return (
    <>
      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="mb-4 flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <ScrollArea className="h-[300px] w-[200px]">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => {
                          column.toggleVisibility(!!value);
                        }}
                        onSelect={(e) => {
                          e.preventDefault();
                        }}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
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
                          ) : cell.column.id === 'fileName' && cell.getValue() ? (
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
                          ) : cell.column.id === 'lpmArtists' ||
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
                          console.log('Row clicked:', row.original);
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
                          console.log('Row clicked:', row.original);
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
                          console.log('Row clicked:', row.original);
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
                          console.log('Row clicked:', row.original);
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
                          console.log('Row clicked:', row.original);
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
                  <TableCell colSpan={columns.length} className="h-32 text-center">
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
                <TableCell colSpan={columns.length} className="h-32 text-center">
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

      {children && <div className="mt-8 w-full">{children(table)}</div>}
    </>
  );
}
