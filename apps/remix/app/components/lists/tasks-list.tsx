import { Trans } from '@lingui/react/macro';
import { CheckCircle, Circle, Clock, Flag, Loader2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@documenso/ui/primitives/table';

export const TasksTable = ({
  tasks,
  isLoading,
  isLoadingError,
  onTaskClick,
  refetch,
}: {
  tasks: Array<{
    id: number;
    title: string;
    description: string | null;
    status: 'PENDING' | 'COMPLETED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: Date | null;
    assignees: Array<{ name: string }>;
  }>;
  isLoading: boolean;
  isLoadingError: boolean;
  onTaskClick: (taskId: number) => void;
  refetch: () => Promise<void>;
}) => {
  const { mutateAsync: deleteTask } = trpc.task.deleteTask.useMutation();

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask({ taskId });
      toast.success('Tarea eliminada correctamente');
      await refetch();
    } catch (error) {
      toast.error('Error al eliminar la tarea');
      console.error('Error deleting task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isLoadingError) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        <Trans>Error al cargar las tareas</Trans>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Trans>Estado</Trans>
          </TableHead>
          <TableHead>
            <Trans>Título</Trans>
          </TableHead>
          <TableHead>
            <Trans>Prioridad</Trans>
          </TableHead>
          <TableHead>
            <Trans>Asignados</Trans>
          </TableHead>
          <TableHead>
            <Trans>Fecha límite</Trans>
          </TableHead>
          <TableHead className="w-[50px]">
            <Trans>Acciones</Trans>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className="hover:bg-muted/50 cursor-pointer">
            <TableCell onClick={() => onTaskClick(task.id)}>
              {task.status === 'COMPLETED' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="text-muted-foreground h-5 w-5" />
              )}
            </TableCell>
            <TableCell onClick={() => onTaskClick(task.id)}>
              <div className="font-medium">{task.title}</div>
              {task.description && (
                <div className="text-muted-foreground line-clamp-1 text-sm">{task.description}</div>
              )}
            </TableCell>
            <TableCell onClick={() => onTaskClick(task.id)}>
              <div className="flex items-center gap-2">
                {task.priority === 'HIGH' && <Flag className="h-4 w-4 fill-red-500 text-red-500" />}
                {task.priority === 'MEDIUM' && (
                  <Flag className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                )}
                {task.priority === 'LOW' && (
                  <Flag className="h-4 w-4 fill-blue-500 text-blue-500" />
                )}
                <span>
                  {task.priority === 'HIGH' && <Trans>Alta</Trans>}
                  {task.priority === 'MEDIUM' && <Trans>Media</Trans>}
                  {task.priority === 'LOW' && <Trans>Baja</Trans>}
                </span>
              </div>
            </TableCell>
            <TableCell onClick={() => onTaskClick(task.id)}>
              {task.assignees.length > 0 ? task.assignees.map((a) => a.name).join(', ') : '-'}
            </TableCell>
            <TableCell onClick={() => onTaskClick(task.id)}>
              {task.dueDate ? (
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTaskClick(task.id)}>
                    <Trans>Ver detalles</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trans>Editar</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteTask(task.id);
                    }}
                  >
                    <Trans>Eliminar</Trans>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
