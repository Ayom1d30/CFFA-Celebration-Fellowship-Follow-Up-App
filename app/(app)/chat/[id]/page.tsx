import { redirect } from "next/navigation";
import { ChatView } from "@/components/member/chat-view";
import {
  getConversationMessages,
  getHomeData,
  getUserById,
} from "@/lib/data/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = await getHomeData();
  if (!home) redirect("/login");

  const isDemo = !isSupabaseConfigured();
  const partner =
    home.buddy?.id === id ? home.buddy : await getUserById(id);
  const messages = await getConversationMessages(id);

  return (
    <ChatView
      buddyId={id}
      buddyName={partner?.name ?? "Member"}
      buddyAvatar={partner?.avatar ?? null}
      currentUserId={home.user.id}
      initialMessages={messages}
      demo={isDemo}
    />
  );
}
