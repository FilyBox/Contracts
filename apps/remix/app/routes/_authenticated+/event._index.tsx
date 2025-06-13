import { useEffect } from 'react';
import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { Bird, HomeIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { getFileFromS3 } from '@documenso/lib/universal/upload/get-file';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { formTasksPath } from '@documenso/lib/utils/teams';
import type { Team } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@documenso/ui/primitives/card';

import { ArtistCreateDialog } from '~/components/dialogs/artist-create-dialog';
import { EventCreateDialog } from '~/components/dialogs/event-create-dialog';
import { TaskCreateDialog } from '~/components/dialogs/task-create-dialog';
import { TicketTypeCreateDialog } from '~/components/dialogs/ticket-type-create-dialog';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Tasks');
}

export type TasksPageViewProps = {
  team?: Team;
  initialTasks: Awaited<ReturnType<typeof findTasks>>;
};

export default function TasksPage() {
  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const taskRootPath = formTasksPath(team?.url);
  const updateEventMutation = trpc.event.updateEventById.useMutation();
  const deleteEventMutation = trpc.event.deleteEventById.useMutation();
  const { data, isLoading, isLoadingError, refetch } = trpc.event.findEvent.useQuery();

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  const handleTaskClick = (taskId: number) => {
    void navigate(`${taskRootPath}/${taskId}`);
  };

  const handleDelete = async (eventId: number) => {
    try {
      await deleteEventMutation.mutateAsync({ id: eventId });
      await refetch();
    } catch (error) {
      // Puedes manejar el error aquí, por ejemplo mostrar un toast
      console.error('Error al borrar el evento:', error);
    }
  };

  type S3ImageProps = {
    s3Key: string;
    alt?: string;
    [key: string]: unknown;
  };

  function S3Image({ s3Key, alt, ...props }: S3ImageProps) {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;
      async function fetchImage() {
        try {
          const bytes = await getFileFromS3(s3Key);
          const blob = new Blob([bytes]);
          const url = URL.createObjectURL(blob);
          if (isMounted) setSrc(url);
        } catch (e) {
          setSrc(null);
        }
      }
      if (s3Key) void fetchImage();
      return () => {
        isMounted = false;
      };
    }, [s3Key]);

    if (!src) return <div>Cargando imagen...</div>;
    return <img src={src} alt={alt} {...props} />;
  }

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
          <EventCreateDialog />
          <ArtistCreateDialog />
          <TicketTypeCreateDialog />
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
            // En el componente TasksPage, modifica la parte donde usas TasksTable:
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {data?.map((event) => (
                <Card key={event.id} className="transition hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>
                      {event.name.length > 10 ? `${event.name.substring(0, 10)}...` : event.name}
                    </CardTitle>
                    <CardDescription>
                      {event.description && event.description.length > 10
                        ? `${event.description.substring(0, 10)}...`
                        : (event.description ?? '')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Si tienes imagen */}
                    {event.image && (
                      <S3Image
                        s3Key={event.image}
                        alt={event.name}
                        className="mb-2 h-40 w-full rounded object-cover"
                      />
                    )}
                    <div>
                      <strong>
                        <Trans>Inicio:</Trans>
                      </strong>{' '}
                      {event.beginning && new Date(event.beginning).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>
                        <Trans>Fin:</Trans>
                      </strong>{' '}
                      {event.end && new Date(event.end).toLocaleDateString()}
                    </div>
                    {/* Agrega más campos si lo necesitas */}
                  </CardContent>
                  <CardFooter>
                    {/* Puedes agregar botones o acciones aquí */}
                    <div className="flex-3 flex items-center justify-between gap-2">
                      <Button size="sm" onClick={() => handleTaskClick(event.id)}>
                        <Trans>Actualizar</Trans>
                      </Button>
                      <Button size="sm" onClick={async () => handleDelete(event.id)}>
                        <Trans>Borrar</Trans>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
