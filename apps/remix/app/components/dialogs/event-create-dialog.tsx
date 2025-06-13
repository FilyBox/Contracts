import { useState } from 'react';
import { useRef } from 'react';

import { Trans } from '@lingui/react/macro';
import { FilePlus, Loader } from 'lucide-react';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { putFile } from '@documenso/lib/universal/upload/put-file';
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
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { ImageUploader } from '../general/dropzone';

type EventCreateDialogProps = {
  teamId?: number;
};

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const result = await putFile(file);
    await fetch('/api/guardar-imagen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3Key: result.data }),
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
  }
};

export const EventCreateDialog = ({ teamId: _teamId }: EventCreateDialogProps) => {
  const { user } = useSession();
  const maxLength = 250;
  const { toast } = useToast();
  const [image, setImage] = useState<File | null>(null);
  const imageUploaderRef = useRef<{ resetPreview: () => void }>(null);

  const { mutateAsync: createEvent } = trpc.event.createEvent.useMutation();

  const [showEventCreateDialog, setShowEventCreateDialog] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [EventData, setEventData] = useState<{
    name: string;
    description: string | undefined;
    image: string | undefined;
    venue: string | undefined;
    artists: string[] | undefined;
    isrc: string | undefined;
    beginning: Date;
    end: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  }>({
    name: '',
    description: undefined,
    image: undefined,
    venue: undefined,
    artists: undefined,
    beginning: new Date(),
    isrc: undefined,
    end: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const { data: artistsList = [] } = trpc.artist.findArtistsAll.useQuery();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'teamId') {
      setEventData((prev) => ({ ...prev, teamId: value ? Number(value) : undefined }));
    } else if (name === 'beginning') {
      setEventData((prev) => ({ ...prev, beginning: value ? new Date(value) : new Date() }));
    } else if (name === 'end') {
      setEventData((prev) => ({ ...prev, end: value ? new Date(value) : new Date() }));
    } else {
      setEventData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const onCreateEvent = async () => {
    if (isCreatingEvent || !user.id) return;
    setIsCreatingEvent(true);

    try {
      await createEvent({
        name: EventData.name,
        description: EventData.description,
        image: EventData.image,
        venue: EventData.venue,
        artists: EventData.artists,
        beginning: EventData.beginning,
        end: EventData.end,
      });

      toast({
        title: 'Event created successfully',
        description: 'Your Event has been created.',
        duration: 5000,
      });

      setShowEventCreateDialog(false);
      setIsCreatingEvent(false);
    } catch (error) {
      toast({
        title: 'Failed to create Event',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      setIsCreatingEvent(false);
    }
  };

  const canCreateEvent = Boolean(user.id) && !isCreatingEvent && EventData.name;

  return (
    <Dialog
      open={showEventCreateDialog}
      onOpenChange={(value) => !isCreatingEvent && setShowEventCreateDialog(value)}
    >
      <DialogTrigger asChild>
        <Button className="m-1 cursor-pointer" disabled={!user.emailVerified}>
          <FilePlus className="-ml-1 mr-2 h-4 w-4" />
          <Trans>New Event</Trans>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-full max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Event</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Create a new Event with details like name, roles, events, songs, and url.</Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-100">
              <Trans>Name</Trans>
            </label>
            <Input
              id="name"
              name="name"
              value={EventData.name}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
            <label htmlFor="description" className="mt-4 block text-sm font-medium text-gray-100">
              <Trans>Description</Trans>
            </label>
            <Textarea
              id="description"
              name="description"
              value={EventData.description}
              maxLength={maxLength}
              onChange={handleTextareaChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="beginning" className="block text-sm font-medium text-gray-100">
              <Trans>Beginning</Trans>
            </label>
            <Input
              id="beginning"
              name="beginning"
              type="date"
              value={EventData.beginning ? EventData.beginning.toISOString().slice(0, 10) : ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="end" className="block text-sm font-medium text-gray-100">
              <Trans>End</Trans>
            </label>
            <Input
              id="end"
              name="end"
              type="date"
              value={EventData.beginning ? EventData.beginning.toISOString().slice(0, 10) : ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="flex w-full items-center justify-center">
            <ImageUploader
              onUpload={async (file: File) => {
                try {
                  // Limita el nombre base a 50 caracteres
                  const parts = file.name.split('.');
                  const ext = parts.length > 1 ? '.' + parts.pop() : '';
                  let base = parts.join('.');
                  if (base.length > 50) base = base.slice(0, 50);
                  const safeName = base + ext;

                  // Crea un nuevo File con el nombre truncado
                  const truncatedFile = new File([file], safeName, { type: file.type });

                  const result = await putFile(truncatedFile);
                  setEventData((prev) => ({
                    ...prev,
                    image: result.data,
                  }));
                  setImage(truncatedFile);
                } catch (error) {
                  console.error('Error al subir la imagen:', error);
                }
              }}
              image={image}
              isPending={isCreatingEvent}
            />
          </div>

          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-100">
              <Trans>Venue</Trans>
            </label>
            <Input
              id="venue"
              name="venue"
              type="string"
              value={EventData.venue ?? ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="artists" className="block text-sm font-medium text-gray-100">
              <Trans>Artists</Trans>
            </label>
            <select
              id="artists"
              name="artists"
              multiple
              value={EventData.artists}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(
                  (opt) => opt.value,
                );
                setEventData((prev) => ({ ...prev, artists: selectedOptions }));
              }}
              className="mt-1 block w-full rounded border-gray-300"
            >
              {artistsList.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isCreatingEvent && (
          <div className="flex items-center justify-center rounded-lg py-4">
            <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreatingEvent}>
              <Trans>Cancel</Trans>
            </Button>
          </DialogClose>
          <Button type="button" onClick={onCreateEvent} disabled={!canCreateEvent}>
            <Trans>Create Event</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
