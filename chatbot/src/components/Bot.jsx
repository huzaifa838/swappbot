// import React, { useState } from 'react';
// import axios from 'axios';


// function Bot() {
//     const [messages, setmessages] = useState([])
//     const [input, setInput] = useState("")
//     const [loading, setLoading] = useState(false)

//     const handleSendMessage = async () => {
//         setLoder(true);
//         if (!input.trim()) return;
//         try {
//             const response = axios.post("http://localhost:3000/bot/v1/message", {
//                 text: input
//             })
//             if (res.status === 200) {
//                 setmessages([...messages, { text: res.data.userMessage, sender: 'user' }, { text: res.date.botMessage, sender: 'bot' }]);
//             }

//         } catch (error) {
//             console.log("error sending message:", error);


//         }
//         setInput("");
//         setLoading(false);
//     }
//     const handlekeypress = (e) => {
//         if (e.key === 'enter') handleSendMessage()
            
//     }
// }
//     return (
//         <>
//             {/* header */}
//             <header className='fixed top-0 left-0 w-full border-b border-green-500 z-10'>
//                 <div className='container mx-auto flex justify-between items-center px-6 py-4'>
//                     <h1 className='text-lg font-bold'>swappBot</h1>
//                     <faUserCircle size={30} className="cursor-pointer" />
//                 </div>
//             </header>


//             {/* chat section */}


//             {/* footer */}
//             <footer className='fixed bottom-0 left border-t border-gray-800 bg-cyan-500 z-10'>
//                 <div className='max-w-4xl mx-auto flex justify-center px-4 py-3'>
//                     <div className='flex items-center space-x-2 w-full'>
//                         <input
//                             type='text'
//                             className='flex-1 bg-transparent outline-amber-300 text-white placeholder-gray-400 px-2'
//                             placeholder='ask BotSpoof ..'
//                             value={input}
//                         />
//                         <button className='bg-green-400 hover:bg-green-600 px-4 py-1 rounded-full text-white fpnt-medium transition-colors'>
//                             send

//                         </button>
//                     </div>
//             </footer>
//         </>
//     )
// }


// export default Bot