import { useState } from 'react';

import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { FilePlus, Loader } from 'lucide-react';
import { useNavigate } from 'react-router';

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

type SongCreateDialogProps = {
  onCreated?: (id: string) => void;
};

export const SongCreateDialog = ({ onCreated }: SongCreateDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { _ } = useLingui();

  const { mutateAsync: createLpmSong } = trpc.lpm.createLpm.useMutation();

  const [showDialog, setShowDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    productType: '',
    productTitle: '',
    productDisplayArtist: '',
    label: '',
    releaseDate: '',
    upc: '',
    catalog: '',
    submissionStatus: '',
    productCLine: '',
    productPLine: '',
    lastProcessDate: '',
    importDate: '',
    createdBy: '',
    lastModified: '',
    submittedAt: '',
    trackType: '',
    trackId: '',
    trackNumber: '',
    trackName: '',
    trackDisplayArtist: '',
    isrc: '',
    trackGenre: '',
    audioLanguage: '',
    trackCLine: '',
    trackPLine: '',
    writersComposers: '',
    publishersCollectionSocieties: '',
    withholdMechanicals: '',
    instantGratificationDate: '',
    duration: '',
    sampleStartTime: '',
    explicitLyricsTrack: '',
    albumOnly: '',
    continuousMix: '',
    continuouslyMixedIndividualSong: '',
    trackPlayLink: '',
    explicitLyrics: '',
    primaryMetadataLanguage: '',
    // ...agrega los demás campos que necesites
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCreate = async () => {
    setIsCreating(true);
    try {
      const { id } = await createLpmSong(form);
      toast({
        title: _(msg`Song created successfully`),
        description: _(msg`Your song has been created.`),
        duration: 5000,
      });
      setShowDialog(false);
      onCreated?.(String(id));
      // navigate(`/songs/${id}`); // O la ruta que corresponda
    } catch (error) {
      toast({
        title: _(msg`Failed to create song`),
        description: _(msg`Please try again later.`),
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  // Puedes agregar validaciones según los campos requeridos
  const canCreate = Object.values(form).every((v) => v !== '');

  return (
    <Dialog open={showDialog} onOpenChange={(v) => !isCreating && setShowDialog(v)}>
      <DialogTrigger asChild>
        <Button>
          <FilePlus className="-ml-1 mr-2 h-4 w-4" />
          <Trans>New Song</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Song</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Fill in the song and product details.</Trans>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            name="productId"
            value={form.productId}
            onChange={handleInputChange}
            placeholder="Product ID"
          />
          <Input
            name="productType"
            value={form.productType}
            onChange={handleInputChange}
            placeholder="Product Type"
          />
          <Input
            name="productTitle"
            value={form.productTitle}
            onChange={handleInputChange}
            placeholder="Product Title"
          />
          <Input
            name="productDisplayArtist"
            value={form.productDisplayArtist}
            onChange={handleInputChange}
            placeholder="Product Display Artist"
          />
          <Input name="label" value={form.label} onChange={handleInputChange} placeholder="Label" />
          <Input
            name="releaseDate"
            value={form.releaseDate}
            onChange={handleInputChange}
            placeholder="Release Date"
            type="date"
          />
          {/* Agrega más campos según lo que necesites */}
          {isCreating && (
            <div className="flex items-center justify-center rounded-lg py-4">
              <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreating}>
              <Trans>Cancel</Trans>
            </Button>
          </DialogClose>
          <Button type="button" onClick={onCreate} disabled={!canCreate}>
            <Trans>Create Song</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
