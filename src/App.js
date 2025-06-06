import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, MessageCircle, History, Bookmark, Settings, LogOut, Send, Mic, Plus } from 'lucide-react';
import background from "./background.png";
import logo from './logo.png';
import sublogo from './sublogo.png';
import { StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import sample from './sample.jpg'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [generateVisual, setGenerateVisual] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);
  const chatAreaRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [conversation]);




  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

const startNewChat = async () => {
  const confirmReset = window.confirm("Start a new chat? This will clear the current conversation.");
  
  if (!confirmReset) return;

  try {
    const response = await fetch('https://health-agent-a795ae5e2c9b.herokuapp.com/new-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      setConversation([]);
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setAudioBlob(null);
      setGenerateVisual(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      alert('Failed to reset chat on server.');
    }
  } catch (error) {
    console.error('Error starting new chat:', error);
    alert('Could not reset chat. Please check your connection.');
  }
};

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
  };

  // const handleSendMessage = async () => {
  //   if (!message.trim() && !selectedImage && !audioBlob) return;

  //   const userMessage = {
  //     type: 'user',
  //     content: message,
  //     image: imagePreview,
  //     timestamp: new Date().toLocaleTimeString()
  //   };

  //   setConversation((prev) => [...prev, userMessage]);
  //   setIsLoading(true);

  //   try {
  //     const formData = new FormData();

  //     if (message.trim()) {
  //       formData.append('text', message);
  //     }

  //     if (selectedImage) {
  //       formData.append('image', selectedImage);
  //     }

  //     if (audioBlob) {
  //       formData.append('audio', audioBlob, 'audio.wav');
  //     }

  //     formData.append('generate_visual', generateVisual);
  //     formData.append(
  //       'conversation',
  //       JSON.stringify(
  //         conversation
  //           .filter((msg) => msg.type === 'user' || msg.type === 'assistant')
  //           .map((msg) => ({
  //             role: msg.type === 'user' ? 'user' : 'assistant',
  //             content: msg.content
  //           }))
  //       )
  //     );

  //     const response = await fetch('http://localhost:5000/ayurveda-consult', {
  //       method: 'POST',
  //       body: formData
  //     });

  //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  //     const data = await response.json();

  //     const assistantMessage = {
  //       type: 'assistant',
  //       content: data.text,
  //       image: data.image,
  //       timestamp: new Date().toLocaleTimeString()
  //     };

  //     setConversation((prev) => [...prev, assistantMessage]);

  //     setMessage('');
  //     setSelectedImage(null);
  //     setImagePreview(null);
  //     setAudioBlob(null);
  //     setGenerateVisual(false);
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = '';
  //     }
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     const errorMessage = {
  //       type: 'error',
  //       content: 'Sorry, there was an error processing your request. Please try again.',
  //       timestamp: new Date().toLocaleTimeString()
  //     };
  //     setConversation((prev) => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



const handleSendMessage = async () => {
  if (!message.trim() && !selectedImage && !audioBlob) return;

  const userMessage = {
    type: 'user',
    content: message,
    image: imagePreview, // This is the base64 preview URL
    timestamp: new Date().toLocaleTimeString(),
  };

  setConversation(prev => [...prev, userMessage]);
  setIsLoading(true);

  try {
    const formData = new FormData();

    if (message.trim()) {
      formData.append('text', message);
    }

    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    if (audioBlob) {
      formData.append('audio', audioBlob, 'audio.webm');
    }

    const response = await fetch('https://health-agent-a795ae5e2c9b.herokuapp.com/ayurveda-consult', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    const assistantMessage = {
      type: 'assistant',
      content: data.text,
      image: data.image,
      timestamp: new Date().toLocaleTimeString(),
    };

    setConversation(prev => [...prev, assistantMessage]);

    setMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setAudioBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

  } catch (error) {
    console.error('Error sending message:', error);
    setConversation(prev => [
      ...prev,
      {
        type: 'error',
        content: 'Failed to get a response from the assistant.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  } finally {
    setIsLoading(false);
  }
};
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
const formatMessage = (content) => {
  if (!content) return '';
  
  // Split the content into lines
  const lines = content.split('\n');

  return lines
    .map(line => {
      // Match lines starting with '##'
      if (line.startsWith('##')) {
        const heading = line.replace(/^##\s*/, '').trim();
        return `<h4 class="gpt-heading">${heading}</h4>`;
      }
      return `<p>${line}</p>`;
    })
    .join('');
};


  return (
    <div className="app-container">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          display: flex;
          height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
        //   background: rgba(255, 255, 255, 0.95);
        // background: radial-gradient(49.39% 137.84% at 50.61% 51.3%, #1C1C1C 62.98%, #727C82 80.77%, #C2CACE 100%) /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */;

          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: transform 0.3s ease;
          z-index: 1000;
        }

     .sidebar-mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1001;
  display: none;
}

.sidebar-mobile.open {
  transform: translateX(0);
}
  @media (max-width: 768px) {
  .sidebar-mobile {
    display: block;
  }
}

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .logo {
          width: 150px;
          height: 150px;
          object-fit: contain;
          display: block;
        margin-left: auto;
        margin-right: auto;
        }

        .app-title {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .title-main {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.1;
          margin-bottom: 2px;
        }

        .title-sub {
          font-size: 18px;
          font-weight: 500;
          color: #6b7280;
          line-height: 1.1;
        }

        .nav-menu {
          list-style: none;
          margin-bottom: 40px;
        }

        .nav-item {
          margin-bottom: 8px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          text-decoration: none;
          color:black;
        //   color: #6b7280;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .nav-link:hover,
        .nav-link.active {
          background: rgba(132, 204, 22, 0.1);
          color: #84CC16;
        }

        .nav-icon {
          margin-right: 12px;
          width: 20px;
          height: 20px;
        }

        .nav-bottom {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, rgba(132, 204, 22, 0.1), rgba(34, 197, 94, 0.1));
          position: relative;
          // overflow: hidden;
          overflow-y: auto;
          overflow-x: auto;
           scroll-behavior: smooth;
        }
          .main-content {
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* Optional scrollbar styling (WebKit browsers) */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: rgba(132, 204, 22, 0.6);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.1);
}

        .menu-toggle {
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  color: #000; /* Adjust based on text contrast */
  font-size: 24px;
  z-index: 1001;
  display: none;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
}

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url(${background});
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          opacity: 0.8;
          z-index: 1;
          transform: scaleX(-1);
          filter: blur(10px);
         -webkit-filter: blur(10px);
        }

.header {
 background-image: url(${sublogo});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: relative;
  text-align: center;
}

.header-top {

  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.header-title-section {

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px; /* Spacing between elements */
  flex: 1;
}

.header-titles {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px; /* Optional padding for better spacing */
}

.sublogo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%; /* Full width of parent */
  max-width: 300px; /* Limit maximum width for responsiveness */
  margin-bottom: 16px; /* Space below the logo */
}

.sublogo {
  height: auto; /* Maintain aspect ratio */
  width: 100%; /* Fill the container */
  max-width: 200px; /* Prevent excessive stretching */
  object-fit: contain; /* Ensure no distortion */
}

.header-title-main {
  font-size: 40px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.1;
  margin-bottom: 4px;
  
}

.header-title-sub {
  font-size: 18px;
  font-weight: 500;
  color: #6b7280;
  line-height: 1.1;
}
        // .header-title-section {
        //   display: flex;
        //   align-items: center;
        //   gap: 16px;
        //   justify-content: center;
        //   flex: 1;
        // }

        // .header-logo {
        //   width: 60px;
        //   height: 60px;
        //   object-fit: contain;
        // }

        // .header-titles {
        //   display: flex;
        //   flex-direction: column;
        //   align-items: center;
        // }

        // .header-title-main {
        //   font-size: 28px;
        //   font-weight: 700;
        //   color: #1f2937;
        //   line-height: 1.1;
        //   margin-bottom: 4px;
        // }

        // .header-title-sub {
        //   font-size: 18px;
        //   font-weight: 500;
        //   color: #6b7280;
        //   line-height: 1.1;
        // }

        // .sublogo-container {
        //   display: flex;
        //   justify-content: center;
        //   margin-top: 10px;
        // }

        // .sublogo {
        //   height: 24px;
        //   object-fit: contain;
        // }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          z-index: 10;
          position: relative;
          overflow-y: scroll;
          overflow-y: scroll;
          scroll-behavior: smooth;
        
        }

        .chat-area::-webkit-scrollbar {
  width: 6px;
}

.chat-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-area::-webkit-scrollbar-thumb {
  background: #84cc16;
  border-radius: 3px;
}
//         .chat-area {
//   flex: 1;
//   overflow-y: auto;
//   padding: 1rem;
//   display: flex;
//   flex-direction: column;
//   gap: 0.75rem;
// }

.message-bubble {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message-bubble.user {
  align-self: flex-end;
  background-color: #dcfce7;
  color: #16a34a;
}

.message-bubble.assistant {
  align-self: flex-start;
  background-color: #f3f4f6;
  color: #1f2937;
}

.message-bubble.loading {
  align-self: flex-start;
  background-color: #f3f4f6;
  color: #6b7280;
}

.message-bubble img {
  margin-top: 0.5rem;
  max-width: 100%;
  border-radius: 8px;
}

.message-bubble small.timestamp {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.message-bubble h4.gpt-heading {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #1f2937;
  border-left: 4px solid #84cc16;
  padding-left: 10px;
  margin-left:10px
}

.message-bubble p {
  margin-bottom: 0.5rem;
   margin-left:10px
}

        .welcome-message {
          text-align: center;
          color: white;
          font-size: 18px;
          margin-bottom: 30px;
          max-width: 600px;
        }

        .input-container {
          width: 100%;
          max-width: 700px;
          position: relative;
          margin-top: auto;
          margin-bottom: 20px;
        }

        .message-input {
          width: 100%;
          padding: 16px 60px 16px 20px;
          border: 2px solid rgba(132, 204, 22, 0.3);
          border-radius: 25px;
          font-size: 16px;
          outline: none;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          resize: none;
          min-height: 52px;
          max-height: 120px;
        }

        .message-input:focus {
          border-color: #84CC16;
          box-shadow: 0 0 0 3px rgba(132, 204, 22, 0.1);
        }

        .input-actions {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: #84CC16;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #65A30D;
          transform: scale(1.05);
        }

        .action-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: none;
        }

        .overlay.show {
          display: block;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            width: 280px;
          }

          .sidebar-mobile {
            display: block;
          }

          .sidebar-desktop {
            display: none;
          }

          .menu-toggle {
            display: block;
          }

          .header-title-main {
            font-size: 22px;
          }

          .header-title-sub {
            font-size: 16px;
          }

          .header-logo {
            width: 50px;
            height: 50px;
          }

          .welcome-message {
            font-size: 16px;
            padding: 0 10px;
          }

          .message-input {
            padding: 14px 50px 14px 16px;
            font-size: 14px;
          }

          .input-actions {
            right: 10px;
          }

          .action-btn {
            width: 28px;
            height: 28px;
          }
        }

        @media (min-width: 769px) {
          .sidebar-desktop {
            display: block;
          }

          .sidebar-mobile {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 15px;
          }

          .header-title-main {
            font-size: 18px;
          }

          .header-title-sub {
            font-size: 14px;
          }

          .header-logo {
            width: 40px;
            height: 40px;
          }

          .chat-area {
            padding: 20px 15px;
          }

          .logo-section {
            margin-bottom: 30px;
          }

          .title-main {
            font-size: 14px;
          }

          .title-sub {
            font-size: 12px;
          }

          .nav-link {
            padding: 10px 12px;
            font-size: 14px;
          }

          .sublogo {
            height: 20px;
          }
        }

        .action-btn.recording {
  color: red;
  font-weight: bold;
}

.recording-indicator {
  margin-left: 4px;
  font-size: 12px;
}

.message-bubble {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message-bubble.user {
  align-self: flex-end;
  background-color: #dcfce7;
  color: #16a34a;
}

.message-bubble.assistant {
  align-self: flex-start;
  background-color: #f3f4f6;
  color: #1f2937;
}

.message-bubble img {
  max-width: 200px;     /* Adjust as needed */
  max-height: 200px;    /* Adjust as needed */
  object-fit: contain;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.message-bubble small.timestamp {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #84cc16;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.image-preview {
  position: relative;
  max-width: 30%;
  margin: 0.5rem 0;
}

.image-preview img {
  max-width: 120px;     /* Limit preview width */
  max-height: 120px;    /* Limit preview height */
  object-fit: cover;    /* Keep aspect ratio, crop if needed */
  border-radius: 8px;
  border: 1px solid #ccc;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 2px 5px;
  font-size: 10px;
  cursor: pointer;
}


      `}</style>

      {/* Mobile Overlay */}
      <div 
        className={`overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar - Desktop */}
      <aside className="sidebar sidebar-desktop">
        <div className="logo-section">
          <img src={logo} alt="EROS Logo" className="logo" />
          <div className="app-title">
            {/* <div className="title-main">EROS</div>
            <div className="title-sub">UNIVERSE</div> */}
          </div>
        </div>

        <nav>
          <ul className="nav-menu">
          <li className="nav-item">
  <a href="#" className="nav-link active" onClick={(e) => {
      e.preventDefault();
      startNewChat();
    }}
  >
    <MessageCircle className="nav-icon" />
    New Chat
  </a>
</li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <History className="nav-icon" />
                History Chat
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <Bookmark className="nav-icon" />
                Saved Chat
              </a>
            </li>
          </ul>

          <div className="nav-bottom">
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <Settings className="nav-icon" />
                  Settings
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <LogOut className="nav-icon" />
                  Log Out
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`sidebar sidebar-mobile ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo-section">
          <img src={logo} alt="EROS Logo" className="logo" />
          
          {/* <div className="app-title">
            <div className="title-main">EROS</div>
            <div className="title-sub">UNIVERSE</div>
          </div> */}
        </div>

        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#" className="nav-link active" onClick={toggleSidebar}>
                <MessageCircle className="nav-icon" />
                New Chat
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link" onClick={toggleSidebar}>
                <History className="nav-icon" />
                History Chat
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link" onClick={toggleSidebar}>
                <Bookmark className="nav-icon" />
                Saved Chat
              </a>
            </li>
          </ul>

          <div className="nav-bottom">
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={toggleSidebar}>
                  <Settings className="nav-icon" />
                  Settings
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={toggleSidebar}>
                  <LogOut className="nav-icon" />
                  Log Out
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
 <main className="main-content">
      <div className="background-image"></div>

      <header
        className="header"
        style={{
          backgroundImage: `url(${sublogo})`,
            // backgroundImage: `url(${sample})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          // backdropFilter: 'blur(10px)',
          // WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="header-top"></div>
        <div className="header-title-section">
          <div className="header-titles">
            <h1 className="header-title-main">Ayurvedic Multimodal</h1>
            <h2 className="header-title-main">Consultant</h2>
          </div>
        </div>
      </header>

      <div className="chat-area" ref={chatAreaRef}>
        {/* Render Messages */}
        {conversation.length === 0 && (
          <div className="welcome-message">
            <p>Welcome to your Ayurvedic health consultation. How can I help you today?</p>
          </div>
        )}
{/* 
        {conversation.map((msg, index) => (
  <div key={index} className={`message-bubble ${msg.type}`}>
    {msg.content && (
      <div
        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
      />
    )}
    {msg.image && (
      <img src={msg.image} alt="User uploaded" className="message-image" />
    )}
    <small className="timestamp">{msg.timestamp}</small>
  </div>
))} */}
{conversation.map((msg, index) => (
  <div key={index} className={`message-bubble ${msg.type}`}>
    <div style={{ marginLeft: '8px' }}>
  <ReactMarkdown>{msg.content}</ReactMarkdown>
</div>
    {msg.image && <img src={msg.image} alt="Assistant response" className="message-image" />}
    <small className="timestamp">{msg.timestamp}</small>
  </div>
))}

         {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected preview" />
            <button className="remove-image" onClick={clearImage}>
              <X size={12} />
            </button>
          </div>
        )}``
        {isLoading && (
          <div className="message-bubble loading">
            <span>Typing...</span>
          </div>
        )}

        <div className="input-container">
           <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          <textarea
            className="message-input"
            placeholder="hi"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
<div className="input-actions">
     <button
            className="action-btn"
            title="Upload image"
            onClick={() => fileInputRef.current.click()}
          >
            <Plus size={16} />
          </button>
  {!isRecording ? (
    <button className="action-btn" title="Start recording" onClick={startRecording}>
      <Mic size={16} />
    </button>
  ) : (
    <button className="action-btn recording" title="Stop recording" onClick={stopRecording}>
      <StopCircle size={16} />
      <span className="recording-indicator">Recording...</span>
    </button>
  )}

  <button
    className="action-btn"
    title="Send message"
    onClick={handleSendMessage}
     disabled={!message.trim() && !selectedImage && !audioBlob}
  >
    <Send size={16} />
  </button>
</div>
        </div>

         {/* {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected preview" />
            <button className="remove-image" onClick={clearImage}>
              <X size={12} />
            </button>
          </div>
        )} */}
      </div>
    </main>
    </div>
  );
};

export default App;