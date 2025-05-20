import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useNavigate, useSearchParams } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { formReleasePath } from '@documenso/lib/utils/teams';
import { type Team } from '@documenso/prisma/client';
import { type Releases } from '@documenso/prisma/client';
import { ExtendedRelease, ExtendedReleaseType } from '@documenso/prisma/types/extended-release';
import { trpc } from '@documenso/trpc/react';
import {
  type TFindReleaseInternalResponse,
  type TFindReleaseResponse,
  ZFindReleaseInternalRequestSchema,
} from '@documenso/trpc/server/releases-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import FormReleases from '@documenso/ui/primitives/form-releases';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { DocumentSearch } from '~/components/general/document/document-search';
import { PeriodSelector } from '~/components/general/period-selector';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { ReleasesTable } from '~/components/tables/releases-table';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export type TasksPageViewProps = {
  team?: Team;
  initialTasks: Awaited<ReturnType<typeof findTasks>>;
};

export function meta() {
  return appMetaTags('Tasks');
}

const ZSearchParamsSchema = ZFindReleaseInternalRequestSchema.pick({
  type: true,
  release: true,
  period: true,
  page: true,
  perPage: true,
  query: true,
});

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const releasesRootPath = formReleasePath(team?.url);
  const { user } = useSession();
  const { data, isLoading, isLoadingError, refetch } = trpc.release.findRelease.useQuery({
    query: findDocumentSearchParams.query,
    type: findDocumentSearchParams.type,
    release: findDocumentSearchParams.release,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
  });
  const createMutation = trpc.release.createRelease.useMutation();
  const updateMutation = trpc.release.updateRelease.useMutation();
  const deleteMutation = trpc.release.deleteRelease.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dataIntial, setData] = useState<TFindReleaseResponse>();
  const [editingUser, setEditingUser] = useState<Releases | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (data) {
      console.log('Data:', data);
      setData(data);
    }
  }, [data]);
  const handleCreate = async (newRecord: Omit<Releases, 'id'>) => {
    console.log('New Record:', newRecord);
    try {
      const { id } = await createMutation.mutateAsync({
        date: newRecord.date || undefined,
        artist: newRecord.artist || undefined,
        lanzamiento: newRecord.lanzamiento || undefined,
        typeOfRelease: newRecord.typeOfRelease || undefined,
        release: newRecord.release || undefined,
        uploaded: newRecord.uploaded || undefined,
        streamingLink: newRecord.streamingLink || undefined,
        assets: newRecord.assets || undefined,
        canvas: newRecord.canvas || undefined,
        cover: newRecord.cover || undefined,
        audioWAV: newRecord.audioWAV || undefined,
        video: newRecord.video || undefined,
        banners: newRecord.banners || undefined,
        pitch: newRecord.pitch || undefined,
        EPKUpdates: newRecord.EPKUpdates || undefined,
        WebSiteUpdates: newRecord.WebSiteUpdates || undefined,
        Biography: newRecord.Biography || undefined,
      });
      console.log('Created Record ID:', id);
      await refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating record:', error);
    }
    console.log('New Record:', newRecord);
    const record = { ...newRecord, id: Number(dataIntial?.data?.length ?? 0) + 1 };
    if (dataIntial) {
      setData({
        ...dataIntial,
        data: [...dataIntial.data, record],
        count: dataIntial.count + 1,
      });
    }
    setIsDialogOpen(false);
  };

  const handleUpdate = async (updated: Releases) => {
    console.log('Updated User:', updated);
    console.log('id', updated.id);
    try {
      const { id } = await updateMutation.mutateAsync({
        id: updated.id,
        date: updated.date || undefined,
        artist: updated.artist || undefined,
        lanzamiento: updated.lanzamiento || undefined,
        typeOfRelease: updated.typeOfRelease || undefined,
        release: updated.release || undefined,
        uploaded: updated.uploaded || undefined,
        streamingLink: updated.streamingLink || undefined,
        assets: updated.assets || undefined,
        canvas: updated.canvas || undefined,
        cover: updated.cover || undefined,
        audioWAV: updated.audioWAV || undefined,
        video: updated.video || undefined,
        banners: updated.banners || undefined,
        pitch: updated.pitch || undefined,
        EPKUpdates: updated.EPKUpdates || undefined,
        WebSiteUpdates: updated.WebSiteUpdates || undefined,
        Biography: updated.Biography || undefined,
      });

      console.log('Updated Record ID:', id);

      if (dataIntial) {
        setData({
          ...dataIntial,
          data: dataIntial.data.map((record) => (record.id === updated.id ? updated : record)),
        });
      }
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleEdit = (record: TFindReleaseResponse['data'][number]) => {
    setEditingUser(record as Releases);
    setIsDialogOpen(true);
  };

  const handleDelete = async (deleteData: TFindReleaseResponse['data'][number]) => {
    try {
      if (dataIntial) {
        setData({
          ...dataIntial,
          data: dataIntial.data.filter((record) => record.id !== deleteData.id),
          count: dataIntial.count - 1,
        });
      }
      await deleteMutation.mutateAsync({ releaseId: deleteData.id });

      toast({
        description: 'Data deleted successfully',
      });
    } catch (error) {
      setData((prevData) =>
        prevData
          ? { ...prevData, data: [...prevData.data, deleteData], count: prevData.count + 1 }
          : undefined,
      );
      toast({
        variant: 'destructive',
        description: 'Error deleting data',
      });
      console.error('Error deleting record:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const [type, setType] = useState<TFindReleaseInternalResponse['type']>({
    [ExtendedReleaseType.Album]: 0,
    [ExtendedReleaseType.EP]: 0,
    [ExtendedReleaseType.Sencillo]: 0,
    [ExtendedReleaseType.ALL]: 0,
  });

  const [release, setRelease] = useState<TFindReleaseInternalResponse['release']>({
    [ExtendedRelease.Focus]: 0,
    [ExtendedRelease.Soft]: 0,
    [ExtendedRelease.ALL]: 0,
  });

  // useEffect(() => {
  //   if (data?.type) {
  //     setType(data.type);
  //   }
  // }, [data?.type]);

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  type TeamMember = {
    name: string | null;
    email: string;
  };
  const teamMembers = [] as TeamMember[];
  const isloadingTeamMembers = false;
  const isLoadingErrorTeamMembers = false;

  const getTabHref = (value: keyof typeof ExtendedReleaseType) => {
    const params = new URLSearchParams(searchParams);

    params.set('type', value);

    if (value === ExtendedReleaseType.ALL) {
      params.delete('type');
    }

    if (params.has('page')) {
      params.delete('page');
    }

    return `${formReleasePath(team?.url)}?${params.toString()}`;
  };

  const handleTaskClick = (taskId: number) => {
    void navigate(`${releasesRootPath}/${taskId}`);
  };

  return (
    <div className="mx-auto max-w-screen-xl gap-y-8 px-4 md:px-8">
      {/* <CardsChat /> */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit' : 'Create New'}</DialogTitle>
            <DialogDescription>
              Please fill out the form below to{' '}
              {editingUser ? 'update the data' : 'create a new data'}.
            </DialogDescription>
          </DialogHeader>
          <div>
            <FormReleases
              onSubmit={editingUser ? handleUpdate : handleCreate}
              initialData={editingUser}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-8">
        <div className="flex flex-row items-center">
          {team && (
            <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
              {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
              <AvatarFallback className="text-muted-foreground text-xs">
                {team.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <h1 className="truncate text-2xl font-semibold md:text-3xl">
            <Trans>Releases</Trans>
          </h1>
        </div>

        <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
          {/* <Tabs value={findDocumentSearchParams.type || 'ALL'} className="overflow-x-auto">
            <TabsList>
              {[
                ExtendedReleaseType.Sencillo,
                ExtendedReleaseType.Album,
                ExtendedReleaseType.EP,
                ExtendedReleaseType.ALL,
              ].map((value) => (
                <TabsTrigger
                  key={value}
                  className="hover:text-foreground min-w-[60px]"
                  value={value}
                  asChild
                >
                  <Link to={getTabHref(value)} preventScrollReset>
                    <ReleaseType type={value} />

                    {value !== ExtendedReleaseType.ALL && (
                      <span className="ml-1 inline-block opacity-50">{type[value]}</span>
                    )}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs> */}

          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <PeriodSelector />
          </div>
          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <Button onClick={openCreateDialog}>Create Release</Button>
          </div>
        </div>

        <div className="mt w-full">
          {data && data.count === 0 && (!data?.data.length || data?.data.length === 0) ? (
            <GeneralTableEmptyState status={'ALL'} />
          ) : (
            // <p>sin data</p>
            <ReleasesTable
              data={dataIntial}
              isLoading={isLoading}
              isLoadingError={isLoadingError}
              onAdd={openCreateDialog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
