import { useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { FilePlus, Loader } from 'lucide-react';

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
import { useToast } from '@documenso/ui/primitives/use-toast';

type EventCreateDialogProps = {
  teamId?: number;
};

type Role = 'USER' | 'ADMIN'; // Enum según tu backend

export const EventCreateDialog = ({ teamId: _teamId }: EventCreateDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const { _ } = useLingui();

  const { mutateAsync: createEvent } = trpc.event.createEvent.useMutation();

  const [showEventCreateDialog, setShowEventCreateDialog] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [EventData, setEventData] = useState<{
    name: string;
    description: string | undefined;
    image: string | undefined;
    teamId?: number;
    venue: string | undefined;
    artists: string[] | undefined;
    beginning: Date;
    end: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  }>({
    name: '',
    description: undefined,
    image: undefined,
    teamId: _teamId,
    venue: undefined,
    artists: undefined,
    beginning: new Date(),
    end: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'teamId') {
      setEventData((prev) => ({ ...prev, teamId: value ? Number(value) : undefined }));
    } else if (name === 'beginning') {
      setEventData((prev) => ({ ...prev, beginning: value ? new Date(value) : new Date() }));
    } else {
      setEventData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value ? [value as Role] : [] }));
  };

  const onCreateEvent = async () => {
    if (isCreatingEvent || !user.id) return;
    setIsCreatingEvent(true);

    try {
      await createEvent({
        name: EventData.name,
        description: EventData.description,
        image: EventData.image,
        teamId: EventData.teamId,
        venue: EventData.venue,
        artists: EventData.artists,
        beginning: EventData.beginning,
        end: EventData.end,
      });

      toast({
        title: _(msg`Event created successfully`),
        description: _(msg`Your Event has been created.`),
        duration: 5000,
      });

      setShowEventCreateDialog(false);
      setIsCreatingEvent(false);
    } catch (error) {
      toast({
        title: _(msg`Failed to create Event`),
        description: _(msg`Please try again later.`),
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
        <Button className="cursor-pointer" disabled={!user.emailVerified}>
          <FilePlus className="-ml-1 mr-2 h-4 w-4" />
          <Trans>New Event</Trans>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-xl">
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
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-100">
              <Trans>Description</Trans>
            </label>
            <Input
              id="description"
              name="description"
              value={EventData.description}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="beginning" className="block text-sm font-medium text-gray-700">
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
          {/*
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-100">
              <Trans>Role</Trans>
            </label>
            <select
              id="role"
              name="role"
              value={EventData.role[0] || ''}
              onChange={handleSelectChange}
              className="mt-1"
            >
              <option value="">
                <Trans>Select role</Trans>
              </option>
              <option value="USER">
                <Trans>user</Trans>
              </option>
              <option value="ADMIN">
                <Trans>admin</Trans>
              </option>
            </select>
          </div> */}

          <div>
            <label htmlFor="teamId" className="block text-sm font-medium text-gray-100">
              <Trans>Team Id</Trans>
            </label>
            <Input
              id="teamId"
              name="teamId"
              type="number"
              value={EventData.teamId ?? ''}
              onChange={handleInputChange}
              className="mt-1"
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
