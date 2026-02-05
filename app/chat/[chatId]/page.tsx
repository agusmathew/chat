import { redirect } from "next/navigation";
import connectMongo from "../../../lib/mongodb";
import User from "../../../models/User";
import Chat from "../../../models/Chat";
import { getCurrentUser } from "../../../lib/auth";
import ChatClient from "../ChatClient";

type PageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function ChatPage({ params }: PageProps) {
  const { chatId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/signin");
  }

  await connectMongo();
  const chat = await Chat.findById(chatId);
  if (!chat) {
    redirect("/users");
  }

  const participants = chat.participants as string[];
  if (!participants.includes(currentUser.id)) {
    redirect("/users");
  }

  const otherId = participants.find((id) => id !== currentUser.id);
  if (!otherId) {
    redirect("/users");
  }

  const otherUser = await User.findById(otherId).lean();
  if (!otherUser) {
    redirect("/users");
  }

  return (
    <ChatClient
      userId={currentUser.id}
      userName={currentUser.name}
      userAvatarUrl={currentUser.avatarUrl ?? ""}
      peerName={otherUser.name}
      peerAvatarUrl={otherUser.avatarUrl ?? ""}
      chatId={chat._id.toString()}
    />
  );
}
