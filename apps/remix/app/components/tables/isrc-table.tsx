import { useMemo, useTransition } from 'react';

import { useLingui } from '@lingui/react';
import { Loader } from 'lucide-react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindIsrcSongsResponse } from '@documenso/trpc/server/isrcsong-router/schema';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';

import { DataTableSkeleton } from '~/components/tables/data-table-skeleton';
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
  data?: TFindIsrcSongsResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
}

type DocumentsTableRow = TFindIsrcSongsResponse['data'][number];

export const IsrcTable = ({
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
        accessorKey: 'date',
        header: 'Date',
        enableHiding: true,
      },
      {
        accessorKey: 'isrcArtists',
        header: 'Artist',
        enableHiding: true,
      },
      {
        accessorKey: 'trackName',
        header: 'Track Name',
        enableHiding: true,
      },
      {
        accessorKey: 'isrc',
        header: 'ISRC',
        enableHiding: true,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        enableHiding: true,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        enableHiding: true,
      },
      {
        accessorKey: 'license',
        header: 'License',
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
