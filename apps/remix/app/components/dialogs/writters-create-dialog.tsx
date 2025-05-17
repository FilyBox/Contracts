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

type WrittersCreateDialogProps = {
  teamId?: number;
};

type Role = 'WRITER' | 'COMPOSER' | 'ARRANGER' | 'PRODUCER' | 'MIXER' | 'MASTERING_ENGINEER'; // Enum según tu backend

export const WrittersCreateDialog = ({ teamId: _teamId }: WrittersCreateDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const { _ } = useLingui();

  const { mutateAsync: createWritter } = trpc.writer.createWriter.useMutation();

  const [showWrittersCreateDialog, setShowWrittersCreateDialog] = useState(false);
  const [isCreatingWritter, setisCreatingWritter] = useState(false);
  const [writterData, setwritterData] = useState<{
    name: string;
    role: Role[];
    // event: string[];
    song: string[];
    url: string;
    disabled?: boolean;
    teamId?: number;
  }>({
    name: '',
    role: [],
    // event: [],
    song: [],
    url: '',
    disabled: false,
    teamId: _teamId,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'teamId') {
      setwritterData((prev) => ({ ...prev, teamId: value ? Number(value) : undefined }));
    } else {
      setwritterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setwritterData((prev) => ({ ...prev, [name]: value ? [value as Role] : [] }));
  };

  const oncreateWritter = async () => {
    if (isCreatingWritter || !user.id) return;
    setisCreatingWritter(true);

    try {
      await createWritter({
        name: writterData.name,
        role: writterData.role,
        // event: writterData.event,
        song: writterData.song,
        url: writterData.url,
        disabled: writterData.disabled,
        teamId: writterData.teamId,
      });

      toast({
        title: _(msg`writter created successfully`),
        description: _(msg`Your writter has been created.`),
        duration: 5000,
      });

      setShowWrittersCreateDialog(false);
      setisCreatingWritter(false);
    } catch (error) {
      toast({
        title: _(msg`Failed to create writter`),
        description: _(msg`Please try again later.`),
        variant: 'destructive',
      });
      setisCreatingWritter(false);
    }
  };

  const cancreateWritter = Boolean(user.id) && !isCreatingWritter && writterData.name;

  return (
    <Dialog
      open={showWrittersCreateDialog}
      onOpenChange={(value) => !isCreatingWritter && setShowWrittersCreateDialog(value)}
    >
      <DialogTrigger asChild>
        <Button className="m-1 cursor-pointer" disabled={!user.emailVerified}>
          <FilePlus className="-ml-1 mr-2 h-4 w-4" />
          <Trans>New writter</Trans>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New writter</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Create a new writter with details like name, roles, events, songs, and url.
            </Trans>
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
              value={writterData.name}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-100">
              <Trans>URL</Trans>
            </label>
            <Input
              id="url"
              name="url"
              value={writterData.url}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-100">
              <Trans>Role</Trans>
            </label>
            <select
              id="role"
              name="role"
              value={writterData.role[0] || ''}
              onChange={handleSelectChange}
              className="mt-1"
            >
              <option value="WRITER">
                <Trans>Writer</Trans>
              </option>
              <option value="COMPOSER">
                <Trans>Composer</Trans>
              </option>
              <option value="ARRANGER">
                <Trans>Arranger</Trans>
              </option>
              <option value="PRODUDER">
                <Trans>Producer</Trans>
              </option>
              <option value="MIXER">
                <Trans>Mixer</Trans>
              </option>
              <option value="MASTERING_ENGINEER">
                <Trans>Mastering Engineer</Trans>
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="teamId" className="block text-sm font-medium text-gray-100">
              <Trans>Team Id</Trans>
            </label>
            <Input
              id="teamId"
              name="teamId"
              type="number"
              value={writterData.teamId ?? ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
        </div>

        {isCreatingWritter && (
          <div className="flex items-center justify-center rounded-lg py-4">
            <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreatingWritter}>
              <Trans>Cancel</Trans>
            </Button>
          </DialogClose>
          <Button type="button" onClick={oncreateWritter} disabled={!cancreateWritter}>
            <Trans>Create writter</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
