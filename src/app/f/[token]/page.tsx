import { PublicForm } from '@/components/response/PublicForm'

export default function ResponsePage({ params }: { params: { token: string } }) {
  return <PublicForm token={params.token} />
}