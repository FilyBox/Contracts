import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useSearchParams } from 'react-router';
import { z } from 'zod';

import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { parseToIntegerArray } from '@documenso/lib/utils/params';
import { type lpm } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { ZFindLpmInternalRequestSchema } from '@documenso/trpc/server/lpm-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import MyForm from '@documenso/ui/primitives/form-custom';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { ArtistCreateDialog } from '~/components/dialogs/artist-create-dialog';
import { DocumentSearch } from '~/components/general/document/document-search';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { LpmTable } from '~/components/tables/lpm-custom-table';
import { TableArtistFilter } from '~/components/tables/lpm-table-artist-filter';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

// import { type LpmData } from '@documenso/ui/primitives/types';

const ZSearchParamsSchema = ZFindLpmInternalRequestSchema.pick({
  period: true,
  page: true,
  perPage: true,
  query: true,
}).extend({
  artistIds: z.string().transform(parseToIntegerArray).optional().catch([]),
});

export function meta() {
  return appMetaTags('Music');
}

export default function TablePage() {
  const [searchParams] = useSearchParams();
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  const { data, isLoading, isLoadingError, refetch } = trpc.lpm.findLpm.useQuery({
    query: findDocumentSearchParams.query,
    artistIds: findDocumentSearchParams.artistIds,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
  });

  const createManyMusicMutation = trpc.lpm.createManyMusic.useMutation();

  const createLpmMutation = trpc.lpm.createLpm.useMutation();
  const updateLpmMutation = trpc.lpm.updateLpmById.useMutation();
  const deleteLpmMutation = trpc.lpm.deleteLpmById.useMutation();
  const { toast } = useToast();
  const team = useOptionalCurrentTeam();

  // type LpmData = (typeof data.music)[number];
  const [dataIntial, setData] = useState<lpm[]>([]);
  const [editingUser, setEditingUser] = useState<lpm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  useEffect(() => {
    if (data) {
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
      // const validatedData = csvData.map((item) => ({
      //   // Campos de producto
      //   productId: item.ProductId || '',
      //   productType: item.ProductType || '',
      //   productTitle: item.ProductTitle || '',
      //   productVersion: item.ProductVersion || undefined,
      //   productDisplayArtist: item.ProductDisplayArtist || '',
      //   parentLabel: item.ParentLabel || undefined,
      //   label: item.Label || '',
      //   originalReleaseDate: item.OriginalReleaseDate || undefined,
      //   releaseDate: item.ReleaseDate || '',
      //   upc: item.UPC || '',
      //   catalog: item.Catalog || '',
      //   productPriceTier: item.ProductPriceTier || undefined,
      //   productGenre: item.ProductGenre || '',
      //   submissionStatus: item.SubmissionStatus || '',
      //   productCLine: item.ProductCLine || '',
      //   productPLine: item.ProductPLine || '',
      //   preOrderDate: item.PreOrderDate || undefined,
      //   exclusives: item.Exclusives || undefined,
      //   explicitLyrics: item.ExplicitLyrics || '',
      //   productPlayLink: item.ProductPlayLink || undefined,
      //   linerNotes: item.LinerNotes || undefined,
      //   primaryMetadataLanguage: item.PrimaryMetadataLanguage || '',
      //   compilation: item.Compilation || undefined,
      //   pdfBooklet: item.PdfBooklet || undefined,
      //   timedReleaseDate: item.TimedReleaseDate || undefined,
      //   timedReleaseMusicServices: item.TimedReleaseMusicServices || undefined,
      //   lastProcessDate: item.LastProcessDate || new Date().toISOString(),
      //   importDate: item.ImportDate || new Date().toISOString(),

      //   // Campos administrativos
      //   createdBy: item.CreatedBy || 'system',
      //   lastModified: item.LastModified || new Date().toISOString(),
      //   submittedAt: item.SubmittedAt || new Date().toISOString(),
      //   submittedBy: item.SubmittedBy || undefined,
      //   vevoChannel: item.VevoChannel || undefined,

      //   // Campos de pistas
      //   trackType: item.TrackType || 'default',
      //   trackId: item.TrackID || '',
      //   trackVolume: item.TrackVolume === '1' ? true : undefined,
      //   trackNumber: item.TrackNumber || '',
      //   trackName: item.Track || '',
      //   trackVersion: item.TrackVersion || undefined,
      //   trackDisplayArtist: item.TrackDisplayArtist || item.Artista || '',
      //   isrc: item.ISRC || '',
      //   trackPriceTier: item.TrackPriceTier || undefined,
      //   trackGenre: item.TrackGenre || '',
      //   audioLanguage: item.AudioLanguage || '',
      //   trackCLine: item.TrackCLine || '',
      //   trackPLine: item.TrackPLine || '',
      //   writersComposers: item.WritersComposers || '',
      //   publishersCollectionSocieties: item.PublishersCollectionSocieties || '',
      //   withholdMechanicals: item.WithholdMechanicals || '',
      //   preOrderType: item.PreOrderType || undefined,
      //   instantGratificationDate: item.InstantGratificationDate || '',
      //   duration: item.Duration || '',
      //   sampleStartTime: item.SampleStartTime || '',
      //   explicitLyricsTrack: item.ExplicitLyricsTrack || '',
      //   albumOnly: item.AlbumOnly || '',
      //   lyrics: item.Lyrics || undefined,
      //   additionalContributorsPerforming: item.AdditionalContributorsPerforming || undefined,
      //   additionalContributorsNonPerforming: item.AdditionalContributorsNonPerforming || undefined,
      //   producers: item.Producers || '',
      //   continuousMix: item.ContinuousMix || '',
      //   continuouslyMixedIndividualSong: item.ContinuouslyMixedIndividualSong || '',
      //   trackPlayLink: item.TrackPlayLink || '',

      //   // Campos adicionales de licencia
      //   license: item.Licencia || '',
      // }));
      const validatedData = csvData.map((item) => ({
        // Campos de producto
        productId: item['Product Id'] || '',
        productType: item['Product Type'] || '',
        productTitle: item['Product Title'] || '',
        productVersion: item['Product Version'] || undefined,
        productDisplayArtist: item['Product Display Artist'] || '',
        parentLabel: item['Parent Label'] || undefined,
        label: item['Label'] || '',
        originalReleaseDate: item['Original Release Date'] || undefined,
        releaseDate: item['Release Date'] || '',
        upc: item['UPC'] || '',
        catalog: item['Catalog #'] || '',
        productPriceTier: item['Product Price Tier'] || undefined,
        productGenre: item['Product Genre'] || '',
        submissionStatus: item['Submission Status'] || '',
        productCLine: item['Product C Line'] || '',
        productPLine: item['Product P Line'] || '',
        preOrderDate: item['Pre-Order Date'] || undefined,
        exclusives: item['Exclusives'] || undefined,
        explicitLyrics: item['ExplicitLyrics'] || '',
        productPlayLink: item['Product Play Link'] || undefined,
        linerNotes: item['Liner Notes'] || undefined,
        primaryMetadataLanguage: item['Primary Metadata Language'] || '',
        compilation: item['Compilation'] || undefined,
        pdfBooklet: item['PDF Booklet'] || undefined,
        timedReleaseDate: item['Timed Release Date'] || undefined,
        timedReleaseMusicServices: item['Timed Release Music Services'] || undefined,
        lastProcessDate: item['Last Process Date'] || new Date().toISOString(),
        importDate: item['Import Date'] || new Date().toISOString(),

        // Campos administrativos
        createdBy: item['Created By'] || 'system',
        lastModified: item['Last Modified'] || new Date().toISOString(),
        submittedAt: item['Submitted At'] || new Date().toISOString(),
        submittedBy: item['Submitted By'] || undefined,
        vevoChannel: item['Vevo Channel'] || undefined,

        // Campos de pistas
        trackType: item['TrackType'] || 'default',
        trackId: item['Track Id'] || '',
        trackVolume: item['Track Volume'] === '1' ? true : undefined,
        trackNumber: item['Track Number'] || '',
        trackName: item['Track Name'] || '',
        trackVersion: item['Track Version'] || undefined,
        trackDisplayArtist: item['Track Display Artist'] || item['Artista'] || '',
        isrc: item['Isrc'] || '',
        trackPriceTier: item['Track Price Tier'] || undefined,
        trackGenre: item['Track Genre'] || '',
        audioLanguage: item['Audio Language'] || '',
        trackCLine: item['Track C Line'] || '',
        trackPLine: item['Track P Line'] || '',
        writersComposers: item['Writers/Composers'] || '',
        publishersCollectionSocieties: item['Publishers/Collection Societies'] || '',
        withholdMechanicals: item['Withhold Mechanicals'] || '',
        preOrderType: item['Pre-Order Type'] || undefined,
        instantGratificationDate: item['Instant Gratification Date'] || '',
        duration: item['Duration'] || '',
        sampleStartTime: item['Sample Start Time'] || '',
        explicitLyricsTrack: item['Explicit Lyrics'] || '',
        albumOnly: item['Album Only'] || '',
        lyrics: item['Lyrics'] || undefined,
        additionalContributorsPerforming: item['AdditionalContributors.Performing'] || undefined,
        additionalContributorsNonPerforming:
          item['AdditionalContributors.NonPerforming'] || undefined,
        producers: item['Producers'] || '',
        continuousMix: item['Continuous Mix'] || '',
        continuouslyMixedIndividualSong: item['Continuously Mixed Individual Song'] || '',
        trackPlayLink: item['Track Play Link'] || '',

        // Campos adicionales de licencia
        license: item['Licencia'] || '',
      }));
      // Filtrar cualquier objeto que esté completamente vacío (por si hay filas vacías en el CSV)
      const filteredData = validatedData.filter((item) =>
        Object.values(item).some((value) => value !== ''),
      );

      // Usar la mutación para crear múltiples registros
      const result = await createManyMusicMutation.mutateAsync({
        music: filteredData,
      });

      toast({
        description: `Se han creado
         ${result.length} 
         registros exitosamente`,
      });

      // Refrescar los datos
      await refetch();
      setCsvFile(null);
    } catch (error) {
      console.error('Error al procesar el CSV:', error);
      toast({
        variant: 'destructive',
        description: 'Error al procesar el archivo CSV: ',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (newRecord: Omit<lpm, 'id'>) => {
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
    // const record = { ...newRecord, id: Number(dataIntial.length + 1) };
    // setData([...dataIntial, record]);
    setIsDialogOpen(false);
  };

  const handleUpdate = async (updatedLpm: lpm) => {
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

  const handleDelete = async (deleteData: lpm) => {
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

  const handleEdit = (record: lpm) => {
    setEditingUser(record);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col gap-y-8 px-4 md:px-8">
      <div className="flex flex-row items-center">
        {team && (
          <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
            {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
            <AvatarFallback className="text-muted-foreground text-xs">
              {team.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        )}

        <h1 className="w-40 truncate text-2xl font-semibold md:text-3xl">
          <Trans>Music</Trans>
        </h1>

        <div className="flex w-full items-center justify-end gap-4">
          <div className="mb-4 flex items-center gap-2">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={handleCsvUpload} disabled={!csvFile || isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Cargar CSV'}
            </Button>
          </div>
          <TableArtistFilter />
          <Button onClick={openCreateDialog}>Add Item</Button>
          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
          <ArtistCreateDialog />
        </div>
      </div>
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

      {data && (!data?.data.length || data?.data.length === 0) ? (
        <GeneralTableEmptyState status={'ALL'} />
      ) : (
        <LpmTable
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
