import { useEffect } from 'react';

import { Trans } from '@lingui/react/macro';
import { Bird, HomeIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { formTasksPath } from '@documenso/lib/utils/teams';
import type { Team } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';

import { TaskCreateDialog } from '~/components/dialogs/task-create-dialog';
import { TasksTable } from '~/components/lists/tasks-list';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export type TasksPageViewProps = {
  team?: Team;
  initialTasks: Awaited<ReturnType<typeof findTasks>>;
};

export function meta() {
  return appMetaTags('Events');
}

export default function TasksPage() {
  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const taskRootPath = formTasksPath(team?.url);
  const { user } = useSession();
  const { data, isLoading, isLoadingError, refetch } = trpc.task.findTasks.useQuery({
    userId: user.id,
    teamId: team?.id,
    // projectId: null,
    // parentTaskId: null,
    status: 'PENDING',
  });

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  const handleTaskClick = (taskId: number) => {
    void navigate(`${taskRootPath}/${taskId}`);
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 pl-0 hover:bg-transparent"
            onClick={async () => await navigate(taskRootPath)}
          >
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </div>

        <div className="flex gap-4 sm:flex-row sm:justify-end">
          <TaskCreateDialog taskRootPath={taskRootPath} />
        </div>
      </div>

      <div className="mt-12">
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
            <Trans>Eventos</Trans>
          </h1>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : isLoadingError ? (
            <div className="flex h-64 items-center justify-center text-red-500">
              <Trans>Error al cargar las tareas</Trans>
            </div>
          ) : data && data.length === 0 ? (
            <div className="text-muted-foreground/60 flex h-96 flex-col items-center justify-center gap-y-4">
              <Bird className="h-12 w-12" strokeWidth={1.5} />

              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  <Trans>No hay tareas</Trans>
                </h3>

                <p className="mt-2 max-w-[50ch]">
                  <Trans>
                    No has creado ninguna tarea todavía. Crea una nueva tarea para comenzar.
                  </Trans>
                </p>
              </div>
            </div>
          ) : (
            <TasksTable
              tasks={(data || [])
                .filter(
                  (task): task is { status: 'PENDING' | 'COMPLETED' } & typeof task =>
                    task.status === 'PENDING' || task.status === 'COMPLETED',
                )
                .map((task) => ({
                  ...task,
                  priority: task.priority === 'CRITICAL' ? 'HIGH' : task.priority,
                  assignees: task.assignees.map((assignee) => ({
                    name: `User ${assignee.userId}`, // Replace with actual logic to get the name
                  })),
                }))}
              isLoading={false} // Ya manejamos el loading arriba
              isLoadingError={false} // Ya manejamos el error arriba
              onTaskClick={handleTaskClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
