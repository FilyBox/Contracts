import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { useIsMounted } from '@documenso/lib/client-only/hooks/use-is-mounted';
import { parseToIntegerArray } from '@documenso/lib/utils/params';
import { trpc } from '@documenso/trpc/react';
import { MultiSelectCombobox } from '@documenso/ui/primitives/multi-select-combobox';

type DocumentsTableSenderFilterProps = {
  teamId: number;
};

export const TableArtistFilter = () => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isMounted = useIsMounted();

  const artistIds = parseToIntegerArray(searchParams?.get('artistIds') ?? '');

  const { data: artistData, isLoading } = trpc.lpm.findLpmUniqueArtists.useQuery();

  const comboBoxOptions = (artistData ?? []).map((artist) => ({
    label: artist.artistName,
    value: artist.artistId,
  }));

  const onChange = (newartistIds: number[]) => {
    if (!pathname) {
      return;
    }

    const params = new URLSearchParams(searchParams?.toString());

    params.set('artistIds', newartistIds.join(','));

    if (newartistIds.length === 0) {
      params.delete('artistIds');
    }

    void navigate(`${pathname}?${params.toString()}`, { preventScrollReset: true });
  };

  return (
    <MultiSelectCombobox
      emptySelectionPlaceholder={
        <p className="text-muted-foreground font-normal">
          <Trans>
            <span className="text-muted-foreground/70">Artist:</span> All
          </Trans>
        </p>
      }
      enableClearAllButton={true}
      inputPlaceholder={msg`Search`}
      loading={!isMounted || isLoading}
      options={comboBoxOptions}
      selectedValues={artistIds}
      onChange={onChange}
    />
  );
};
