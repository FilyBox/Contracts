import { Trans } from '@lingui/react/macro';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';

import { superLoaderJson, useSuperLoaderData } from '~/utils/super-json-loader';

export async function loader({ params, request }: { params: { id: string }; request: Request }) {
  const { user } = await getSession(request);

  const { id } = params;
  const taskId = Number(id);

  if (!taskId || Number.isNaN(taskId)) {
    throw new Response('Task not found', { status: 404 });
  }

  // Replace this with your logic to fetch task data
  const task = { id: taskId, title: `Task ${taskId}`, description: 'Task description' };

  return superLoaderJson({ user, task });
}

export default function TaskPage() {
  const { user: _user, task } = useSuperLoaderData<typeof loader>();

  return (
    <div className="mx-auto -mt-4 w-full max-w-screen-xl px-4 md:px-8">
      <Link to="/tasks" className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="mr-2 inline-block h-5 w-5" />
        <Trans>Tasks</Trans>
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-muted-foreground mt-2">{task.description}</p>
      </div>
    </div>
  );
}
