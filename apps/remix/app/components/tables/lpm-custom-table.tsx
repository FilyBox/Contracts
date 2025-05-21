import { useMemo, useTransition } from 'react';

import { useLingui } from '@lingui/react';
import { Loader } from 'lucide-react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindLpmResponse } from '@documenso/trpc/server/lpm-router/schema';
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
  data?: TFindLpmResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
}

type DocumentsTableRow = TFindLpmResponse['data'][number];

export const LpmTable = ({
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
        accessorKey: 'productId',
        header: 'Product ID',
        enableHiding: true,
      },
      {
        accessorKey: 'productType',
        header: 'Product Type',
        enableHiding: true,
      },
      {
        accessorKey: 'productTitle',
        header: 'Product Title',
        enableHiding: true,
      },
      {
        accessorKey: 'productVersion',
        header: 'Product Version',
        enableHiding: true,
      },
      {
        accessorKey: 'productDisplayArtist',
        header: 'Product Display Artist',
        enableHiding: true,
      },
      {
        accessorKey: 'parentLabel',
        header: 'Parent Label',
        enableHiding: true,
      },
      {
        accessorKey: 'label',
        header: 'Label',
        enableHiding: true,
      },
      {
        accessorKey: 'originalReleaseDate',
        header: 'Original Release Date',
        enableHiding: true,
      },
      {
        accessorKey: 'releaseDate',
        header: 'Release Date',
        enableHiding: true,
      },
      {
        accessorKey: 'upc',
        header: 'UPC',
        enableHiding: true,
      },
      {
        accessorKey: 'catalog',
        header: 'Catalog',
        enableHiding: true,
      },
      {
        accessorKey: 'productPriceTier',
        header: 'Product Price Tier',
        enableHiding: true,
      },
      {
        accessorKey: 'productGenre',
        header: 'Product Genre',
        enableHiding: true,
      },
      {
        accessorKey: 'submissionStatus',
        header: 'Submission Status',
        enableHiding: true,
      },
      {
        accessorKey: 'productCLine',
        header: 'Product C Line',
        enableHiding: true,
      },
      {
        accessorKey: 'productPLine',
        header: 'Product P Line',
        enableHiding: true,
      },
      {
        accessorKey: 'preOrderDate',
        header: 'PreOrder Date',
        enableHiding: true,
      },
      {
        accessorKey: 'exclusives',
        header: 'Exclusives',
        enableHiding: true,
      },
      {
        accessorKey: 'explicitLyrics',
        header: 'Explicit Lyrics',
        enableHiding: true,
      },
      {
        accessorKey: 'productPlayLink',
        header: 'Product Play Link',
        enableHiding: true,
      },
      {
        accessorKey: 'linerNotes',
        header: 'Liner Notes',
        size: 50,
        maxSize: 50,
        enableHiding: true,
      },
      {
        accessorKey: 'primaryMetadataLanguage',
        header: 'Primary Metadata Language',
        enableHiding: true,
      },
      {
        accessorKey: 'compilation',
        header: 'Compilation',
        enableHiding: true,
      },
      {
        accessorKey: 'pdfBooklet',
        header: 'PDF Booklet',
        enableHiding: true,
      },
      {
        accessorKey: 'timedReleaseDate',
        header: 'Timed Release Date',
        enableHiding: true,
      },
      {
        accessorKey: 'timedReleaseMusicServices',
        header: 'Timed Release Music Services',
        enableHiding: true,
      },
      {
        accessorKey: 'lastProcessDate',
        header: 'Last Process Date',
        enableHiding: true,
      },
      {
        accessorKey: 'importDate',
        header: 'Import Date',
        enableHiding: true,
      },
      {
        accessorKey: 'createdBy',
        header: 'Created By',
        enableHiding: true,
      },
      {
        accessorKey: 'lastModified',
        header: 'Last Modified',
        enableHiding: true,
      },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted At',
        enableHiding: true,
      },
      {
        accessorKey: 'submittedBy',
        header: 'Submitted By',
        enableHiding: true,
      },
      {
        accessorKey: 'vevoChannel',
        header: 'Vevo Channel',
        enableHiding: true,
      },
      {
        accessorKey: 'trackType',
        header: 'Track Type',
        enableHiding: true,
      },
      {
        accessorKey: 'trackId',
        header: 'Track ID',
        enableHiding: true,
      },
      {
        accessorKey: 'trackVolume',
        header: 'Track Volume',
        enableHiding: true,
      },
      {
        accessorKey: 'trackNumber',
        header: 'Track Number',
        enableHiding: true,
      },
      {
        accessorKey: 'trackName',
        header: 'Track Name',
        enableHiding: true,
      },
      {
        accessorKey: 'trackVersion',
        header: 'Track Version',
        enableHiding: true,
      },
      {
        accessorKey: 'trackDisplayArtist',
        header: 'Track Display Artist',
        enableHiding: true,
      },
      {
        accessorKey: 'isrc',
        header: 'ISRC',
        enableHiding: true,
      },
      {
        accessorKey: 'trackPriceTier',
        header: 'Track Price Tier',
        enableHiding: true,
      },
      {
        accessorKey: 'trackGenre',
        header: 'Track Genre',
        enableHiding: true,
      },
      {
        accessorKey: 'audioLanguage',
        header: 'Audio Language',
        enableHiding: true,
      },
      {
        accessorKey: 'trackCLine',
        header: 'Track C Line',
        enableHiding: true,
      },
      {
        accessorKey: 'trackPLine',
        header: 'Track P Line',
        enableHiding: true,
      },
      {
        accessorKey: 'writersComposers',
        header: 'Writers/Composers',
        enableHiding: true,
      },
      {
        accessorKey: 'publishersCollectionSocieties',
        header: 'Publishers/Collection Societies',
        enableHiding: true,
      },
      {
        accessorKey: 'withholdMechanicals',
        header: 'Withhold Mechanicals',
        enableHiding: true,
      },
      {
        accessorKey: 'preOrderType',
        header: 'PreOrder Type',
        enableHiding: true,
      },
      {
        accessorKey: 'instantGratificationDate',
        header: 'Instant Gratification Date',
        enableHiding: true,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        enableHiding: true,
      },
      {
        accessorKey: 'sampleStartTime',
        header: 'Sample Start Time',
        enableHiding: true,
      },
      {
        accessorKey: 'explicitLyricsTrack',
        header: 'Explicit Lyrics Track',
        enableHiding: true,
      },
      {
        accessorKey: 'albumOnly',
        header: 'Album Only',
        enableHiding: true,
      },
      {
        accessorKey: 'lyrics',
        header: 'Lyrics',
        enableHiding: true,
      },
      {
        accessorKey: 'additionalContributorsPerforming',
        header: 'Additional Contributors (Performing)',
        enableHiding: true,
      },
      {
        accessorKey: 'additionalContributorsNonPerforming',
        header: 'Additional Contributors (Non-Performing)',
        enableHiding: true,
      },
      {
        accessorKey: 'producers',
        header: 'Producers',
        enableHiding: true,
      },
      {
        accessorKey: 'continuousMix',
        header: 'Continuous Mix',
        enableHiding: true,
      },
      {
        accessorKey: 'continuouslyMixedIndividualSong',
        header: 'Continuously Mixed Individual Song',
        enableHiding: true,
      },
      {
        accessorKey: 'trackPlayLink',
        header: 'Track Play Link',
        enableHiding: true,
      },
    ];
  }, [team]);
  // const columns = useMemo(() => {
  //   return [
  //     {
  //       header: _(msg`Created`),
  //       accessorKey: 'createdAt',
  //       cell: ({ row }) =>
  //         i18n.date(row.original.createdAt, { ...DateTime.DATETIME_SHORT, hourCycle: 'h12' }),
  //     },
  //     {
  //       header: _(msg`Date`),
  //       accessorKey: 'date',
  //       cell: ({ row }) => row.original.date || '-',
  //     },
  //     {
  //       header: _(msg`Artist`),
  //       accessorKey: 'artist',
  //       cell: ({ row }) => row.original.artist || '-',
  //     },
  //     {
  //       header: _(msg`Release Title`),
  //       accessorKey: 'lanzamiento',
  //       cell: ({ row }) => row.original.lanzamiento || '-',
  //     },
  //     {
  //       header: _(msg`Type`),
  //       accessorKey: 'typeOfRelease',
  //       cell: ({ row }) => row.original.typeOfRelease || '-',
  //     },
  //     {
  //       header: _(msg`Release Status`),
  //       accessorKey: 'release',
  //       cell: ({ row }) => row.original.release || '-',
  //     },
  //     {
  //       header: _(msg`Uploaded`),
  //       accessorKey: 'uploaded',
  //       cell: ({ row }) => row.original.uploaded || '-',
  //     },
  //     {
  //       header: _(msg`Streaming Link`),
  //       accessorKey: 'streamingLink',
  //       cell: ({ row }) =>
  //         row.original.streamingLink ? (
  //           <Link
  //             to={row.original.streamingLink}
  //             className="text-primary hover:underline"
  //             target="_blank"
  //           >
  //             Link
  //           </Link>
  //         ) : (
  //           '-'
  //         ),
  //     },
  //     {
  //       header: _(msg`Assets`),
  //       accessorKey: 'assets',
  //       cell: ({ row }) => row.original.assets || '-',
  //     },

  //     {
  //       header: _(msg`Canvas`),
  //       accessorKey: 'canvas',
  //       cell: ({ row }) => {
  //         if (row.original.canvas === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.canvas === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 p-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`Cover`),
  //       accessorKey: 'cover',
  //       cell: ({ row }) => {
  //         if (row.original.cover === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.cover === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 p-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`Audio`),
  //       accessorKey: 'audioWAV',
  //       cell: ({ row }) => {
  //         if (row.original.audioWAV === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.audioWAV === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 px-2 py-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`Video`),
  //       accessorKey: 'video',
  //       cell: ({ row }) => {
  //         if (row.original.video === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.video === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 p-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`Banners`),
  //       accessorKey: 'banners',
  //       cell: ({ row }) => {
  //         if (row.original.banners === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.banners === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 p-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`Pitch`),
  //       accessorKey: 'pitch',
  //       cell: ({ row }) => {
  //         if (row.original.pitch === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.pitch === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 p-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`EPK`),
  //       accessorKey: 'EPKUpdates',
  //       cell: ({ row }) => {
  //         if (row.original.EPKUpdates === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.EPKUpdates === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 px-2 py-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`WebSiteUpdates`),
  //       accessorKey: 'WebSiteUpdates',
  //       cell: ({ row }) => {
  //         if (row.original.WebSiteUpdates === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.WebSiteUpdates === false) {
  //           return (
  //             <span className="w-fit rounded bg-red-500 p-1 text-white">
  //               <XIcon size={16} />
  //             </span>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },
  //     {
  //       header: _(msg`Biography`),
  //       accessorKey: 'Biography',
  //       cell: ({ row }) => {
  //         if (row.original.Biography === true) {
  //           return (
  //             <div className="w-fit rounded bg-green-500 p-1 text-white">
  //               <CheckIcon size={16} />
  //             </div>
  //           );
  //         } else if (row.original.Biography === false) {
  //           return (
  //             <div className="w-fit rounded bg-red-500 px-2 py-1 text-white">
  //               <XIcon size={16} />
  //             </div>
  //           );
  //         } else {
  //           return <span className="text-muted-foreground">-</span>;
  //         }
  //       },
  //     },

  //     // {
  //     //   header: _(msg`Actions`),
  //     //   cell: ({ row }) =>
  //     //     (!row.original.deletedAt || isDocumentCompleted(row.original.status)) && (
  //     //       <div className="flex items-center gap-x-4">
  //     //         <DocumentsTableActionButton row={row.original} />
  //     //         <DocumentsTableActionDropdown
  //     //           row={row.original}
  //     //           onMoveDocument={onMoveDocument ? () => onMoveDocument(row.original.id) : undefined}
  //     //         />
  //     //       </div>
  //     //     ),
  //     // },
  //   ] satisfies DataTableColumnDef<DocumentsTableRow>[];
  // }, [team]);

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
