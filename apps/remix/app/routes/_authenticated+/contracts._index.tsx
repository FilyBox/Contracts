import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { ContractStatus, ExpansionPossibility } from '@prisma/client';
import { useSearchParams } from 'react-router';

import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { formatContractsPath } from '@documenso/lib/utils/teams';
import { type Contract, type IsrcSongs } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { ZFindIsrcSongsInternalRequestSchema } from '@documenso/trpc/server/isrcsong-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { createColumnsIsrc } from '@documenso/ui/primitives/column-custom';
import { DataTableCustom } from '@documenso/ui/primitives/data-table-custom';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import ContractForm from '@documenso/ui/primitives/form-contracts';
import MyForm from '@documenso/ui/primitives/form-custom-isrc';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { DocumentSearch } from '~/components/general/document/document-search';
import { ContractsTable } from '~/components/tables/contracts-table';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

// import { type IsrcSongsData } from '@documenso/ui/primitives/types';

type CsvColumnMapping = {
  csvColumn: string;
  field: keyof Omit<IsrcSongs, 'id'> | '';
};

export function meta() {
  return appMetaTags('Contracts');
}

const ZSearchParamsSchema = ZFindIsrcSongsInternalRequestSchema.pick({
  period: true,
  page: true,
  perPage: true,
  query: true,
});

