import {useParams, useNavigate} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import logoIcon from '../assets/icons/clarity_talk-bubbles-outline-badged.svg';
import logoPlay from '../assets/images/gridicons_play.png'
import logoMic from '../assets/icons/mic.svg'
import logoStop from '../assets/icons/stop.svg'
import logoChat from '../assets/images/alstj1.png'
import logoSmile from '../assets/images/Vector.png'
import '../Style/Chat.scss'

export default function ChatLayout() {
    const containerRef = useRef(null);

    const navigate = useNavigate();
    const { chatId } = useParams();
    const [chatData, setChatData] = useState([])
    const [error, setError] = useState(null)
    const [chatRoomData, setChatRoomData] = useState(null)
    const [isLoading, setIsLoading] = useState(true);


    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const audioRef = useRef(null);
    const chunksRef = useRef([]);
    const ctxRef = useRef(null);
    const procRef = useRef(null);
    const streamRef = useRef(null);



    useEffect(() => {
        // IIFE(즉시실행함수) 또는 별도 async 함수로 감싸서 async/await 사용 가능
        const fetchData = async () => {
            setIsLoading(true);
            let chatRoom = null
            let isError = false
            try {
                const res = await fetch(`/api/v1/chat/${chatId}`, {
                    headers: {
                        'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq'
                    }
                }); // 호출할 API 경로
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
                }); // 호출할 API 경로

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


    const sendChat = async (msg) => {
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
            console.error(e)
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

                // 음성 인식 성공 시 발음 비교 수행
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

    // 녹음 관련 유틸리티 함수들
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

    // 녹음 시작 함수
    const startRecording = async () => {
        try {
            // 이전 녹음 정리
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
                setAudioURL(null);
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            setIsPlaying(false);
            // setPronunciationResult(null);

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

    // 녹음 중지 함수
    const stopRecording = () => {
        if (procRef.current && isRecording) {
            procRef.current.disconnect();
            ctxRef.current.close();
            streamRef.current.getTracks().forEach((t) => t.stop());

            // WAV 생성
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

    // 마이크 버튼 클릭 핸들러
    const handleMicClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // 재생 버튼 클릭 핸들러
    const handlePlayClick = () => {
        if (!audioURL || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    // 오디오 재생 종료 핸들러
    const handleAudioEnded = () => {
        setIsPlaying(false);
    };




    if (error)   return <p>Error: {error.message}</p>;


    return (
        <div className="daily-learning">
            <header className="dl-header">
                <button className="back-button" onClick={() => navigate(-1)}>←</button>
                <div className='header-inside'>
                    <img src={logoIcon} alt="로고" width="50" height="50" />
                    <div>Context-aware learning {
                        isLoading ? '- Loading' : `- ${chatRoomData.title}`
                    }</div>
                </div>
            </header>
            <div className='chat-split'>
                <div className='split-container left-section'>
                    <div ref={containerRef} className='left-up'>
                        {chatData.map((value) => {
                            if (value.role === 'assistant') {
                                return (
                                    <div className='chat-box'>
                                        <div>
                                            <img src={logoChat} width='50' height='50'/>
                                        </div>
                                        <div className='chat-msg'>
                                            {value.content}
                                        </div>
                                        <div className='playbutton'>
                                            <img src={logoPlay} width='40' height='40'/>
                                        </div>
                                    </div>
                                )
                            } else if (value.role === 'user') {
                                return (
                                    <div className='chat-box box-user'>
                                        <div>
                                            <img src={logoSmile} width='50' height='50'/>
                                        </div>
                                        <div className='chat-msg'>
                                            {value.content}
                                        </div>
                                        {/*<div className='playbutton'>*/}
                                        {/*    <img src={logoPlay} width='40' height='40'/>*/}
                                        {/*</div>*/}
                                    </div>
                                )
                            } else {
                                return (
                                    <div className='chat-box box-error'>
                                        <div className='chat-msg'>
                                            error
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className='left-down'>
                        <div
                            className='mic'
                            onClick={handleMicClick}
                        >
                            <img src={isRecording ? logoStop : logoMic} width='32' height='32'/>
                        </div>
                    </div>
                </div>
                <div className='split-container right-section'>
                    <div className='section-title'>📢 Automated Feedback System</div>
                    <div className='section-content'>

                    </div>
                    <div className='playbutton'>
                        <img src={logoPlay} width='40' height='40'/>
                    </div>
                </div>
            </div>
        </div>
    )
}