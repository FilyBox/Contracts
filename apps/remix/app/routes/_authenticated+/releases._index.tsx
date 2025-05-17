import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useNavigate, useSearchParams } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { formReleasePath } from '@documenso/lib/utils/teams';
import { type Team } from '@documenso/prisma/client';
import { ExtendedRelease, ExtendedReleaseType } from '@documenso/prisma/types/extended-release';
import { trpc } from '@documenso/trpc/react';
import {
  type TFindReleaseInternalResponse,
  ZFindReleaseInternalRequestSchema,
} from '@documenso/trpc/server/releases-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';

import { DocumentSearch } from '~/components/general/document/document-search';
import { PeriodSelector } from '~/components/general/period-selector';
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
        </div>

        <div className="mt w-full">
          {data && data.count === 0 && (!data?.data.length || data?.data.length === 0) ? (
            // <DocumentsTableEmptyState
            //   status={findDocumentSearchParams.status || ExtendedDocumentStatus.ALL}
            // />
            <p>sin data</p>
          ) : (
            <ReleasesTable data={data} isLoading={isLoading} isLoadingError={isLoadingError} />
          )}
        </div>
      </div>
    </div>
  );
}
