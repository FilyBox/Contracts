import { prisma } from '@documenso/prisma';

import { superLoaderJson } from '~/utils/super-json-loader';

export async function loader({ params }: { params: { id: string }; request: Request }) {
  const { id } = params;
  const lpmId = Number(id);

  if (!lpmId || Number.isNaN(lpmId)) {
    throw new Response('lpm not found', { status: 404 });
  }

  const lpmById = await prisma.lpm.findUnique({
    where: { id: lpmId },
  });

  if (!lpmById) {
    throw new Response('lpm not found', { status: 404 });
  }

  const lpm = {
    id: lpmById.id,
    title: lpmById.trackName || '',
    description: lpmById.lyrics || '',
    link: lpmById.productPlayLink || [],
    explicit: lpmById.explicitLyricsTrack || '',
  };

  return superLoaderJson({ lpm });
}

export async function action({ request, params }: { request: Request; params: { id: string } }) {
  const { id } = params;
  const lpmId = Number(id);

  if (!lpmId || Number.isNaN(lpmId)) {
    throw new Response('Invalid lpm ID', { status: 400 });
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const link = formData.get('link') as string;
  const explicit = formData.get('explicit') as string;

  if (!title || !explicit) {
    throw new Response('Title and priority are required', { status: 400 });
  }

  try {
    const updatedlpm = await prisma.lpm.update({
      where: { id: lpmId },
      data: {
        trackName: title,
        lyrics: description,
        productPlayLink: link,
        explicitLyricsTrack: explicit,
      },
    });
    return superLoaderJson({
      lpm: {
        id: updatedlpm.id,
        title: updatedlpm.trackName,
        description: updatedlpm.lyrics,
        link: updatedlpm.productPlayLink,
        explicit: updatedlpm.explicitLyricsTrack,
      },
    });
  } catch (error) {
    console.error('Failed to update lpm:', error);
    throw new Response('Failed to update lpm', { status: 500 });
  }
}
