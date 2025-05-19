import React, { useMemo } from 'react';

import { Trans } from '@lingui/react/macro';
import type {
  ColumnDef,
  PaginationState,
  Table as TTable,
  Updater,
  VisibilityState,
} from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './context-menu';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

export type DataTableChildren<TData> = (_table: TTable<TData>) => React.ReactNode;

export type { ColumnDef as DataTableColumnDef } from '@tanstack/react-table';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnVisibility?: VisibilityState;
  data: TData[];
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  perPage?: number;
  currentPage?: number;
  totalPages?: number;
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
  onDelete,
  perPage,
  currentPage,
  totalPages,
  skeleton,
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: manualPagination ? pagination : undefined,
      columnVisibility,
    },
    manualPagination,
    pageCount: totalPages,
    onPaginationChange: onTablePaginationChange,
  });

  return (
    <>
      <div className="rounded-md border">
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
                        <ContextMenuShortcut>⌘</ContextMenuShortcut>
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
                        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
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
