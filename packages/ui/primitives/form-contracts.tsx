import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ContractStatus, ExpansionPossibility } from '@prisma/client';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type Contract } from '@documenso/prisma/client';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { cn } from '../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Card, CardContent } from './card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';

// Define the enum types from Prisma

// Interface for Contract model

const formSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: 'Title is required' }),
  fileName: z.string().optional().nullable(),
  artists: z.string().min(1, { message: 'Artists are required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  isPossibleToExpand: z.nativeEnum(ExpansionPossibility),
  possibleExtensionTime: z.string().optional().nullable(),
  status: z.nativeEnum(ContractStatus),
  documentId: z.number().optional(),
  summary: z.string().optional().nullable(),
});

interface ContractFormProps {
  onSubmit: (data: Contract) => void;
  initialData: Contract | null;
  isSubmitting?: boolean;
}

export default function ContractForm({
  onSubmit,
  initialData,
  isSubmitting = false,
}: ContractFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      fileName: '',
      artists: '',
      startDate: '',
      endDate: '',
      isPossibleToExpand: ExpansionPossibility.NO_ESPECIFICADO,
      possibleExtensionTime: '',
      status: ContractStatus.NO_ESPECIFICADO,
      summary: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          // Skip the id field and timestamps
          // @ts-expect-error - We know these fields exist in our form schema
          form.setValue(key, initialData[key]);
        }
      });

      if (initialData.id) {
        form.setValue('id', initialData.id);
      }
    }
  }, [form, initialData]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const dataToSubmit = initialData?.id ? { ...values, id: initialData.id } : values;
      console.log('Form submitted:', dataToSubmit);
      await onSubmit(dataToSubmit as Contract);
      console.log('Form submitted successfully', values);
      toast({
        description: 'Contract data submitted successfully',
      });
    } catch (error) {
      console.error('Form submission error', error);
      toast({
        variant: 'destructive',
        description: 'Error submitting contract data',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const expansionOptions = [
    { label: 'Sí', value: ExpansionPossibility.SI },
    { label: 'No', value: ExpansionPossibility.NO },
    { label: 'No Especificado', value: ExpansionPossibility.NO_ESPECIFICADO },
  ];

  const statusOptions = [
    { label: 'Finalizado', value: ContractStatus.FINALIZADO },
    { label: 'Vigente', value: ContractStatus.VIGENTE },
    { label: 'No Especificado', value: ContractStatus.NO_ESPECIFICADO },
  ];

  return (
    <div className="mx-auto max-w-6xl py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="">
          <Card className="border-border dark:bg-background relative p-6">
            <div className="h-20">
              <h1 className="text-xl font-semibold md:text-2xl">Información del Contrato</h1>
              <p className="text-muted-foreground mt-2 text-xs md:text-sm">
                Complete la información detallada del contrato. Esta información es esencial para la
                gestión de contratos.
              </p>
            </div>

            <ScrollArea className="h-[60vh] w-full">
              <hr className="-mx-6 my-4" />
              <CardContent className="px-1 pb-0">
                <fieldset disabled={isSubmitting} className="space-y-6">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input placeholder="Título del contrato" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="fileName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Archivo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nombre del archivo"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="artists"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artistas</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombres de los artistas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Inicio</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      format(
                                        field.value && field.value.trim() !== ''
                                          ? new Date(field.value + 'T00:00:00')
                                          : new Date(),
                                        'dd/MM/yyyy',
                                      )
                                    ) : (
                                      <span>Seleccione una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="z-9999 w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={(() => {
                                    try {
                                      return field.value && field.value.trim() !== ''
                                        ? new Date(field.value + 'T00:00:00')
                                        : undefined;
                                    } catch (error) {
                                      return undefined;
                                    }
                                  })()}
                                  onSelect={(date) =>
                                    field.onChange(date ? date.toISOString().split('T')[0] : '')
                                  }
                                  disabled={(date) => date < new Date('1900-01-01')}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Finalización</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      format(
                                        field.value && field.value.trim() !== ''
                                          ? new Date(field.value + 'T00:00:00')
                                          : new Date(),
                                        'dd/MM/yyyy',
                                      )
                                    ) : (
                                      <span>Seleccione una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="z-9999 w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={(() => {
                                    try {
                                      return field.value && field.value.trim() !== ''
                                        ? new Date(field.value + 'T00:00:00')
                                        : undefined;
                                    } catch (error) {
                                      return undefined;
                                    }
                                  })()}
                                  onSelect={(date) =>
                                    field.onChange(date ? date.toISOString().split('T')[0] : '')
                                  }
                                  disabled={(date) => date < new Date('1900-01-01')}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="isPossibleToExpand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>¿Es posible expandir?</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(value as ExpansionPossibility)
                              }
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione una opción" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {expansionOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="possibleExtensionTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiempo posible de extensión</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 6 meses"
                                {...field}
                                value={field.value || ''}
                                disabled={
                                  form.watch('isPossibleToExpand') !== ExpansionPossibility.SI
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value as ContractStatus)}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12">
                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resumen</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Resumen del contrato"
                                className="min-h-[100px]"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </fieldset>
              </CardContent>
            </ScrollArea>

            <div className="mt-6 flex items-center gap-x-4 px-6">
              <Button
                disabled={isLoading || isSubmitting}
                loading={isLoading}
                type="submit"
                size="lg"
                className="flex-1"
              >
                {initialData?.id ? 'Actualizar Contrato' : 'Crear Contrato'}
              </Button>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
