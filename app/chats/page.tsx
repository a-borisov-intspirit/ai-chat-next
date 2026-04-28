import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/chats/new');
}
// export default async function Chat() {
//   // const [messages, setMessages] = useState<Message[]>([]);

//   // const [currentChatId, setCurrentChatId] = useState<number | null>(null);

//   const chats = await fetchChats();
//   console.log('🚀 ~ Chat ~ chats:', chats);

//   // useEffect(() => {
//   //   if (!currentChatId) return;
//   //   const loadMessages = async () => {
//   //     try {
//   //       const data = await fetchChatMessages(currentChatId);
//   //       setMessages(data);
//   //     } catch (err) {
//   //       console.error(err);
//   //     }
//   //   };
//   //   loadMessages();
//   // }, [currentChatId]);

//   // useEffect(() => {
//   //   if (!currentChatId) return;

//   //   const channel = supabase
//   //     .channel(`messages:${currentChatId}`)
//   //     .on(
//   //       'postgres_changes',
//   //       {
//   //         event: '*',
//   //         schema: 'public',
//   //         table: 'messages',
//   //         filter: `chat_id=eq.${currentChatId}`,
//   //       },
//   //       () => {
//   //         fetchChatMessages(currentChatId)
//   //           .then((data) => setMessages(data))
//   //           .catch(console.error);
//   //       },
//   //     )
//   //     .subscribe();

//   //   return () => {
//   //     supabase.removeChannel(channel);
//   //   };
//   // }, [currentChatId]);

//   return (
//     <div className="main_wrapper">
//       {/* <ChatHistory initialChats={chats || []} /> */}
//       <div className="chat_wrapper">
//         <section id="center">
//           {/* {messages.map((message, index) => (
//             <div key={index} className={`message  ${message.role === 'assistant' ? 'left' : 'right'}`}>
//               <div className={`message_wrapper`} dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }} />
//             </div>
//           ))} */}
//         </section>

//       </div>
//     </div>
//   );
// }
