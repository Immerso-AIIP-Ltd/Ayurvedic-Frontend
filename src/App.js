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
    setMessage('');           // Clear text input
  setSelectedImage(null);   // Clear selected image state
  setImagePreview(null);    // Clear preview URL
  setAudioBlob(null); 

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
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        padding: 20px;
        transition: transform 0.3s ease;
        z-index: 1000;
        overflow-y: auto;
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
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }

      .sidebar-mobile.open {
        transform: translateX(0);
      }

      @media (max-width: 768px) {
        .sidebar-mobile {
          display: block;
        }
        .sidebar-desktop {
          display: none;
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

      .logo-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }

      .logo {
        width: 120px;
        height: 120px;
        object-fit: contain;
        margin-bottom: 10px;
      }

      .nav-menu {
        list-style: none;
        margin-bottom: 20px;
      }

      .nav-item {
        margin-bottom: 8px;
      }

      .nav-link {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        text-decoration: none;
        color: #374151;
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
        position: relative;
        overflow: hidden;
      }

      /* Background Image - Full Display */
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
        opacity: 0.9;
        z-index: 1;
      }

      /* Header with Sublogo Background */
      .header {
        position: relative;
        background-image: url(${sublogo});
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px 20px;
        backdrop-filter: blur(5px);
        z-index: 10;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }

      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.7);
        z-index: -1;
      }

      .menu-toggle {
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        color: #374151;
        font-size: 24px;
        z-index: 1001;
        display: none;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .menu-toggle {
          display: block;
        }
      }

      .header-title-section {
        text-align: center;
        z-index: 2;
      }

      .header-title-main {
        font-size: clamp(24px, 4vw, 40px);
        font-weight: 700;
        color: #1f2937;
        line-height: 1.2;
        margin-bottom: 5px;
        text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
      }

      /* Chat Container - ChatGPT Style */
      .chat-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 10;
        height: calc(100vh - 120px); /* Reserve space for header */
      }

      /* Messages Area - Scrollable */
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px 20px 120px 20px; /* Extra bottom padding for input area */
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        min-height: 0; /* Important for flexbox scrolling */
      }

      .chat-messages::-webkit-scrollbar {
        width: 8px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(132, 204, 22, 0.6);
        border-radius: 4px;
      }

      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: rgba(132, 204, 22, 0.8);
      }

      /* Welcome Message */
      .welcome-message {
        text-align: center;
        margin: auto;
        padding: 40px 20px;
      }

      .welcome-message h2 {
        font-size: 24px;
        color: #1f2937;
        margin-bottom: 12px;
        font-weight: 600;
      }

      .welcome-message p {
        font-size: 16px;
         color: #1f2937;
        max-width: 500px;
        margin: 0 auto;
        line-height: 1.6;
      }

      /* Message Bubbles */
      .message-bubble {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 15px;
        line-height: 1.5;
        word-wrap: break-word;
        position: relative;
      }

      .message-bubble.user {
        align-self: flex-end;
        background: linear-gradient(135deg, #84CC16, #65A30D);
        color: white;
        border-bottom-right-radius: 6px;
      }

      .message-bubble.assistant {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.9);
        color: #1f2937;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom-left-radius: 6px;
        backdrop-filter: blur(10px);
      }

      .message-bubble.loading {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.9);
        color: #6b7280;
        border: 1px solid rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
      }

      .message-bubble img {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
        border-radius: 12px;
        margin-top: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .timestamp {
        display: block;
        margin-top: 6px;
        font-size: 12px;
        opacity: 0.7;
      }

      /* Chat Input Area - Fixed at Bottom */
      .chat-input-area {
        position: sticky;
        bottom: 0;
        padding: 20px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        z-index: 1000;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
        margin-top: auto;
      }

      .input-container {
        max-width: 800px;
        margin: 0 auto;
        position: relative;
        display: flex;
        align-items: flex-end;
        gap: 12px;
      }

      .message-input {
        flex: 1;
        min-height: 50px;
        max-height: 150px;
        padding: 12px 50px 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 25px;
        font-size: 16px;
        outline: none;
        background: white;
        resize: none;
        font-family: inherit;
        line-height: 1.5;
        transition: all 0.2s ease;
      }

      .message-input:focus {
        border-color: #84CC16;
        box-shadow: 0 0 0 3px rgba(132, 204, 22, 0.1);
      }

      .message-input::placeholder {
        color: #9ca3af;
      }

      .input-actions {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        gap: 4px;
      }

      .action-btn {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: #84CC16;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 16px;
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

      .action-btn.recording {
        background: #ef4444;
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      .recording-indicator {
        font-size: 12px;
        color: #ef4444;
        margin-left: 8px;
        font-weight: 500;
      }

      /* Image Preview */
      .image-preview {
        position: relative;
        margin-bottom: 12px;
        display: flex;
        justify-content: flex-end;
      }

      .image-preview img {
        max-width: 120px;
        max-height: 120px;
        object-fit: cover;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
      }

      .remove-image {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      /* Overlay for mobile sidebar */
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
        .header {
          padding: 20px 15px;
        }

        .header-title-main {
          font-size: 22px;
        }

        .chat-container {
          height: calc(100vh - 100px);
        }

        .chat-messages {
          padding: 15px 15px 100px 15px;
        }

        .chat-input-area {
          padding: 15px;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
        }

        .message-bubble {
          max-width: 85%;
          font-size: 14px;
        }

        .message-input {
          font-size: 16px;
          padding: 10px 45px 10px 14px;
        }
      }

      @media (max-width: 480px) {
        .header-title-main {
          font-size: 18px;
        }

        .chat-container {
          height: calc(100vh - 80px);
        }

        .chat-messages {
          padding: 10px 10px 90px 10px;
        }

        .chat-input-area {
          padding: 12px;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
        }

        .message-bubble {
          max-width: 90%;
          padding: 10px 14px;
        }
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
      </div>

      <nav>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="#" className="nav-link active" onClick={(e) => {
                e.preventDefault();
                startNewChat();
                toggleSidebar();
              }}
            >
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
      {/* Background Image - Full Display */}
      <div className="background-image"></div>

      {/* Header with Sublogo Background */}
      <header className="header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="header-title-section">
          <h1 className="header-title-main">Ayurvedic Multimodal</h1>
          <h1 className="header-title-main">Consultant</h1>
        </div>
      </header>

      {/* Chat Container */}
      <div className="chat-container">
        {/* Messages Area */}
        <div className="chat-messages" ref={chatAreaRef}>
          {conversation.length === 0 && (
            <div className="welcome-message">
              <h2>Welcome to Your Ayurvedic Consultation</h2>
              <p>I'm here to help with your health questions using traditional Ayurvedic wisdom. How can I assist you today?</p>
            </div>
          )}

          {conversation.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.type}`}>
              <div style={{ marginLeft: '4px' }}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.image && (
                <img src={msg.image} alt="Assistant response" className="message-image" />
              )}
              <small className="timestamp">{msg.timestamp}</small>
            </div>
          ))}

          {isLoading && (
            <div className="message-bubble loading">
              <span>Typing...</span>
            </div>
          )}
        </div>

        {/* Chat Input Area - Fixed at Bottom */}
        <div className="chat-input-area">
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Selected preview" />
              <button className="remove-image" onClick={clearImage}>
                <X size={12} />
              </button>
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
              placeholder="Message Ayurvedic Consultant..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '50px',
                maxHeight: '150px',
              }}
            />

            <div className="input-actions">
              <button
                className="action-btn"
                title="Upload image"
                onClick={() => fileInputRef.current.click()}
              >
                <Plus size={18} />
              </button>
              
              {!isRecording ? (
                <button 
                  className="action-btn" 
                  title="Start recording" 
                  onClick={startRecording}
                >
                  <Mic size={18} />
                </button>
              ) : (
                <button 
                  className="action-btn recording" 
                  title="Stop recording" 
                  onClick={stopRecording}
                >
                  <StopCircle size={18} />
                </button>
              )}
              
              <button
                className="action-btn"
                title="Send message"
                onClick={handleSendMessage}
                disabled={!message.trim() && !selectedImage && !audioBlob}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {isRecording && (
            <div className="recording-indicator">
              🔴 Recording...
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
);
};

export default App;
