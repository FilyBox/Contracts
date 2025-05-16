import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { prisma } from '@documenso/prisma';

import { superLoaderJson, useSuperLoaderData } from '~/utils/super-json-loader';

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

  // Replace this with your logic to fetch task data
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

  // Update task in the database
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

export default function TaskPage() {
  const { lpm } = useSuperLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: lpm.title,
    description: lpm.description,
    link: lpm.link,
    explicit: lpm.explicit,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/lpm/${lpm.id}/edit`, {
        method: 'POST',
        body: new URLSearchParams(formData as Record<string, string>),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      void navigate('/lpm');
    } catch (error) {
      console.error('Failed to update lpm:', error);
    }
  };

  return (
    <div className="mx-auto -mt-4 w-full max-w-screen-xl px-4 md:px-8">
      <Link to="/lpm" className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="mr-2 inline-block h-5 w-5" />
        {/* <Trans>Tasks</Trans> */}
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold">{lpm.title}</h1>
        {/* <p className="text-muted-foreground mt-2">{task.description}</p> */}
      </div>
      <div className="m-52 mt-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 text-base text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium">
              Tags
            </label>
            <textarea
              id="tags"
              name="tags"
              placeholder="htttps://example.com"
              value={formData.link}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500 dark:focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.explicit}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 rounded bg-[#7AC455] px-4 py-2 text-white hover:opacity-80"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
