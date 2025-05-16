import { Trans } from '@lingui/react/macro';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import { prisma } from '@documenso/prisma';

import { superLoaderJson, useSuperLoaderData } from '~/utils/super-json-loader';

export async function loader({ params }: { params: { id: string }; request: Request }) {
  // const { user } = await getSession(request);

  const { id } = params;
  const lpmId = Number(id);

  if (!lpmId || Number.isNaN(lpmId)) {
    throw new Response('lpm not found', { status: 404 });
  }
  const lpmById = await prisma.lpm.findUnique({
    where: { id: lpmId },
  });
  if (!lpmId || Number.isNaN(lpmId)) {
    throw new Response('lpm not found', { status: 404 });
  }

  // Replace this with your logic to fetch lpm data
  const lpm = {
    id: lpmId,
    title: lpmById?.trackName || 'lpm Title',
    description: lpmById?.lyrics || 'lpm Description',
  };

  return superLoaderJson({ lpm });
}

export default function LpmPage() {
  const { lpm } = useSuperLoaderData<typeof loader>();

  return (
    <div className="mx-auto -mt-4 w-full max-w-screen-xl px-4 md:px-8">
      <Link to="/lpm" className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="mr-2 inline-block h-5 w-5" />
        <Trans>LPM songs</Trans>
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold">{lpm.title}</h1>
      </div>

      <div className="mt-5 max-w-sm rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <a href="#">
          <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
        </a>
        <div className="p-5">
          <a href="#">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {lpm.title.length > 5 ? `${lpm.title.substring(0, 5)}...` : lpm.title}
            </h5>
          </a>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{lpm.description}</p>
          <a
            href="#"
            className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Read more
            <svg
              className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
