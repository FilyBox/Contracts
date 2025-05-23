import { useMemo, useTransition } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Loader } from 'lucide-react';
import { DateTime } from 'luxon';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindDistributionInternalResponse } from '@documenso/trpc/server/distributionStatement-router/schema';
import type { DataTableColumnDef } from '@documenso/ui/primitives/data-table';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';
import { Skeleton } from '@documenso/ui/primitives/skeleton';
import { TableCell } from '@documenso/ui/primitives/table';

import { useOptionalCurrentTeam } from '~/providers/team';

export type DocumentsTableProps = {
  data?: TFindDistributionInternalResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onMoveDocument?: (documentId: number) => void;
};

type DocumentsTableRow = TFindDistributionInternalResponse['data'][number];

export const DistributionTable = ({
  data,
  isLoading,
  isLoadingError,
  onMoveDocument,
}: DocumentsTableProps) => {
  const { _, i18n } = useLingui();

  const team = useOptionalCurrentTeam();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useUpdateSearchParams();

  const columns = useMemo(() => {
    return [
      {
        header: _(msg`ID`),
        accessorKey: 'id',
        cell: ({ row }) => row.original.id,
      },
      {
        header: _(msg`Marketing Owner`),
        accessorKey: 'marketingOwner',
        cell: ({ row }) => row.original.marketingOwner || '-',
      },
      {
        header: _(msg`Nombre Distribución`),
        accessorKey: 'nombreDistribucion',
        cell: ({ row }) => row.original.nombreDistribucion || '-',
      },
      {
        header: _(msg`Proyecto`),
        accessorKey: 'proyecto',
        cell: ({ row }) => row.original.proyecto || '-',
      },
      {
        header: _(msg`Número de Catálogo`),
        accessorKey: 'numeroDeCatalogo',
        cell: ({ row }) => row.original.numeroDeCatalogo || '-',
      },
      {
        header: _(msg`UPC`),
        accessorKey: 'upc',
        cell: ({ row }) => row.original.upc || '-',
      },
      {
        header: _(msg`Local Product Number`),
        accessorKey: 'localProductNumber',
        cell: ({ row }) => row.original.localProductNumber || '-',
      },
      {
        header: _(msg`ISRC`),
        accessorKey: 'isrc',
        cell: ({ row }) => row.original.isrc || '-',
      },
      {
        header: _(msg`Título Catálogo`),
        accessorKey: 'tituloCatalogo',
        cell: ({ row }) => row.original.tituloCatalogo || '-',
      },
      {
        header: _(msg`Mes Reportado`),
        accessorKey: 'mesReportado',
        cell: ({ row }) => (row.original.mesReportado ? String(row.original.mesReportado) : '-'),
      },
      {
        header: _(msg`Territorio`),
        accessorKey: 'territorio',
        cell: ({ row }) => row.original.territorio || '-',
      },
      {
        header: _(msg`Código del Territorio`),
        accessorKey: 'codigoDelTerritorio',
        cell: ({ row }) => row.original.codigoDelTerritorio || '-',
      },
      {
        header: _(msg`Nombre del Territorio`),
        accessorKey: 'nombreDelTerritorio',
        cell: ({ row }) => row.original.nombreDelTerritorio || '-',
      },
      {
        header: _(msg`Tipo de Precio`),
        accessorKey: 'tipoDePrecio',
        cell: ({ row }) => row.original.tipoDePrecio || '-',
      },
      {
        header: _(msg`Tipo de Ingreso`),
        accessorKey: 'tipoDeIngreso',
        cell: ({ row }) => row.original.tipoDeIngreso || '-',
      },
      {
        header: _(msg`Venta`),
        accessorKey: 'venta',
        cell: ({ row }) => (row.original.venta !== null ? String(row.original.venta) : '-'),
      },
      {
        header: _(msg`RTL`),
        accessorKey: 'rtl',
        cell: ({ row }) => (row.original.rtl !== null ? row.original.rtl.toFixed(2) : '-'),
      },
      {
        header: _(msg`PPD`),
        accessorKey: 'ppd',
        cell: ({ row }) => (row.original.ppd !== null ? row.original.ppd.toFixed(2) : '-'),
      },
      {
        header: _(msg`RBP`),
        accessorKey: 'rbp',
        cell: ({ row }) => (row.original.rbp !== null ? row.original.rbp.toFixed(2) : '-'),
      },
      {
        header: _(msg`Tipo de Cambio`),
        accessorKey: 'tipoDeCambio',
        cell: ({ row }) =>
          row.original.tipoDeCambio !== null ? row.original.tipoDeCambio.toFixed(2) : '-',
      },
      {
        header: _(msg`Valor Recibido`),
        accessorKey: 'valorRecibido',
        cell: ({ row }) =>
          row.original.valorRecibido !== null ? row.original.valorRecibido.toFixed(2) : '-',
      },
      {
        header: _(msg`Regalías Artísticas`),
        accessorKey: 'regaliasArtisticas',
        cell: ({ row }) =>
          row.original.regaliasArtisticas !== null ? String(row.original.regaliasArtisticas) : '-',
      },
      {
        header: _(msg`Costo Distribución`),
        accessorKey: 'costoDistribucion',
        cell: ({ row }) =>
          row.original.costoDistribucion !== null ? row.original.costoDistribucion.toFixed(2) : '-',
      },
      {
        header: _(msg`Copyright`),
        accessorKey: 'copyright',
        cell: ({ row }) => (row.original.copyright !== null ? String(row.original.copyright) : '-'),
      },
      {
        header: _(msg`Cuota Administración`),
        accessorKey: 'cuotaAdministracion',
        cell: ({ row }) =>
          row.original.cuotaAdministracion !== null
            ? String(row.original.cuotaAdministracion)
            : '-',
      },
      {
        header: _(msg`Costo Carga`),
        accessorKey: 'costoCarga',
        cell: ({ row }) =>
          row.original.costoCarga !== null ? String(row.original.costoCarga) : '-',
      },
      {
        header: _(msg`Otros Costos`),
        accessorKey: 'otrosCostos',
        cell: ({ row }) =>
          row.original.otrosCostos !== null ? String(row.original.otrosCostos) : '-',
      },
      {
        header: _(msg`Ingresos Recibidos`),
        accessorKey: 'ingresosRecibidos',
        cell: ({ row }) =>
          row.original.ingresosRecibidos !== null ? row.original.ingresosRecibidos.toFixed(2) : '-',
      },
      {
        header: _(msg`Fecha de Creación`),
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          i18n.date(row.original.createdAt, { ...DateTime.DATETIME_SHORT, hourCycle: 'h12' }),
      },
      {
        header: _(msg`Última Actualización`),
        accessorKey: 'updatedAt',
        cell: ({ row }) =>
          i18n.date(row.original.updatedAt, { ...DateTime.DATETIME_SHORT, hourCycle: 'h12' }),
      },
    ] satisfies DataTableColumnDef<DocumentsTableRow>[];
  }, [team, i18n, onMoveDocument]);

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
