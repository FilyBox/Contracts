import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { FolderIcon, HomeIcon, Loader2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { FolderType } from '@documenso/lib/types/folder-type';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { formatContractsPath } from '@documenso/lib/utils/teams';
import { type Contract, type IsrcSongs } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { type TFolderWithSubfolders } from '@documenso/trpc/server/folder-router/schema';
import { ZFindIsrcSongsInternalRequestSchema } from '@documenso/trpc/server/isrcsong-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import ContractForm from '@documenso/ui/primitives/form-contracts';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { CreateFolderDialogContract } from '~/components/dialogs/folder-create-dialog-contracts';
import { FolderDeleteDialog } from '~/components/dialogs/folder-delete-dialog';
import { FolderMoveDialog } from '~/components/dialogs/folder-move-dialog';
import { FolderSettingsDialog } from '~/components/dialogs/folder-settings-dialog';
import { MoveToFolderDialog } from '~/components/dialogs/move-to-folder-dialog';
import { DocumentDropZoneWrapper } from '~/components/general/document/document-drop-zone-wrapper';
import { DocumentSearch } from '~/components/general/document/document-search';
import { FolderCard } from '~/components/general/folder/folder-card';
import { ContractsTable } from '~/components/tables/contracts-table';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

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
  const navigate = useNavigate();

  const team = useOptionalCurrentTeam();

  const documentRootPath = formatContractsPath(team?.url);

  const [isMovingDocument, setIsMovingDocument] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<number | null>(null);
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const [folderToMove, setFolderToMove] = useState<TFolderWithSubfolders | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<TFolderWithSubfolders | null>(null);
  const [isSettingsFolderOpen, setIsSettingsFolderOpen] = useState(false);
  const [folderToSettings, setFolderToSettings] = useState<TFolderWithSubfolders | null>(null);

  const { folderId } = useParams();
  const [dataIntial, setData] = useState<Contract[]>([]);
  const [editingUser, setEditingUser] = useState<Contract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const { mutateAsync: pinFolder } = trpc.folder.pinFolder.useMutation();
  const { mutateAsync: unpinFolder } = trpc.folder.unpinFolder.useMutation();

  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );

  const { data, isLoading, isLoadingError, refetch } = trpc.contracts.findContracts.useQuery({
    query: findDocumentSearchParams.query,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
    folderId: folderId,
  });
  const createContractsMutation = trpc.contracts.createContracts.useMutation();
  const createManyContractsMutation = trpc.contracts.createManyContracts.useMutation();
  const updateContractsMutation = trpc.contracts.updateContractsById.useMutation();
  const deleteContractsMutation = trpc.contracts.deleteContractsById.useMutation();
  const { toast } = useToast();

  const {
    data: foldersData,
    isLoading: isFoldersLoading,
    refetch: refetchFolders,
  } = trpc.folder.getFolders.useQuery({
    parentId: folderId,
  });

  useEffect(() => {
    void refetch();
    void refetchFolders();
  }, [team?.url]);

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

  const handleViewAllFolders = () => {
    void navigate(`${formatContractsPath(team?.url)}/folders`);
  };

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
        status: newRecord.status ?? 'NO_ESPECIFICADO',
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
        artists: updatedContracts.artists ?? '',
        fileName: updatedContracts.fileName ?? undefined,
        startDate: updatedContracts.startDate ?? '',
        endDate: updatedContracts.endDate ?? '',
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

  const navigateToFolder = (folderId?: string | null) => {
    const documentsPath = formatContractsPath(team?.url);

    if (folderId) {
      void navigate(`${formatContractsPath(team?.url)}/f/${folderId}`);
    } else {
      void navigate(documentsPath);
    }
  };

  return (
    <DocumentDropZoneWrapper>
      <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 pl-0 hover:bg-transparent"
              onClick={() => navigateToFolder(null)}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Button>

            {foldersData?.breadcrumbs.map((folder) => (
              <div key={folder.id} className="flex items-center space-x-2">
                <span>/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 pl-1 hover:bg-transparent"
                  onClick={() => navigateToFolder(folder.id)}
                >
                  <FolderIcon className="h-4 w-4" />
                  <span>{folder.name}</span>
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 sm:flex-row sm:justify-end">
            <CreateFolderDialogContract />
          </div>
        </div>

        {isFoldersLoading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {foldersData?.folders && foldersData.folders.some((folder) => folder.pinned) && (
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {foldersData.folders
                    .filter((folder) => folder.pinned)
                    .map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onNavigate={navigateToFolder}
                        onMove={(folder) => {
                          setFolderToMove(folder);
                          setIsMovingFolder(true);
                        }}
                        onPin={(folderId) => void pinFolder({ folderId })}
                        onUnpin={(folderId) => void unpinFolder({ folderId })}
                        onSettings={(folder) => {
                          setFolderToSettings(folder);
                          setIsSettingsFolderOpen(true);
                        }}
                        onDelete={(folder) => {
                          setFolderToDelete(folder);
                          setIsDeletingFolder(true);
                        }}
                      />
                    ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {foldersData?.folders
                  .filter((folder) => !folder.pinned)
                  .map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onNavigate={navigateToFolder}
                      onMove={(folder) => {
                        setFolderToMove(folder);
                        setIsMovingFolder(true);
                      }}
                      onPin={(folderId) => void pinFolder({ folderId })}
                      onUnpin={(folderId) => void unpinFolder({ folderId })}
                      onSettings={(folder) => {
                        setFolderToSettings(folder);
                        setIsSettingsFolderOpen(true);
                      }}
                      onDelete={(folder) => {
                        setFolderToDelete(folder);
                        setIsDeletingFolder(true);
                      }}
                    />
                  ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-4 gap-y-8">
          <div className="flex flex-row items-center">
            {team && (
              <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
                {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
                <AvatarFallback className="text-muted-foreground text-xs">
                  {team.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            )}

            <h2 className="text-4xl font-semibold">
              <Trans>Contracts</Trans>
            </h2>
          </div>

          <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
            <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-4">
              <Button onClick={openCreateDialog}>Add Item</Button>
              <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
                <DocumentSearch initialValue={findDocumentSearchParams.query} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
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
              onMoveDocument={(row: Contract) => {
                setDocumentToMove(row.id);
                setIsMovingDocument(true);
              }}
            />
          )}
        </div>

        {documentToMove && (
          <MoveToFolderDialog
            Id={documentToMove}
            open={isMovingDocument}
            type={FolderType.CONTRACT}
            onOpenChange={(open) => {
              setIsMovingDocument(open);

              if (!open) {
                setDocumentToMove(null);
              }
            }}
            currentFolderId={folderId}
          />
        )}

        <FolderMoveDialog
          foldersData={foldersData?.folders}
          folder={folderToMove}
          isOpen={isMovingFolder}
          onOpenChange={(open) => {
            setIsMovingFolder(open);

            if (!open) {
              setFolderToMove(null);
            }
          }}
        />

        <FolderSettingsDialog
          folder={folderToSettings}
          isOpen={isSettingsFolderOpen}
          onOpenChange={(open) => {
            setIsSettingsFolderOpen(open);

            if (!open) {
              setFolderToSettings(null);
            }
          }}
        />

        <FolderDeleteDialog
          folder={folderToDelete}
          isOpen={isDeletingFolder}
          onOpenChange={(open) => {
            setIsDeletingFolder(open);

            if (!open) {
              setFolderToDelete(null);
            }
          }}
        />
      </div>
    </DocumentDropZoneWrapper>
  );
}
