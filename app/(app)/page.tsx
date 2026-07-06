import { requireSession } from "@/lib/server/auth/session"

export default async function HomePage() {
  const user = await requireSession()
  console.log({ user })

  return <h2 className="text_2xl font-semibold">{user.user_id} - Catalog</h2>
}
