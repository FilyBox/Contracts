import { useMemo, useTransition } from 'react';

import { useLingui } from '@lingui/react';
import { Loader } from 'lucide-react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindContractsResponse } from '@documenso/trpc/server/contracts-router/schema';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';
import { Skeleton } from '@documenso/ui/primitives/skeleton';
import { TableCell } from '@documenso/ui/primitives/table';

import { useOptionalCurrentTeam } from '~/providers/team';

// export type DocumentsTableProps = {
//   data?: TFindReleaseResponse;
//   isLoading?: boolean;
//   isLoadingError?: boolean;
//   onMoveDocument?: (documentId: number) => void;
//     onAdd: () => void;
//   onEdit: (data: TData) => void;
//   onDelete: (data: TData) => void;
// };

interface DataTableProps<TData, TValue> {
  data?: TFindContractsResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
}

type DocumentsTableRow = TFindContractsResponse['data'][number];

export const ContractsTable = ({
  data,
  isLoading,
  isLoadingError,
  onAdd,
  onEdit,
  onDelete,
}: DataTableProps<DocumentsTableRow, DocumentsTableRow>) => {
  const { _, i18n } = useLingui();

  const team = useOptionalCurrentTeam();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useUpdateSearchParams();
  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
        enableHiding: true,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        enableHiding: true,
      },
      {
        accessorKey: 'fileName',
        header: 'File Name',
        enableHiding: true,
      },
      {
        accessorKey: 'artists',
        header: 'Artists',
        enableHiding: true,
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        enableHiding: true,
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        enableHiding: true,
      },
      {
        accessorKey: 'isPossibleToExpand',
        header: 'Expandable',
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableHiding: true,
      },
      {
        accessorKey: 'documentId',
        header: 'Document ID',
        enableHiding: true,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        enableHiding: true,
      },
    ];
  }, [team]);

  const onPaginationChange = (page: number, perPage: number) => {
    startTransition(() => {
      updateSearchParams({
        page,
        perPage,
      });
    });
  };

  const results = data ?? {
    data: [],
    perPage: 10,
    currentPage: 1,
    totalPages: 1,
  };

  return (
    <div className="relative">
      <DataTable
        columns={columns}
        onDelete={onDelete}
        onEdit={onEdit}
        data={results.data}
        perPage={results.perPage}
        currentPage={results.currentPage}
        totalPages={results.totalPages}
        onPaginationChange={onPaginationChange}
        columnVisibility={{
          sender: team !== undefined,
        }}
        error={{
          enable: isLoadingError || false,
        }}
        skeleton={{
          enable: isLoading || false,
          rows: 5,
          component: (
            <>
              <TableCell>
                <Skeleton className="h-4 w-40 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 rounded-full" />
              </TableCell>
              <TableCell className="py-4">
                <div className="flex w-full flex-row items-center">
                  <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-24 rounded" />
              </TableCell>
            </>
          ),
        }}
      >
        {(table) => <DataTablePagination additionalInformation="VisibleCount" table={table} />}
      </DataTable>

      {isPending && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
          <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
};

type DataTableTitleProps = {
  row: DocumentsTableRow;
  teamUrl?: string;
};
