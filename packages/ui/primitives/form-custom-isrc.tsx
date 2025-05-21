import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type IsrcSongs } from '@documenso/prisma/client';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { cn } from '../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Card, CardContent } from './card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem } from './select';

const formSchema = z.object({
  id: z.number(),
  trackName: z.string().optional(),
  artist: z.string().optional(),
  duration: z.string().optional(),
  title: z.string().optional(),
  license: z.string().optional(),
  date: z.string().optional(),
});
interface MyFormProps {
  onSubmit: (data: IsrcSongs) => void;
  initialData: IsrcSongs | null;
  isSubmitting: boolean;
}

// Tipo para los pasos del formulario

export default function MyForm({ onSubmit, initialData }: MyFormProps) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // trackPlayLink: '',
      // preOrderType: '',
      // instantGratificationDate: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key !== 'id') {
          // Skip the id field
          // @ts-expect-error - We know these fields exist in our form schema
          form.setValue(key, initialData[key]);
        }
      });
    }
  }, [form, initialData]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const dataToSubmit = initialData?.id ? { ...values, id: initialData.id } : values;
      console.log('Form submitted:', dataToSubmit);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      await onSubmit(dataToSubmit as unknown as IsrcSongs);
      console.log('Form submitted successfully', values);
      toast({
        description: 'Data submitted successfully',
      });
    } catch (error) {
      console.error('Form submission error', error);
      toast({
        variant: 'destructive',
        description: 'Error submitting data',
      });
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    console.log('Form errors use effect:', form.formState.errors);
  }, [form.formState.errors]);
  // Función para validar los campos del paso 1 y avanzar al paso 2

  const productTypeOptions = [
    { label: 'Álbum', value: 'Album' },
    { label: 'Single', value: 'Single' },
    { label: 'EP', value: 'EP' },
    { label: 'Compilación', value: 'Compilation' },
  ];

  return (
    <div className="mx-auto max-w-6xl py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="">
          <Card className="border-border dark:bg-background relative p-6">
            <div className="h-20">
              <h1 className="text-xl font-semibold md:text-2xl">Información de la Pista</h1>
              <p className="text-muted-foreground mt-2 text-xs md:text-sm">
                Complete la información detallada de la pista o canción. Esta información es
                esencial para la distribución musical.
              </p>
            </div>

            <ScrollArea className="h-[60vh] w-full">
              <hr className="-mx-6 my-4" />
              <CardContent className="px-1 pb-0">
                <fieldset disabled={isSubmitting} className="space-y-6">
                  {/* Sección 1: Información básica del producto */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      {/* <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Date</FormLabel>
                                                <FormControl>
                                                  <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          /> */}

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-[240px] pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      format(
                                        // Only try to format if field.value is a non-empty string
                                        field.value && field.value.trim() !== ''
                                          ? new Date(field.value + 'T00:00:00')
                                          : new Date(),
                                        'dd/MM/yyyy',
                                      )
                                    ) : (
                                      <span>Pick a date</span>
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
                        name="trackName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Track Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre de la pista" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="artist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artista</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <Input placeholder="Artista" {...field} />
                              </FormControl>
                              <SelectContent>
                                {productTypeOptions.map((option) => (
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
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titulo (Album)</FormLabel>
                            <FormControl>
                              <Input placeholder="Titulo (Album)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración</FormLabel>
                            <FormControl>
                              <Input placeholder="2:40 min" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="license"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Licencia</FormLabel>
                            <FormControl>
                              <Input placeholder="Licencia" {...field} />
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

            {/* Botones de navegación */}
            <div className="mt-6 flex items-center gap-x-4 px-6">
              <Button
                disabled={isLoading}
                loading={isLoading}
                type="button"
                size="lg"
                className="flex-1"
                onClick={() => {
                  const values = form.getValues();
                  void handleSubmit(values); // Using void operator to explicitly mark as intentionally unhandled
                }}
              >
                Completar
              </Button>{' '}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
