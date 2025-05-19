import { useEffect, useState } from 'react';

import { type IsrcSongs } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import { createColumnsIsrc } from '@documenso/ui/primitives/column-custom';
import { DataTableCustom } from '@documenso/ui/primitives/data-table-custom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@documenso/ui/primitives/dialog';
import MyForm from '@documenso/ui/primitives/form-custom-isrc';
import { Input } from '@documenso/ui/primitives/input';
import { Label } from '@documenso/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';
import { useToast } from '@documenso/ui/primitives/use-toast';

// Definimos los campos del CSV
type CsvFields = {
  'Fecha (año)': string;
  ISRC: string;
  Track: string;
  Artista: string;
  'Duración / Tipo': string;
  'Titulo (Álbum/Single/LP/EP)': string;
  Licencia: string;
};

type CsvColumnMapping = {
  csvColumn: keyof CsvFields | '';
  field: keyof Omit<IsrcSongs, 'id'>;
};

export default function TablePage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<(keyof CsvFields)[]>([]);
  const [columnMapping, setColumnMapping] = useState<CsvColumnMapping[]>([
    { csvColumn: 'Track', field: 'trackName' },
    { csvColumn: 'Artista', field: 'artist' },
    { csvColumn: 'Duración / Tipo', field: 'duration' },
    { csvColumn: 'Titulo (Álbum/Single/LP/EP)', field: 'title' },
    { csvColumn: 'Licencia', field: 'license' },
    { csvColumn: 'Fecha (año)', field: 'date' },
  ]);

  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const { data, isLoading, isLoadingError, refetch } = trpc.IsrcSongs.findIsrcSongs.useQuery();
  const createIsrcSongsMutation = trpc.IsrcSongs.createIsrcSongs.useMutation();
  const createManyIsrcSongsMutation = trpc.IsrcSongs.createManyIsrcSongs.useMutation();
  const updateIsrcSongsMutation = trpc.IsrcSongs.updateIsrcSongsById.useMutation();
  const deleteIsrcSongsMutation = trpc.IsrcSongs.deleteIsrcSongsById.useMutation();
  const { toast } = useToast();

  const [dataIntial, setData] = useState<IsrcSongs[]>([]);
  const [editingUser, setEditingUser] = useState<IsrcSongs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const columns = createColumnsIsrc();

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };
  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data]);

  const extractCsvHeaders = async (file: File) => {
    const text = await file.text();
    const firstLine = text.split('\n')[0];
    const headers = firstLine.split(',').map((h) => h.trim()) as (keyof CsvFields)[];
    setCsvHeaders(headers);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCsvFile(file);
      await extractCsvHeaders(file);
      setIsMappingDialogOpen(true);
    }
  };

  const handleMappingChange = (index: number, value: keyof CsvFields | '') => {
    const newMapping = [...columnMapping];
    newMapping[index].csvColumn = value;
    setColumnMapping(newMapping);
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

  const parseCsvFile = async (file: File): Promise<Partial<Omit<IsrcSongs, 'id'>>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map((h) => h.trim()) as (keyof CsvFields)[];

          const result = lines.slice(1).map((line) => {
            const values = line.split(',');
            const obj: Partial<Omit<IsrcSongs, 'id'>> = {};

            columnMapping.forEach((mapping) => {
              if (mapping.csvColumn && mapping.field) {
                const columnIndex = headers.indexOf(mapping.csvColumn);
                if (columnIndex !== -1 && values[columnIndex]) {
                  obj[mapping.field] = values[columnIndex].trim();
                }
              }
            });

            return obj;
          });

          resolve(result.filter((item) => Object.values(item).some((val) => val)));
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsText(file);
    });
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

  const handleEdit = (record: IsrcSongs) => {
    setEditingUser(record);
    setIsDialogOpen(true);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setIsSubmitting(true);
    try {
      const csvData = await parseCsvFile(csvFile);

      // Validar que al menos un campo esté mapeado
      if (columnMapping.every((m) => !m.csvColumn)) {
        throw new Error('Debes mapear al menos una columna');
      }

      const validatedData = csvData.map((item) => ({
        trackName: item.trackName ?? '',
        artist: item.artist ?? '',
        duration: item.duration ?? '',
        title: item.title ?? '',
        license: item.license ?? '',
        date: item.date ?? '',
        isrc: item.isrc ?? '', // Agregado para manejar el campo ISRC
      }));

      const result = await createManyIsrcSongsMutation.mutateAsync({
        isrcSongs: validatedData,
      });

      toast({
        description: `Se han creado ${result.count} registros exitosamente`,
      });

      await refetch();
      setCsvFile(null);
      setIsMappingDialogOpen(false);
    } catch (error) {
      console.error('Error al procesar el CSV:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Error al procesar el archivo CSV',
      });
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

  // ... (resto de tus funciones handleCreate, handleUpdate, handleDelete, etc. se mantienen igual)

  return (
    <div className="mx-auto">
      {/* Diálogo para mapeo de columnas */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Mapeo de columnas del CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {columnMapping.map((mapping, index) => (
              <div key={mapping.field} className="grid grid-cols-2 items-center gap-4">
                <Label>{mapping.field}</Label>
                <Select
                  value={mapping.csvColumn}
                  onValueChange={(value: keyof CsvFields | '') => handleMappingChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona columna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No mapear</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMappingDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCsvUpload} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo existente para el formulario */}
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
      </Dialog>

      {/* Sección de carga de CSV */}
      <div className="mb-4 flex items-center gap-2">
        <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
      </div>

      <DataTableCustom
        columns={columns}
        data={dataIntial}
        onAdd={openCreateDialog}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
