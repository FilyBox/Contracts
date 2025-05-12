import { useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { FilePlus, Loader } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { Input } from '@documenso/ui/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

type TaskCreateDialogProps = {
  taskRootPath: string;
  teamId?: number;
  projectId?: number;
  parentTaskId?: number;
};

export const TaskCreateDialog = ({
  taskRootPath,
  teamId,
  projectId,
  parentTaskId,
}: TaskCreateDialogProps) => {
  const navigate = useNavigate();
  const { user } = useSession(); // Obtenemos el usuario de la sesión
  const { toast } = useToast();
  const { _ } = useLingui();

  const { mutateAsync: createTask } = trpc.task.createTask.useMutation();

  const [showTaskCreateDialog, setShowTaskCreateDialog] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskData, setTaskData] = useState<{
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate: string;
    tags: string[];
  }>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    tags: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    setTaskData((prev) => ({ ...prev, priority: value }));
  };

  const onCreateTask = async () => {
    if (isCreatingTask || !user.id) {
      return;
    }

    setIsCreatingTask(true);

    try {
      const { id } = await createTask({
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        userId: user.id, // Usamos el ID del usuario de la sesión
        teamId,
        projectId,
        parentTaskId,
      });

      toast({
        title: _(msg`Task created successfully`),
        description: _(msg`Your task has been created. You will be redirected to the task page.`),
        duration: 5000,
      });

      setShowTaskCreateDialog(false);
      await navigate(`${taskRootPath}/${id}`);
    } catch (error) {
      console.error('Error creating task:', error);

      let errorDescription = _(msg`Please try again later.`);

      if (error.data?.code === 'P2025') {
        if (error.data?.meta?.modelName === 'User') {
          errorDescription = _(msg`User session is invalid. Please log in again.`);
        } else if (error.data?.meta?.modelName === 'Team') {
          errorDescription = _(msg`The specified team does not exist or you don't have access.`);
        } else if (error.data?.meta?.modelName === 'Project') {
          errorDescription = _(msg`The specified project does not exist or you don't have access.`);
        }
      }

      toast({
        title: _(msg`Failed to create task`),
        description: errorDescription,
        variant: 'destructive',
      });

      setIsCreatingTask(false);
    }
  };

  const canCreateTask = Boolean(user.id) && !isCreatingTask && taskData.title;

  return (
    <Dialog
      open={showTaskCreateDialog}
      onOpenChange={(value) => !isCreatingTask && setShowTaskCreateDialog(value)}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer" disabled={!user.emailVerified}>
          <FilePlus className="-ml-1 mr-2 h-4 w-4" />
          <Trans>New Task</Trans>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Task</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Create a new task with details like title, description, priority and due date.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              <Trans>Title</Trans>
            </label>
            <Input
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              <Trans>Description</Trans>
            </label>
            <Textarea
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                <Trans>Priority</Trans>
              </label>
              <Select value={taskData.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                <Trans>Due Date</Trans>
              </label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={taskData.dueDate}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          </div>

          {isCreatingTask && (
            <div className="flex items-center justify-center rounded-lg py-4">
              <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreatingTask}>
              <Trans>Cancel</Trans>
            </Button>
          </DialogClose>
          <Button type="button" onClick={onCreateTask} disabled={!canCreateTask}>
            <Trans>Create Task</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
