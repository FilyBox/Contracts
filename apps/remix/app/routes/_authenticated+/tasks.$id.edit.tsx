import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { prisma } from '@documenso/prisma';

import { superLoaderJson, useSuperLoaderData } from '~/utils/super-json-loader';

export async function loader({ params, request }: { params: { id: string }; request: Request }) {
  const { user } = await getSession(request);

  const { id } = params;
  const taskId = Number(id);

  if (!taskId || Number.isNaN(taskId)) {
    throw new Response('Task not found', { status: 404 });
  }

  // Replace this with your logic to fetch task data
  const task = {
    id: taskId,
    title: `Task ${taskId}`,
    description: 'Task description',
    tags: [],
    priority: 'LOW',
    dueDate: new Date().toISOString(),
  };

  return superLoaderJson({ user, task });
}

export async function action({ request, params }: { request: Request; params: { id: string } }) {
  const { id } = params;
  const taskId = Number(id);

  if (!taskId || Number.isNaN(taskId)) {
    throw new Response('Invalid task ID', { status: 400 });
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const tags = (formData.get('tags') as string)?.split(',').map((tag) => tag.trim()) || [];
  const priority = formData.get('priority') as string;

  // Validate inputs
  if (!title || !priority) {
    throw new Response('Title and priority are required', { status: 400 });
  }

  // Update task in the database
  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        tags,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      },
    });
    return superLoaderJson({ task: updatedTask });
  } catch (error) {
    console.error('Failed to update task:', error);
    throw new Response('Failed to update task', { status: 500 });
  }
}

export default function TaskPage() {
  const { task } = useSuperLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    tags: task.tags.join(', '),
    priority: task.priority,
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
      const response = await fetch(`/tasks/${task.id}/edit`, {
        method: 'POST',
        body: new URLSearchParams(formData as Record<string, string>),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      void navigate('/tasks');
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div className="mx-auto -mt-4 w-full max-w-screen-xl px-4 md:px-8">
      <Link to="/tasks" className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="mr-2 inline-block h-5 w-5" />
        <Trans>Tasks</Trans>
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-muted-foreground mt-2">{task.priority}</p>
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
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium">
              Tags
            </label>
            <textarea
              id="tags"
              name="tags"
              placeholder="tag1, tag2, tag3"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