export default function ContractsPage() {
  const [searchParams] = useSearchParams();
  const team = useOptionalCurrentTeam();

  const documentRootPath = formatContractsPath(team?.url);

  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  const { data, isLoading, isLoadingError, refetch } = trpc.contracts.findContracts.useQuery({
    query: findDocumentSearchParams.query,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
  });

  const createContractsMutation = trpc.contracts.createContracts.useMutation();
  const createManyContractsMutation = trpc.contracts.createManyContracts.useMutation();
  const updateContractsMutation = trpc.contracts.updateContractsById.useMutation();
  const deleteContractsMutation = trpc.contracts.deleteContractsById.useMutation();
  const { toast } = useToast();

  // type ContractsData = (typeof data.contracts)[number];
  const [dataIntial, setData] = useState<Contract[]>([]);
  const [editingUser, setEditingUser] = useState<Contract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const mapExpansionPossibility = (value: string): string => {
    const normalized = value.trim().toUpperCase();

    if (normalized === 'SI') {
      return 'SI';
    } else if (normalized === 'NO') {
      return 'NO';
    } else {
      return 'NO_ESPECIFICADO';
    }
  };

  // Helper function to map contract status values from CSV to enum values
  const mapContractStatus = (value: string): string => {
    const normalized = value.trim().toUpperCase();

    if (normalized === 'VIGENTE') {
      return 'VIGENTE';
    } else if (normalized === 'FINALIZADO') {
      return 'FINALIZADO';
    } else {
      return 'NO_ESPECIFICADO';
    }
  };

  useEffect(() => {
    if (data) {
      console.log('Data:', data);
      setData(data.data);
    }
  }, [data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setIsSubmitting(true);
    try {
      const csvData = await parseCsvFile(csvFile);

      // Mapear los campos del CSV a la estructura de la base de datos
      const validatedData = csvData.map((item) => {
        // Use type assertion to ensure correct string literal types
        const status = mapContractStatus(item.status || '') as
          | 'NO_ESPECIFICADO'
          | 'VIGENTE'
          | 'FINALIZADO';
        const isPossibleToExpand = mapExpansionPossibility(item.isPossibleToExpand || '') as
          | 'SI'
          | 'NO'
          | 'NO_ESPECIFICADO';

        return {
          title: item.title || '',
          fileName: item.fileName || undefined,
          artists: item.artists || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          isPossibleToExpand,
          possibleExtensionTime: item.possibleExtensionTime || undefined,
          status,
          documentId: parseInt(item.documentId || '0'),
          summary: item.summary || undefined,
        };
      });

      // Filtrar cualquier objeto que esté completamente vacío (por si hay filas vacías en el CSV)
      const filteredData = validatedData.filter((item) =>
        Object.values(item).some((value) => value !== ''),
      );

      // Usar la mutación para crear múltiples registros
      const result = await createManyContractsMutation.mutateAsync({
        Contracts: filteredData,
      });

      toast({
        description: `Se han creado ${result.count} registros exitosamente`,
      });

      // Refrescar los datos
      await refetch();
      setCsvFile(null);
    } catch (error) {
      console.error('Error al procesar el CSV:', error);
      toast({
        variant: 'destructive',
        description:
          'Error al procesar el archivo CSV: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (newRecord: Omit<Contract, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { id } = await createContractsMutation.mutateAsync({
        title: newRecord.title ?? '',
        fileName: newRecord.fileName ?? '',
        artists: newRecord.artists ?? '',
        startDate: newRecord.startDate ?? '',
        endDate: newRecord.endDate ?? '',
        isPossibleToExpand: newRecord.isPossibleToExpand ?? '',
        possibleExtensionTime: newRecord.possibleExtensionTime ?? '',
        status: newRecord.status ?? '',
        documentId: newRecord.documentId ?? 0,
        summary: newRecord.summary ?? '',
      });
      console.log('Created Record ID:', id);
      await refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const hanleOnNavegate = (row: Contract) => {
    console.log('row', row);
    const { documentId } = row;
    const documentPath = `${documentRootPath}/${documentId}`;
    console.log('documentRootPath', documentPath);
    window.location.href = documentPath;
  };
  const handleUpdate = async (updatedContracts: Contract) => {
    console.log('Updated User:', updatedContracts);
    console.log('id', updatedContracts.id);
    setIsSubmitting(true);
    try {
      const { id } = await updateContractsMutation.mutateAsync({
        id: updatedContracts.id,
        title: updatedContracts.title ?? '',
        artists: updatedContracts.artists ?? undefined,
        fileName: updatedContracts.fileName ?? undefined,
        startDate: updatedContracts.startDate ?? undefined,
        endDate: updatedContracts.endDate ?? undefined,
        isPossibleToExpand: updatedContracts.isPossibleToExpand ?? undefined,
        possibleExtensionTime: updatedContracts.possibleExtensionTime ?? undefined,
        status: updatedContracts.status ?? undefined,
        documentId: updatedContracts.documentId ?? undefined,
        summary: updatedContracts.summary ?? undefined,
      });

      console.log('Updated Record ID:', id);

      setData(
        dataIntial.map((record) => (record.id === updatedContracts.id ? updatedContracts : record)),
      );
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deleteData: Contract) => {
    try {
      setData(dataIntial.filter((record) => record.id !== deleteData.id));
      await deleteContractsMutation.mutateAsync({ id: deleteData.id });

      toast({
        description: 'Data deleted successfully',
      });
    } catch (error) {
      setData((prevData) => [...prevData, deleteData]);
      toast({
        variant: 'destructive',
        description: 'Error deleting data',
      });
      console.error('Error deleting record:', error);
    }
  };

  const handleEdit = (record: Contract) => {
    setEditingUser(record);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col gap-y-8 px-4 md:px-8">
      <div className="flex flex-row items-center pt-1">
        {team && (
          <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
            {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
            <AvatarFallback className="text-muted-foreground text-xs">
              {team.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        )}

        <h1 className="w-40 truncate text-2xl font-semibold md:text-3xl">
          <Trans>Contracts</Trans>
        </h1>

        <div className="flex w-full items-center justify-end gap-4">
          <Button onClick={openCreateDialog}>Add Item</Button>
          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <div>
            <ContractForm
              isSubmitting={isSubmitting}
              onSubmit={editingUser ? handleUpdate : handleCreate}
              initialData={editingUser}
            />
          </div>
        </DialogContent>
        <div className="mb-4 flex items-center gap-2">
          <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
          <Button onClick={handleCsvUpload} disabled={!csvFile || isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Cargar CSV'}
          </Button>
        </div>
      </Dialog>
      {data && (!data?.data.length || data?.data.length === 0) ? (
        <GeneralTableEmptyState status={'ALL'} />
      ) : (
        <ContractsTable
          data={data}
          isLoading={isLoading}
          isLoadingError={isLoadingError}
          onAdd={openCreateDialog}
          onEdit={handleEdit}
          onNavegate={hanleOnNavegate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
