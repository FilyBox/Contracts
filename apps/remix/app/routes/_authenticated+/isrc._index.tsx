import { useEffect, useState } from 'react';

import { type IsrcSongs } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { createColumnsIsrc } from '@documenso/ui/primitives/column-custom';
import { DataTableCustom } from '@documenso/ui/primitives/data-table-custom';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import MyForm from '@documenso/ui/primitives/form-custom-isrc';
import { useToast } from '@documenso/ui/primitives/use-toast';

// import { type IsrcSongsData } from '@documenso/ui/primitives/types';

export default function TablePage() {
  const { data, isLoading, isLoadingError, refetch } = trpc.IsrcSongs.findIsrcSongs.useQuery();
  const createIsrcSongsMutation = trpc.IsrcSongs.createIsrcSongs.useMutation();
  const updateIsrcSongsMutation = trpc.IsrcSongs.updateIsrcSongsById.useMutation();
  const deleteIsrcSongsMutation = trpc.IsrcSongs.deleteIsrcSongsById.useMutation();
  const { toast } = useToast();

  // type IsrcSongsData = (typeof data.isrcSongs)[number];
  const [dataIntial, setData] = useState<IsrcSongs[]>([]);
  const [editingUser, setEditingUser] = useState<IsrcSongs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const columns = createColumnsIsrc();
  useEffect(() => {
    if (data) {
      console.log('Data:', data);
      setData(data);
    }
  }, [data]);

  const handleCreate = async (newRecord: Omit<IsrcSongs, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { id } = await createIsrcSongsMutation.mutateAsync({
        // Use properties from newRecord
        trackName: newRecord.trackName ?? '',
        artist: newRecord.artist ?? '',
        duration: newRecord.duration ?? '',
        title: newRecord.title ?? '',
        license: newRecord.license ?? '',
        date: newRecord.date ?? '',

        // Required fields from schema
      });
      console.log('Created Record ID:', id);
      await refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setIsSubmitting(false);
    }
    console.log('New Record:', newRecord);
    const record = { ...newRecord, id: Number(dataIntial.length + 1) };
    setData([...dataIntial, record]);
    setIsDialogOpen(false);
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
    <div className="mx-auto">
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
        {/* <div className="flex gap-4 sm:flex-row sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="gap-2" align="end">
              <DropdownMenuItem className="m-1" asChild>
                <ArtistCreateDialog />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <EventCreateDialog />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <WrittersCreateDialog />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </Dialog>
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
