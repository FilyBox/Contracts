import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useSearchParams } from 'react-router';

import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { type IsrcSongs } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { ZFindIsrcSongsInternalRequestSchema } from '@documenso/trpc/server/isrcsong-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { createColumnsIsrc } from '@documenso/ui/primitives/column-custom';
import { DataTableCustom } from '@documenso/ui/primitives/data-table-custom';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import MyForm from '@documenso/ui/primitives/form-custom-isrc';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { DocumentSearch } from '~/components/general/document/document-search';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { IsrcTable } from '~/components/tables/isrc-table';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

// import { type IsrcSongsData } from '@documenso/ui/primitives/types';

type CsvColumnMapping = {
  csvColumn: string;
  field: keyof Omit<IsrcSongs, 'id'> | '';
};

export function meta() {
  return appMetaTags('Isrc');
}

const ZSearchParamsSchema = ZFindIsrcSongsInternalRequestSchema.pick({
  period: true,
  page: true,
  perPage: true,
  query: true,
});

export default function IsrcPage() {
  const [searchParams] = useSearchParams();
  const team = useOptionalCurrentTeam();

  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  const { data, isLoading, isLoadingError, refetch } = trpc.isrcSongs.findIsrcSongs.useQuery({
    query: findDocumentSearchParams.query,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
  });

  const createIsrcSongsMutation = trpc.isrcSongs.createIsrcSongs.useMutation();
  const createManyIsrcSongsMutation = trpc.isrcSongs.createManyIsrcSongs.useMutation();
  const updateIsrcSongsMutation = trpc.isrcSongs.updateIsrcSongsById.useMutation();
  const deleteIsrcSongsMutation = trpc.isrcSongs.deleteIsrcSongsById.useMutation();
  const { toast } = useToast();

  // type IsrcSongsData = (typeof data.isrcSongs)[number];
  const [dataIntial, setData] = useState<IsrcSongs[]>([]);
  const [editingUser, setEditingUser] = useState<IsrcSongs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const columns = createColumnsIsrc();

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
      const validatedData = csvData.map((item) => ({
        trackName: item.Track || '', // Mapear "Track" a trackName
        artist: item.Artista || '', // Mapear "Artista" a artist
        duration: item['Duración / Tipo'] || '', // Mapear "Duración / Tipo" a duration
        title: item['Titulo (Álbum/Single/LP/EP)'] || '', // Mapear "Titulo..." a title
        license: item.Licencia || '', // Mapear "Licencia" a license
        date: item['Fecha (año)'] || '', // Mapear "Fecha (año)" a date
        isrc: item['ISRC'] || '',
      }));

      // Filtrar cualquier objeto que esté completamente vacío (por si hay filas vacías en el CSV)
      const filteredData = validatedData.filter((item) =>
        Object.values(item).some((value) => value !== ''),
      );

      // Usar la mutación para crear múltiples registros
      const result = await createManyIsrcSongsMutation.mutateAsync({
        isrcSongs: filteredData,
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

  const handleCreate = async (newRecord: Omit<IsrcSongs, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { id } = await createIsrcSongsMutation.mutateAsync({
        trackName: newRecord.trackName ?? '',
        artist: newRecord.artist ?? '',
        duration: newRecord.duration ?? '',
        title: newRecord.title ?? '',
        license: newRecord.license ?? '',
        date: newRecord.date ?? '',
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

  const handleUpdate = async (updatedIsrcSongs: IsrcSongs) => {
    console.log('Updated User:', updatedIsrcSongs);
    console.log('id', updatedIsrcSongs.id);
    setIsSubmitting(true);
    try {
      const { id } = await updateIsrcSongsMutation.mutateAsync({
        id: updatedIsrcSongs.id,

        trackName: updatedIsrcSongs.trackName ?? undefined,
        artist: updatedIsrcSongs.artist ?? undefined,
        duration: updatedIsrcSongs.duration ?? undefined,
        title: updatedIsrcSongs.title ?? undefined,
        license: updatedIsrcSongs.license ?? undefined,
        date: updatedIsrcSongs.date ?? undefined,
      });

      console.log('Updated Record ID:', id);

      setData(
        dataIntial.map((record) => (record.id === updatedIsrcSongs.id ? updatedIsrcSongs : record)),
      );
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deleteData: IsrcSongs) => {
    try {
      setData(dataIntial.filter((record) => record.id !== deleteData.id));
      await deleteIsrcSongsMutation.mutateAsync({ id: deleteData.id });

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

  const handleEdit = (record: IsrcSongs) => {
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
          <Trans>Isrc</Trans>
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
            <MyForm
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
        <IsrcTable
          data={data}
          isLoading={isLoading}
          isLoadingError={isLoadingError}
          onAdd={openCreateDialog}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
