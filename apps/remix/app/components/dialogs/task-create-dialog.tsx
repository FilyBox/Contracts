'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Loader, PlusCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
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

// from '../../../../../../packages/ui/primitives/form';
// Esquema de validación para el formulario
const taskFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.date().optional(),
  tags: z.string().optional(), // Se convertirá a array
});

type NewTaskDialogProps = {
  teamId?: number;
  projectId?: number;
  parentTaskId?: number;
  onSuccess?: () => void;
};

export const NewTaskDialog = ({
  teamId,
  projectId,
  parentTaskId,
  onSuccess,
}: NewTaskDialogProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { _ } = useLingui();

  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createTask } = trpc.task.createTask.useMutation();

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: undefined,
      tags: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (isSubmitting || !session?.user.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = values.tags ? values.tags.split(',').map((tag) => tag.trim()) : [];

      await createTask({
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate,
        tags: tagsArray,
        userId: session.user.id,
        teamId,
        projectId,
        parentTaskId,
      });

      toast({
        title: _(msg`Tarea creada`),
        description: _(msg`La tarea se ha creado correctamente.`),
        duration: 5000,
      });

      setShowNewTaskDialog(false);
      form.reset();

      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast({
        title: _(msg`Error`),
        description: _(msg`Ocurrió un error al crear la tarea.`),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={showNewTaskDialog}
      onOpenChange={(value) => !isSubmitting && setShowNewTaskDialog(value)}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer" disabled={!session?.user.emailVerified}>
          <PlusCircle className="-ml-1 mr-2 h-4 w-4" />
          <Trans>Nueva Tarea</Trans>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Nueva Tarea</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Completa los detalles para crear una nueva tarea.</Trans>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Título</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la tarea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Descripción</Trans>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles de la tarea..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans>Prioridad</Trans>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Baja</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="CRITICAL">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans>Fecha límite</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value) : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Etiquetas</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="etiqueta1, etiqueta2, etiqueta3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSubmitting}>
                  <Trans>Cancelar</Trans>
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                <Trans>Crear Tarea</Trans>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
