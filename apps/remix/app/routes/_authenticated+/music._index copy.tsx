import { useEffect, useState } from 'react';

import { type Lpm } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { createColumns } from '@documenso/ui/primitives/column-custom';
import { DataTableCustom } from '@documenso/ui/primitives/data-table-custom';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import MyForm from '@documenso/ui/primitives/form-custom';
import { useToast } from '@documenso/ui/primitives/use-toast';

// import { type LpmData } from '@documenso/ui/primitives/types';

export default function TablePage() {
  const { data, isLoading, isLoadingError, refetch } = trpc.Lpm.findLpm.useQuery();
  const createLpmMutation = trpc.Lpm.createLpm.useMutation();
  const updateLpmMutation = trpc.Lpm.updateLpmById.useMutation();
  const deleteLpmMutation = trpc.Lpm.deleteLpmById.useMutation();
  const { toast } = useToast();

  // type LpmData = (typeof data.music)[number];
  const [dataIntial, setData] = useState<Lpm[]>([]);
  const [editingUser, setEditingUser] = useState<Lpm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const columns = createColumns();
  useEffect(() => {
    if (data) {
      console.log('Data:', data.music);
      setData(data.music);
    }
  }, [data]);

  const handleCreate = async (newRecord: Omit<Lpm, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { id } = await createLpmMutation.mutateAsync({
        // Use properties from newRecord
        productId: newRecord.productId,
        productType: newRecord.productType,
        productTitle: newRecord.productTitle,
        productVersion: newRecord.productVersion ?? undefined,
        productDisplayArtist: newRecord.productDisplayArtist,
        parentLabel: newRecord.parentLabel ?? undefined,
        label: newRecord.label,
        originalReleaseDate: newRecord.originalReleaseDate ?? undefined,
        releaseDate: newRecord.releaseDate,
        upc: newRecord.upc,
        catalog: newRecord.catalog,
        productPriceTier: newRecord.productPriceTier ?? undefined,
        productGenre: newRecord.productGenre ?? '',
        submissionStatus: newRecord.submissionStatus,
        productCLine: newRecord.productCLine,
        productPLine: newRecord.productPLine,
        preOrderDate: newRecord.preOrderDate ?? undefined,
        exclusives: newRecord.exclusives ?? undefined,
        explicitLyrics: newRecord.explicitLyrics,
        productPlayLink: newRecord.productPlayLink ?? undefined,
        linerNotes: newRecord.linerNotes ?? undefined,
        primaryMetadataLanguage: newRecord.primaryMetadataLanguage,
        compilation: newRecord.compilation ?? undefined,
        pdfBooklet: newRecord.pdfBooklet ?? undefined,
        timedReleaseDate: newRecord.timedReleaseDate ?? undefined,
        timedReleaseMusicServices: newRecord.timedReleaseMusicServices ?? undefined,
        lastProcessDate: newRecord.lastProcessDate,
        importDate: newRecord.importDate,

        // Required fields from schema
        createdBy: newRecord.createdBy ?? 'system',
        lastModified: newRecord.lastModified ?? new Date().toISOString(),
        submittedAt: newRecord.submittedAt ?? new Date().toISOString(),
        submittedBy: newRecord.submittedBy ?? undefined,
        vevoChannel: newRecord.vevoChannel ?? undefined,

        // Required track fields
        trackType: newRecord.trackType ?? 'default',
        trackId: newRecord.trackId ?? '',
        trackVolume: newRecord.trackVolume ?? undefined,
        trackNumber: newRecord.trackNumber ?? '',
        trackName: newRecord.trackName ?? '',
        trackVersion: newRecord.trackVersion ?? undefined,
        trackDisplayArtist: newRecord.trackDisplayArtist ?? '',
        isrc: newRecord.isrc ?? '',
        trackPriceTier: newRecord.trackPriceTier ?? undefined,
        trackGenre: newRecord.trackGenre ?? '',
        audioLanguage: newRecord.audioLanguage ?? '',
        trackCLine: newRecord.trackCLine ?? '',
        trackPLine: newRecord.trackPLine ?? '',
        writersComposers: newRecord.writersComposers ?? '',
        publishersCollectionSocieties: newRecord.publishersCollectionSocieties ?? '',
        withholdMechanicals: newRecord.withholdMechanicals ?? '',
        preOrderType: newRecord.preOrderType ?? undefined,
        instantGratificationDate: newRecord.instantGratificationDate ?? '',
        duration: newRecord.duration ?? '',
        sampleStartTime: newRecord.sampleStartTime ?? '',
        explicitLyricsTrack: newRecord.explicitLyricsTrack ?? '',
        albumOnly: newRecord.albumOnly ?? '',
        lyrics: newRecord.lyrics ?? undefined,
        additionalContributorsPerforming: newRecord.additionalContributorsPerforming ?? undefined,
        additionalContributorsNonPerforming:
          newRecord.additionalContributorsNonPerforming ?? undefined,
        producers: newRecord.producers ?? '',
        continuousMix: newRecord.continuousMix ?? '',
        continuouslyMixedIndividualSong: newRecord.continuouslyMixedIndividualSong ?? '',
        trackPlayLink: newRecord.trackPlayLink ?? '',
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

  const handleUpdate = async (updatedLpm: Lpm) => {
    console.log('Updated User:', updatedLpm);
    console.log('id', updatedLpm.id);
    setIsSubmitting(true);
    try {
      const { id } = await updateLpmMutation.mutateAsync({
        id: updatedLpm.id,
        productId: updatedLpm.productId,
        productType: updatedLpm.productType,
        productTitle: updatedLpm.productTitle,
        productVersion: updatedLpm.productVersion ?? undefined,
        productDisplayArtist: updatedLpm.productDisplayArtist,
        parentLabel: updatedLpm.parentLabel ?? undefined,
        label: updatedLpm.label,
        originalReleaseDate: updatedLpm.originalReleaseDate ?? undefined,
        releaseDate: updatedLpm.releaseDate,
        upc: updatedLpm.upc,
        catalog: updatedLpm.catalog,
        productPriceTier: updatedLpm.productPriceTier ?? undefined,
        productGenre: updatedLpm.productGenre ?? '',
        submissionStatus: updatedLpm.submissionStatus,
        productCLine: updatedLpm.productCLine,
        productPLine: updatedLpm.productPLine,
        preOrderDate: updatedLpm.preOrderDate ?? undefined,
        exclusives: updatedLpm.exclusives ?? undefined,
        explicitLyrics: updatedLpm.explicitLyrics,
        productPlayLink: updatedLpm.productPlayLink ?? undefined,
        linerNotes: updatedLpm.linerNotes ?? undefined,
        primaryMetadataLanguage: updatedLpm.primaryMetadataLanguage,
        compilation: updatedLpm.compilation ?? undefined,
        pdfBooklet: updatedLpm.pdfBooklet ?? undefined,
        timedReleaseDate: updatedLpm.timedReleaseDate ?? undefined,
        timedReleaseMusicServices: updatedLpm.timedReleaseMusicServices ?? undefined,
        lastProcessDate: updatedLpm.lastProcessDate,
        importDate: updatedLpm.importDate,

        // Required fields from schema
        createdBy: updatedLpm.createdBy ?? 'system',
        lastModified: updatedLpm.lastModified ?? new Date().toISOString(),
        submittedAt: updatedLpm.submittedAt ?? new Date().toISOString(),
        submittedBy: updatedLpm.submittedBy ?? undefined,
        vevoChannel: updatedLpm.vevoChannel ?? undefined,

        // Required track fields
        trackType: updatedLpm.trackType ?? 'default',
        trackId: updatedLpm.trackId ?? '',
        trackVolume: updatedLpm.trackVolume ?? undefined,
        trackNumber: updatedLpm.trackNumber ?? '',
        trackName: updatedLpm.trackName ?? '',
        trackVersion: updatedLpm.trackVersion ?? undefined,
        trackDisplayArtist: updatedLpm.trackDisplayArtist ?? '',
        isrc: updatedLpm.isrc ?? '',
        trackPriceTier: updatedLpm.trackPriceTier ?? undefined,
        trackGenre: updatedLpm.trackGenre ?? '',
        audioLanguage: updatedLpm.audioLanguage ?? '',
        trackCLine: updatedLpm.trackCLine ?? '',
        trackPLine: updatedLpm.trackPLine ?? '',
        writersComposers: updatedLpm.writersComposers ?? '',
        publishersCollectionSocieties: updatedLpm.publishersCollectionSocieties ?? '',
        withholdMechanicals: updatedLpm.withholdMechanicals ?? '',
        preOrderType: updatedLpm.preOrderType ?? undefined,
        instantGratificationDate: updatedLpm.instantGratificationDate ?? '',
        duration: updatedLpm.duration ?? '',
        sampleStartTime: updatedLpm.sampleStartTime ?? '',
        explicitLyricsTrack: updatedLpm.explicitLyricsTrack ?? '',
        albumOnly: updatedLpm.albumOnly ?? '',
        lyrics: updatedLpm.lyrics ?? undefined,
        additionalContributorsPerforming: updatedLpm.additionalContributorsPerforming ?? undefined,
        additionalContributorsNonPerforming:
          updatedLpm.additionalContributorsNonPerforming ?? undefined,
        producers: updatedLpm.producers ?? '',
        continuousMix: updatedLpm.continuousMix ?? '',
        continuouslyMixedIndividualSong: updatedLpm.continuouslyMixedIndividualSong ?? '',
        trackPlayLink: updatedLpm.trackPlayLink ?? '',
      });

      console.log('Updated Record ID:', id);

      setData(dataIntial.map((record) => (record.id === updatedLpm.id ? updatedLpm : record)));
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deleteData: Lpm) => {
    try {
      setData(dataIntial.filter((record) => record.id !== deleteData.id));
      await deleteLpmMutation.mutateAsync({ id: deleteData.id });

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

  const handleEdit = (record: Lpm) => {
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
          {/* <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit' : 'Create New'}</DialogTitle>
            <DialogDescription>
              Please fill out the form below to{' '}
              {editingUser ? 'update the data' : 'create a new data'}.
            </DialogDescription>
          </DialogHeader> */}
          <div>
            <MyForm
              isSubmitting={isSubmitting}
              onSubmit={editingUser ? handleUpdate : handleCreate}
              initialData={editingUser}
            />
          </div>
        </DialogContent>
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
