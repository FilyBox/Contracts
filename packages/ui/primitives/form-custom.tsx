import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type Lpm } from '@documenso/prisma/client';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { Button } from './button';
import { Card, CardContent } from './card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';
import { Textarea } from './textarea';

const formSchema = z.object({
  productId: z.string(),
  productType: z.string(),
  productTitle: z.string(),
  productVersion: z.string().optional(),
  productDisplayArtist: z.string(),
  parentLabel: z.string().optional(),
  label: z.string(),
  originalReleaseDate: z.string().optional(),
  releaseDate: z.string(),
  upc: z.string(),
  catalog: z.string(),
  productPriceTier: z.string().optional(),
  productGenre: z.string(),
  submissionStatus: z.string(),
  productCLine: z.string(),
  productPLine: z.string(),
  preOrderDate: z.string().optional(),
  exclusives: z.string().optional(),
  explicitLyrics: z.string(),
  productPlayLink: z.string().optional(),
  linerNotes: z.string().optional(),
  primaryMetadataLanguage: z.string(),
  compilation: z.string().optional(),
  pdfBooklet: z.string().optional(),
  timedReleaseDate: z.string().optional(),
  timedReleaseMusicServices: z.string().optional(),
  lastProcessDate: z.string(),
  importDate: z.string(),
  createdBy: z.string(),
  lastModified: z.string(),
  submittedAt: z.string(),
  submittedBy: z.string().optional(),
  vevoChannel: z.string().optional(),
  trackType: z.string(),
  trackId: z.string(),
  trackVolume: z.boolean().optional(),
  trackNumber: z.string(),
  trackName: z.string(),
  trackVersion: z.string().optional(),
  trackDisplayArtist: z.string(),
  isrc: z.string(),
  trackPriceTier: z.string().optional(),
  trackGenre: z.string(),
  audioLanguage: z.string(),
  trackCLine: z.string(),
  trackPLine: z.string(),
  writersComposers: z.string(),
  publishersCollectionSocieties: z.string(),
  withholdMechanicals: z.string(),
  preOrderType: z.string().optional(),
  instantGratificationDate: z.string().optional(),
  duration: z.string(),
  sampleStartTime: z.string().optional(),
  explicitLyricsTrack: z.string(),
  albumOnly: z.string(),
  lyrics: z.string().optional(),
  additionalContributorsPerforming: z.string().optional(),
  additionalContributorsNonPerforming: z.string().optional(),
  producers: z.string().optional(),
  continuousMix: z.string().optional(),
  continuouslyMixedIndividualSong: z.string().optional(),
  trackPlayLink: z.string().optional(),
});
interface MyFormProps {
  onSubmit: (data: Lpm) => void;
  initialData: Lpm | null;
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
      submissionStatus: 'Draft',
      explicitLyrics: 'No',
      explicitLyricsTrack: 'No',
      albumOnly: 'No',
      trackVolume: false,
      withholdMechanicals: 'No',
      continuousMix: 'No',
      continuouslyMixedIndividualSong: 'No',

      // Add default empty strings for all optional fields
      productVersion: '',
      parentLabel: '',
      originalReleaseDate: '',
      productPriceTier: '',
      preOrderDate: '',
      exclusives: '',
      productPlayLink: '',
      linerNotes: '',
      compilation: '',
      pdfBooklet: '',
      timedReleaseDate: '',
      timedReleaseMusicServices: '',
      submittedBy: '',
      vevoChannel: '',
      trackVersion: '',
      trackPriceTier: '',
      sampleStartTime: '',
      lyrics: '',
      additionalContributorsPerforming: '',
      additionalContributorsNonPerforming: '',
      producers: '',
      trackPlayLink: '',
      preOrderType: '',
      instantGratificationDate: '',
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
      await onSubmit(dataToSubmit as unknown as Lpm);
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
      'productId',
      'productType',
      'productTitle',
      'productDisplayArtist',
      'label',
      'releaseDate',
      'upc',
      'catalog',
      'productGenre',
      'submissionStatus',
      'productCLine',
      'productPLine',
      'explicitLyrics',
      'primaryMetadataLanguage',
      'lastProcessDate',
      'importDate',
      'createdBy',
      'lastModified',
      'submittedAt',
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

