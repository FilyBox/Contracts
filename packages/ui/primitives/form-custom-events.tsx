import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type IsrcSongs } from '@documenso/prisma/client';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { Button } from './button';
import { Card, CardContent } from './card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { ScrollArea } from './scroll-area';

const formSchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: 'El nombre es obligatorio' }),
  description: z.string().optional(),
  image: z.string().optional(),
  venue: z.string().optional(),
  artists: z.array(z.string()).optional(),
  beginning: z.date().optional(),
  end: z.date().optional(),
});
interface MyFormProps {
  onSubmit: (data: IsrcSongs) => void;
  initialData: IsrcSongs | null;
  isSubmitting: boolean;
}

// Tipo para los pasos del formulario
type FormStep = 'PRODUCT_INFO' | 'TRACK_INFO';

export default function MyForm({ onSubmit, initialData }: MyFormProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<FormStep>('PRODUCT_INFO');
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
  const onNextClick = async () => {
    const productFields = [
      'trackName',
      'artist',
      'duration',
      'title',
      'license',
      'date',
      // 'productId',
    ];
    const isValid = await form.trigger(productFields as Array<keyof z.infer<typeof formSchema>>);

    if (isValid) {
      setStep('TRACK_INFO');
    } else {
      toast({
        variant: 'destructive',
        description: 'Por favor completa todos los campos requeridos.',
      });
    }
  };

  // // Opciones para selects
  // const yesNoOptions = [
  //   { label: 'Sí', value: 'Yes' },
  //   { label: 'No', value: 'No' },
  // ];

  // const genreOptions = [
  //   { label: 'Rock', value: 'Rock' },
  //   { label: 'Pop', value: 'Pop' },
  //   { label: 'Hip Hop', value: 'Hip Hop' },
  //   { label: 'Electrónica', value: 'Electronic' },
  //   { label: 'Clásica', value: 'Classical' },
  //   { label: 'Jazz', value: 'Jazz' },
  //   { label: 'R&B', value: 'R&B' },
  //   { label: 'Latina', value: 'Latin' },
  // ];

  // const languageOptions = [
  //   { label: 'Español', value: 'Spanish' },
  //   { label: 'Inglés', value: 'English' },
  //   { label: 'Francés', value: 'French' },
  //   { label: 'Alemán', value: 'German' },
  //   { label: 'Japonés', value: 'Japanese' },
  //   { label: 'Portugués', value: 'Portuguese' },
  // ];

  // const productTypeOptions = [
  //   { label: 'Álbum', value: 'Album' },
  //   { label: 'Single', value: 'Single' },
  //   { label: 'EP', value: 'EP' },
  //   { label: 'Compilación', value: 'Compilation' },
  // ];

  // const trackTypeOptions = [
  //   { label: 'Audio', value: 'Audio' },
  //   { label: 'Video', value: 'Video' },
  //   { label: 'Remix', value: 'Remix' },
  //   { label: 'Acústico', value: 'Acoustic' },
  // ];

  // const statusOptions = [
  //   { label: 'Borrador', value: 'Draft' },
  //   { label: 'Pendiente', value: 'Pending' },
  //   { label: 'Enviado', value: 'Submitted' },
  //   { label: 'Aprobado', value: 'Approved' },
  //   { label: 'Rechazado', value: 'Rejected' },
  // ];

  return (
    <div className="mx-auto max-w-6xl py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="">
          <Card className="border-border dark:bg-background relative p-6">
            {step === 'PRODUCT_INFO' && (
              <div className="h-20">
                <h1 className="text-xl font-semibold md:text-2xl">
                  Información del Producto Musical
                </h1>
                <p className="text-muted-foreground mt-2 text-xs md:text-sm">
                  Complete la información básica del producto o álbum musical. Todos los campos
                  marcados son obligatorios.
                </p>
              </div>
            )}

            {step === 'TRACK_INFO' && (
              <div className="h-20">
                <h1 className="text-xl font-semibold md:text-2xl">Información de la Pista</h1>
                <p className="text-muted-foreground mt-2 text-xs md:text-sm">
                  Complete la información detallada de la pista o canción. Esta información es
                  esencial para la distribución musical.
                </p>
              </div>
            )}

            <ScrollArea className="h-[60vh] w-full">
              <hr className="-mx-6 my-4" />

              {/* Paso 1: Información del Producto */}
              {step === 'PRODUCT_INFO' && (
                <CardContent className="px-1 pb-0">
                  <fieldset disabled={isSubmitting} className="space-y-6">
                    {/* Sección 1: Información básica del producto */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Track Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Diego Rivera " {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="artist"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del artista</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <Input placeholder="El Millonario" {...field} />
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
                       */}

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título del Producto</FormLabel>
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
                          name="image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titulo de la canción</FormLabel>
                              <FormControl>
                                <Input placeholder="Bombos y tarolas" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="venue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de la Pista</FormLabel>
                              <FormControl>
                                <Input placeholder="Título de la canción" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </fieldset>
                </CardContent>
              )}

              {/* Indicador de Progreso */}
              <div className="mt-6 px-6">
                {step === 'PRODUCT_INFO' && (
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium">Información del Producto</span> 1/2
                  </p>
                )}

                {step === 'TRACK_INFO' && (
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium">Información de la Pista</span> 2/2
                  </p>
                )}

                <div className="bg-foreground/40 relative mt-4 h-1.5 rounded-full">
                  <motion.div
                    layout="size"
                    layoutId="form-step-progress"
                    className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
                    style={{
                      width: step === 'PRODUCT_INFO' ? '50%' : '100%',
                    }}
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Botones de navegación */}
            <div className="mt-6 flex items-center gap-x-4 px-6">
              {/* Botón para volver al paso anterior */}
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="flex-1"
                loading={isLoading}
                disabled={step === 'PRODUCT_INFO' || isLoading}
                onClick={() => setStep('PRODUCT_INFO')}
              >
                Volver
              </Button>

              {/* Botón para avanzar o enviar */}
              {step === 'PRODUCT_INFO' && (
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 disabled:cursor-not-allowed"
                  loading={isLoading}
                  onClick={onNextClick}
                >
                  Siguiente
                </Button>
              )}

              {step === 'TRACK_INFO' && (
                <>
                  {/* <Button
                      onClick={() => console.log('pepe')}
                      type="submit"
                      size="lg"
                      className="flex-1"
                      loading={isSubmitting}
                    >
                      Completar
                    </Button> */}
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
                  </Button>
                </>
              )}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
