import { useTransition } from 'react';

import { useLingui } from '@lingui/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader } from 'lucide-react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindContractsResponse } from '@documenso/trpc/server/contracts-router/schema';
import { Checkbox } from '@documenso/ui/primitives/checkbox';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';

import { useOptionalCurrentTeam } from '~/providers/team';

import { DataTableSkeleton } from './data-table-skeleton';

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
  onRetry?: (data: DocumentsTableRow) => void;

  onEdit?: (data: DocumentsTableRow) => void;
  onMultipleDelete: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
  onDelete?: (data: DocumentsTableRow) => void;
  onNavegate?: (data: DocumentsTableRow) => void;
  onMoveDocument?: (data: DocumentsTableRow) => void;
}

type DocumentsTableRow = TFindContractsResponse['data'][number];

export const ContractsTable = ({
  data,
  isLoading,
  isLoadingError,
  onRetry,
  onAdd,
  onEdit,
  isMultipleDelete = false,
  setIsMultipleDelete,
  onNavegate,
  onMultipleDelete,
  onDelete,
  onMoveDocument,
}: DataTableProps<DocumentsTableRow, DocumentsTableRow>) => {
  const { _, i18n } = useLingui();

  // if (onEdit) {
  //   console.warn('onEdit dei');
  // }
  // if (onDelete) {
  //   console.warn('onDelete dei');
  // }
  const team = useOptionalCurrentTeam();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useUpdateSearchParams();

  const createColumns = (): ColumnDef<DocumentsTableRow>[] => {
    const columns: ColumnDef<DocumentsTableRow>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-0.5"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-0.5"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
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
        accessorKey: 'possibleExtensionTime',
        header: 'Extension Time',
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
      {
        accessorKey: 'summary',
        header: 'Summary',
        enableHiding: true,
      },
    ];
    return columns;
  };

  interface ColumnActions {
    onEdit?: (data: DocumentsTableRow) => void;
    onDelete?: (id: number) => void;
  }
  const columns = createColumns();

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
        setIsMultipleDelete={setIsMultipleDelete}
        isMultipleDelete={isMultipleDelete}
        columns={columns}
        onDelete={onDelete}
        onEdit={onEdit}
        onRetry={onRetry}
        onNavegate={onNavegate}
        data={results.data}
        onMultipleDelete={onMultipleDelete}
        perPage={results.perPage}
        currentPage={results.currentPage}
        totalPages={results.totalPages}
        onPaginationChange={onPaginationChange}
        onMoveDocument={onMoveDocument}
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
            <DataTableSkeleton
              columnCount={columns.length}
              cellWidths={['10rem', '30rem', '10rem', '10rem', '6rem', '6rem', '6rem']}
              shrinkZero
            />
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