  // Opciones para selects
  const yesNoOptions = [
    { label: 'Sí', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  const genreOptions = [
    { label: 'Rock', value: 'Rock' },
    { label: 'Pop', value: 'Pop' },
    { label: 'Hip Hop', value: 'Hip Hop' },
    { label: 'Electrónica', value: 'Electronic' },
    { label: 'Clásica', value: 'Classical' },
    { label: 'Jazz', value: 'Jazz' },
    { label: 'R&B', value: 'R&B' },
    { label: 'Latina', value: 'Latin' },
  ];

  const languageOptions = [
    { label: 'Español', value: 'Spanish' },
    { label: 'Inglés', value: 'English' },
    { label: 'Francés', value: 'French' },
    { label: 'Alemán', value: 'German' },
    { label: 'Japonés', value: 'Japanese' },
    { label: 'Portugués', value: 'Portuguese' },
  ];

  const productTypeOptions = [
    { label: 'Álbum', value: 'Album' },
    { label: 'Single', value: 'Single' },
    { label: 'EP', value: 'EP' },
    { label: 'Compilación', value: 'Compilation' },
  ];

  const trackTypeOptions = [
    { label: 'Audio', value: 'Audio' },
    { label: 'Video', value: 'Video' },
    { label: 'Remix', value: 'Remix' },
    { label: 'Acústico', value: 'Acoustic' },
  ];

  const statusOptions = [
    { label: 'Borrador', value: 'Draft' },
    { label: 'Pendiente', value: 'Pending' },
    { label: 'Enviado', value: 'Submitted' },
    { label: 'Aprobado', value: 'Approved' },
    { label: 'Rechazado', value: 'Rejected' },
  ];

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
                          name="productId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID del Producto</FormLabel>
                              <FormControl>
                                <Input placeholder="PRD123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Producto</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tipo de producto" />
                                  </SelectTrigger>
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
                          name="productTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título del Producto</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del álbum o single" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productVersion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Versión del Producto (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Deluxe Edition, Remastered, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productDisplayArtist"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Artista Principal</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del artista" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="releaseDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Lanzamiento</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sección 2: Información de sello y comercial */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="label"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sello Discográfico</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del sello" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="parentLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sello Principal (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Sello matriz" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="upc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UPC (Código Universal de Producto)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 884977968484" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="catalog"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Catálogo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: ABC-123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productPriceTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nivel de Precio (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Standard, Budget, Premium" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productGenre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Género Musical</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona género" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {genreOptions.map((option) => (
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
                    </div>

                    <Separator />

                    {/* Sección 3: Información adicional y derechos */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productCLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Copyright (℗)</FormLabel>
                              <FormControl>
                                <Input placeholder="℗ 2025 Sello Discográfico" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productPLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishing (©)</FormLabel>
                              <FormControl>
                                <Input placeholder="© 2025 Editora Musical" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="primaryMetadataLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Idioma Principal de Metadatos</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona idioma" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languageOptions.map((option) => (
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
                          name="explicitLyrics"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contenido Explícito</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una opción" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yesNoOptions.map((option) => (
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
                    </div>

                    <Separator />

                    {/* Sección 4: Información de estado y sistema */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="submissionStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado de Envío</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
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

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="lastProcessDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Última Fecha de Procesamiento</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="importDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Importación</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="createdBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Creado Por</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="lastModified"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Última Modificación</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="submittedAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Enviado En</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
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

              {/* Paso 2: Información de la Pista */}
              {step === 'TRACK_INFO' && (
                <CardContent className="px-0 pb-0">
                  <fieldset disabled={isSubmitting} className="space-y-6">
                    {/* Sección 1: Información básica de pista */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID de Pista</FormLabel>
                              <FormControl>
                                <Input placeholder="TRK123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Pista</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tipo de pista" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {trackTypeOptions.map((option) => (
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
                          name="trackName"
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

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Pista</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackDisplayArtist"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Artista de la Pista</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre del artista para esta pista"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackVersion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Versión de la Pista (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Remix, Live, Acoustic, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="isrc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ISRC</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: USABC1234567" {...field} />
                              </FormControl>
                              <FormDescription>
                                Código Internacional Estándar de Grabación
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sección 2: Información de derechos y comercial */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackCLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Copyright de Pista (℗)</FormLabel>
                              <FormControl>
                                <Input placeholder="℗ 2025 Sello Discográfico" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackPLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishing de Pista (©)</FormLabel>
                              <FormControl>
                                <Input placeholder="© 2025 Editora Musical" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackGenre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Género de la Pista</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona género" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {genreOptions.map((option) => (
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
                          disabled={isLoading}
                          control={form.control}
                          name="audioLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Idioma del Audio</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona idioma" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languageOptions.map((option) => (
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
                          disabled={isLoading}
                          control={form.control}
                          name="explicitLyricsTrack"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contenido Explícito en Pista</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una opción" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yesNoOptions.map((option) => (
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
                    </div>

                    <Separator />

                    {/* Sección 3: Información técnica */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duración</FormLabel>
                              <FormControl>
                                <Input placeholder="03:45" {...field} />
                              </FormControl>
                              <FormDescription>Formato mm:ss</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="albumOnly"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>¿Solo en Álbum?</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una opción" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yesNoOptions.map((option) => (
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
                          disabled={isLoading}
                          control={form.control}
                          name="writersComposers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compositores</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombres de compositores separados por comas"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="publishersCollectionSocieties"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Editoras y Sociedades de Gestión</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Editoras y sociedades separadas por comas"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sección 4: Información complementaria */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="lyrics"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Letras (Opcional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Letras de la canción"
                                  className="min-h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="producers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Productores (Opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombres de productores separados por comas"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="additionalContributorsPerforming"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Colaboradores Adicionales (Intérpretes) (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Músicos, vocalistas, etc." {...field} />
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
