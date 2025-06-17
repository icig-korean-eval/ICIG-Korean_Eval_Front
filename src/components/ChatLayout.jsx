import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import '../Style/Chat.scss'

export default function ChatLayout() {
    const containerRef = useRef(null);

    const navigate = useNavigate();
    const { chatId } = useParams();
    const [chatData, setChatData] = useState([])
    const [error, setError] = useState(null)
    const [chatRoomData, setChatRoomData] = useState(null)
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState(null)

    // TTS 관련 상태 추가
    const [playingMessageId, setPlayingMessageId] = useState(null);

    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isAITyping, setIsAITyping] = useState(false); // AI 응답 대기 상태 추가

    const audioRef = useRef(null);
    const chunksRef = useRef([]);
    const ctxRef = useRef(null);
    const procRef = useRef(null);
    const streamRef = useRef(null);

    // TTS 기능 함수들 (기존 기능 유지)
    const speakText = (text, messageId) => {
        window.speechSynthesis.cancel();
        setPlayingMessageId(null);

        if (!('speechSynthesis' in window)) {
            alert('죄송합니다. 이 브라우저는 음성 합성을 지원하지 않습니다.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            setPlayingMessageId(messageId);
        };

        utterance.onend = () => {
            setPlayingMessageId(null);
        };

        utterance.onerror = () => {
            setPlayingMessageId(null);
            console.error('TTS 재생 중 오류가 발생했습니다.');
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopTTS = () => {
        window.speechSynthesis.cancel();
        setPlayingMessageId(null);
    };

    const handleTTSClick = (text, messageId) => {
        if (playingMessageId === messageId) {
            stopTTS();
        } else {
            speakText(text, messageId);
        }
    };

    // 모든 기존 useEffect와 함수들 유지...
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            let chatRoom = null
            let isError = false
            try {
                const res = await fetch(`/api/v1/chat/${chatId}`, {
                    headers: {
                        'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq'
                    }
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const json = await res.json();
                setChatRoomData(json);
                console.log(json)
                chatRoom = json
            } catch (err) {
                isError = true
                setError(err);
            } finally {
                setIsLoading(false);
            }

            if (isError) return;

            try {
                const res = await fetch(`/api/v1/chat/${chatId}/history`, {
                    headers: {
                        'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq'
                    }
                });

                if (res.status !== 404 && !res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const chat = [
                    {
                        "id": -1,
                        "chat_id": "none",
                        "timestamp": "none",
                        "role": "assistant",
                        "content": "Hello, ICIG!\n" +
                            "Talk in Korean according to the given situation!\n" +
                            `The given situation: ${chatRoom.situation}`
                    }
                ]
                const json = await res.json();
                if (res.status === 404) {
                    setChatData(chat)
                } else {
                    chat.push(...json)
                    console.log(chat)
                    setChatData(chat);
                }
                console.log(json)
            } catch (err) {
                setError(err);
            } finally {
                // setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [chatData]);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // 모든 기존 함수들 유지...
    const sendChat = async (msg) => {
        setIsAITyping(true); // AI 응답 시작
        try {
            const res = await fetch('/api/v1/chat/conversation', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    message: msg
                })
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            console.log(json)
            setChatData(prev => [
                ...prev,
                {
                    "id": -1,
                    "chat_id": "none",
                    "timestamp": "none",
                    "role": "assistant",
                    "content": json.reply
                }
            ]);
            setFeedback(json.feedback)
        } catch (e) {
            setChatData(prev => [
                ...prev,
                {
                    "id": -1,
                    "chat_id": "none",
                    "timestamp": "none",
                    "role": "error",
                    "content": ""
                }
            ]);
            setFeedback(null)
            console.error(e)
        } finally {
            setIsAITyping(false); // AI 응답 완료
        }
    }

    const transcribeAudio = async (wavBlob) => {
        try {
            setIsTranscribing(true);

            const formData = new FormData();
            formData.append('file', wavBlob, 'recording.wav');

            const response = await fetch('/api/v1/transcribe', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq'
                },
                body: formData
            });

            console.log('Transcription response status:', response.status);
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
            }

            try {
                const data = JSON.parse(responseText);
                const transcribedText = data.transcription || '';

                if (transcribedText) {
                    setChatData(prev => [
                        ...prev,
                        {
                            "id": -1,
                            "chat_id": "none",
                            "timestamp": "none",
                            "role": "user",
                            "content": transcribedText
                        }
                    ]);
                    console.log(transcribedText)
                    sendChat(transcribedText)
                } else {
                    alert('음성 인식이 실패했습니다. 다시 시도해주세요.');
                }
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Transcription error:', error);

            if (error.message.includes('Failed to fetch')) {
                alert('서버에 연결할 수 없습니다. CORS 정책이나 네트워크 연결을 확인해주세요.');
            } else {
                alert(`음성 인식 실패: ${error.message}`);
            }
        } finally {
            setIsTranscribing(false);
        }
    };

    // 모든 녹음 관련 함수들 유지...
    function mergeBuffers(buffers, totalLen) {
        const result = new Float32Array(totalLen);
        let offset = 0;
        for (const buf of buffers) {
            result.set(buf, offset);
            offset += buf.length;
        }
        return result;
    }

    function floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    function encodeWAV(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);
        new TextEncoder().encodeInto("RIFF", new Uint8Array(buffer, 0, 4));
        view.setUint32(4, 36 + samples.length * 2, true);
        new TextEncoder().encodeInto("WAVE", new Uint8Array(buffer, 8, 4));
        new TextEncoder().encodeInto("fmt ", new Uint8Array(buffer, 12, 4));
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        new TextEncoder().encodeInto("data", new Uint8Array(buffer, 36, 4));
        view.setUint32(40, samples.length * 2, true);
        floatTo16BitPCM(view, 44, samples);
        return view;
    }

    const startRecording = async () => {
        try {
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
                setAudioURL(null);
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            setIsPlaying(false);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioCtx = new AudioContext({ sampleRate: 16000 });
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(0, 1, 1);

            processor.onaudioprocess = (e) => {
                chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            ctxRef.current = audioCtx;
            procRef.current = processor;
            streamRef.current = stream;
            setIsRecording(true);
            console.log('녹음 시작');
        } catch (err) {
            console.error('마이크 접근 오류:', err);
            alert('마이크 접근 권한이 필요합니다.');
        }
    };

    const stopRecording = () => {
        if (procRef.current && isRecording) {
            procRef.current.disconnect();
            ctxRef.current.close();
            streamRef.current.getTracks().forEach((t) => t.stop());

            const chunks = chunksRef.current;
            const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
            const merged = mergeBuffers(chunks, totalLen);
            const wavView = encodeWAV(merged, ctxRef.current.sampleRate);
            const blob = new Blob([wavView], { type: 'audio/wav' });

            chunksRef.current = [];
            setIsRecording(false);

            const url = URL.createObjectURL(blob);
            setAudioURL(url);

            if (audioRef.current) {
                audioRef.current.src = url;
            }

            console.log('녹음 완료, 음성 인식 시작');
            transcribeAudio(blob);
        }
    };

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    if (error) {
        return (
            <div className="chat-layout-modern">
                <div className="bg-shapes">
                    <div className="shape shape1"></div>
                    <div className="shape shape2"></div>
                    <div className="shape shape3"></div>
                </div>

                <header className="chat-header-modern">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            <span>←</span>
                        </button>
                        <div className="page-title">
                            <h1>💬 Context Chat</h1>
                            <p>Error occurred</p>
                        </div>
                    </div>
                </header>

                <div className="error-container">
                    <div className="error-message">
                        <h2>오류가 발생했습니다</h2>
                        <p>{error.message}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-layout-modern">
            {/* Background Shapes */}
            <div className="bg-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>

            {/* Header */}
            <header className="chat-header-modern">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <span>←</span>
                    </button>
                    <div className="page-title">
                        <h1>💬 Context Chat</h1>
                        <p>{isLoading ? 'Loading...' : chatRoomData?.title || 'Chat Room'}</p>
                    </div>
                </div>
                <div className="chat-status">
                    <span className="status-indicator active">온라인</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="chat-main">
                <div className="chat-container">
                    {/* Chat Section */}
                    <div className="chat-section">
                        <div className="chat-messages" ref={containerRef}>
                            {chatData.map((message, index) => {
                                if (message.role === 'assistant') {
                                    return (
                                        <div key={index} className="message-container assistant-message">
                                            <div className="message-avatar">
                                                <div className="avatar-icon">🤖</div>
                                            </div>
                                            <div className="message-bubble assistant-bubble">
                                                <div className="message-content">
                                                    {message.content}
                                                </div>
                                                <button
                                                    className={`tts-btn ${playingMessageId === `assistant-${index}` ? 'playing' : ''}`}
                                                    onClick={() => handleTTSClick(message.content, `assistant-${index}`)}
                                                    title={playingMessageId === `assistant-${index}` ? "재생 중지" : "음성 재생"}
                                                >
                                                    {playingMessageId === `assistant-${index}` ? '⏸️' : '🔊'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                } else if (message.role === 'user') {
                                    return (
                                        <div key={index} className="message-container user-message">
                                            <div className="message-bubble user-bubble">
                                                <div className="message-content">
                                                    {message.content}
                                                </div>
                                            </div>
                                            <div className="message-avatar">
                                                <div className="avatar-icon">👤</div>
                                            </div>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div key={index} className="message-container error-message">
                                            <div className="message-bubble error-bubble">
                                                <div className="message-content">
                                                    ❌ 메시지 전송 중 오류가 발생했습니다
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            })}

                            {isTranscribing && (
                                <div className="message-container system-message">
                                    <div className="message-bubble system-bubble">
                                        <div className="typing-indicator">
                                            <span>🎤 음성을 분석하고 있습니다</span>
                                            <div className="dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isAITyping && (
                                <div className="message-container assistant-message">
                                    <div className="message-avatar">
                                        <div className="avatar-icon">🤖</div>
                                    </div>
                                    <div className="message-bubble assistant-bubble typing-bubble">
                                        <div className="ai-typing-indicator">
                                            <span>AI가 답변을 작성하고 있습니다</span>
                                            <div className="dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Section */}
                        <div className="chat-input-section">
                            <button
                                className={`mic-btn-modern ${isRecording ? 'recording' : ''}`}
                                onClick={handleMicClick}
                                disabled={isTranscribing || isAITyping}
                            >
                                <span className="mic-icon">
                                    {isRecording ? '⏹️' : '🎤'}
                                </span>
                                <span className="mic-label">
                                    {isRecording ? '중지' : (isTranscribing ? '분석중...' : '녹음')}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="feedback-section">
                        <div className="feedback-header">
                            <h3>📢 자동 피드백 시스템</h3>
                            <div className="feedback-status">
                                {feedback ? '분석 완료' : '대기 중'}
                            </div>
                        </div>

                        <div className="feedback-content-area">
                            {feedback === null ? (
                                <div className="feedback-placeholder">
                                    <div className="placeholder-icon">🎯</div>
                                    <h4>피드백 대기 중</h4>
                                    <p>메시지를 보내면 자동으로 문법과 표현에 대한 피드백을 받을 수 있습니다.</p>
                                </div>
                            ) : (
                                <div className="feedback-results">
                                    {/* Grammatical Errors */}
                                    <div className="feedback-category">
                                        <h4 className="category-title">📝 문법 오류</h4>
                                        {feedback.grammatical_errors.length === 0 ? (
                                            <div className="no-errors">
                                                ✅ 문법 오류가 없습니다!
                                            </div>
                                        ) : (
                                            <div className="feedback-items">
                                                {feedback.grammatical_errors.map((error, idx) => (
                                                    <div key={idx} className="feedback-item error-item">
                                                        <div className="item-header">
                                                            <span className="item-number">#{idx + 1}</span>
                                                            <span className="item-type">문법 오류</span>
                                                        </div>
                                                        <div className="item-content">
                                                            <div className="content-row">
                                                                <span className="label">틀린 부분:</span>
                                                                <span className="value incorrect">{error['Incorrect part']}</span>
                                                            </div>
                                                            <div className="content-row">
                                                                <span className="label">올바른 표현:</span>
                                                                <span className="value correct">{error['Corrected version']}</span>
                                                            </div>
                                                            <div className="content-row">
                                                                <span className="label">이유:</span>
                                                                <span className="value reason">{error['Reason']}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Better Expressions */}
                                    <div className="feedback-category">
                                        <h4 className="category-title">✨ 더 나은 표현</h4>
                                        {feedback.better_expressions.length === 0 ? (
                                            <div className="no-suggestions">
                                                👍 표현이 이미 훌륭합니다!
                                            </div>
                                        ) : (
                                            <div className="feedback-items">
                                                {feedback.better_expressions.map((expression, idx) => (
                                                    <div key={idx} className="feedback-item suggestion-item">
                                                        <div className="item-header">
                                                            <span className="item-number">#{idx + 1}</span>
                                                            <span className="item-type">개선 제안</span>
                                                        </div>
                                                        <div className="item-content">
                                                            <div className="content-row">
                                                                <span className="label">원래 표현:</span>
                                                                <span className="value original">{expression['Original part']}</span>
                                                            </div>
                                                            <div className="content-row">
                                                                <span className="label">개선된 표현:</span>
                                                                <span className="value suggestion">{expression['Suggestion']}</span>
                                                            </div>
                                                            <div className="content-row">
                                                                <span className="label">이유:</span>
                                                                <span className="value reason">{expression['Reason']}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                style={{ display: 'none' }}
            />
        </div>
    );
}