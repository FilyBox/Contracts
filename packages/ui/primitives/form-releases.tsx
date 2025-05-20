import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Release, TypeOfRelease } from '@prisma/client';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type Releases } from '@documenso/prisma/client';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { Button } from './button';
import { Card, CardContent } from './card';
import { Checkbox } from './checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';

const TypeOfReleaseValues = {
  ALBUM: 'Album',
  EP: 'EP',
  SINGLE: 'Sencillo',
  ...(typeof TypeOfRelease === 'object' ? TypeOfRelease : {}),
};

const ReleaseValues = {
  FOCUS: 'Focus',
  SOFT: 'Soft',
  ...(typeof Release === 'object' ? Release : {}),
};

const formSchema = z.object({
  date: z.string().optional(),
  artist: z.string().optional(),
  lanzamiento: z.string().optional(),
  typeOfRelease: z.nativeEnum(TypeOfRelease).optional(),
  release: z.nativeEnum(Release).optional(),
  uploaded: z.string().optional(),
  streamingLink: z.string().optional(),
  assets: z.string().optional(),
  canvas: z.boolean().optional(),
  cover: z.boolean().optional(),
  audioWAV: z.boolean().optional(),
  video: z.boolean().optional(),
  banners: z.boolean().optional(),
  pitch: z.boolean().optional(),
  EPKUpdates: z.boolean().optional(),
  WebSiteUpdates: z.boolean().optional(),
  Biography: z.boolean().optional(),
});

interface MyFormProps {
  onSubmit: (data: Releases) => void;
  initialData?: Releases | null;
}

export default function FormReleases({ onSubmit, initialData }: MyFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: '',
      artist: '',
      lanzamiento: '',
      typeOfRelease: undefined,
      release: undefined,
      uploaded: '',
      streamingLink: '',
      assets: '',
      canvas: false,
      cover: false,
      audioWAV: false,
      video: false,
      banners: false,
      pitch: false,
      EPKUpdates: false,
      WebSiteUpdates: false,
      Biography: false,
    },
  });

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
    console.log('Form values:', values);
    try {
      setIsLoading(true);
      const dataToSubmit = initialData?.id ? { ...values, id: initialData.id } : values;
      console.log('Form submitted:', dataToSubmit);

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      await onSubmit(dataToSubmit as unknown as Releases);

      toast({
        description: 'Release submitted successfully',
      });
    } catch (error) {
      console.error('Form submission error', error);
      toast({
        variant: 'destructive',
        description: 'Error submitting release',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="">
          <Card className="border-border dark:bg-background relative p-6">
            {/* <div className="h-20">
              <h1 className="text-xl font-semibold md:text-2xl">Release Information</h1>
              
            </div> */}

            <ScrollArea className="h-[60vh] w-full">
              <hr className="-mx-6 my-4" />

              <CardContent className="px-1 pb-0">
                <fieldset disabled={isLoading} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
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
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="artist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artist</FormLabel>
                            <FormControl>
                              <Input placeholder="Artist name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="lanzamiento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Release title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="typeOfRelease"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type of Release</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value)}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type of release" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(TypeOfReleaseValues).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                        name="release"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Type</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value)}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select release type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(ReleaseValues).map((release) => (
                                  <SelectItem key={release} value={release}>
                                    {release}
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

                  {/* Release Details */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="uploaded"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uploaded</FormLabel>
                            <FormControl>
                              <Input placeholder="Upload status" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="streamingLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Streaming Link</FormLabel>
                            <FormControl>
                              <Input placeholder="Link to streaming" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12">
                      <FormField
                        control={form.control}
                        name="assets"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assets</FormLabel>
                            <FormControl>
                              <Input placeholder="Assets information" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Checkboxes Section */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="canvas"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Canvas</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="cover"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Cover</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="audioWAV"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Audio WAV</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="video"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Video</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="banners"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Banners</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="pitch"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Pitch</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="EPKUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">EPK Updates</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="WebSiteUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Website Updates</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="Biography"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Biography</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </fieldset>
              </CardContent>
            </ScrollArea>

            {/* Submit Button */}
            <div className="mt-6 flex items-center justify-end gap-x-4 px-6">
              {/* <Button type="submit" size="lg" disabled={isLoading} className="min-w-32">
                {isLoading ? 'Submitting...' : 'Submit Release'}
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
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
