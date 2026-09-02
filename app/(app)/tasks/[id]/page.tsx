import { notFound } from 'next/navigation'
import { getTaskById } from '@/lib/task-data'
import { TaskDetailView } from '@/components/tasks/task-detail-view'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const task = getTaskById(id)
  if (!task) notFound()
  return <TaskDetailView task={task} />
}
