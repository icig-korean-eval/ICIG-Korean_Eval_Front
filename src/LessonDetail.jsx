import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Style/LessonDetail.css';
import lessonData from './Data/Lesson.json';

export default function LessonDetail() {
    const navigate = useNavigate();
    const { level, day } = useParams();
    const location = useLocation();
    const chatId = location.state?.chatId; // DailyLearning에서 전달받은 chatId

    // 녹음 관련 state와 ref
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSending, setIsSending] = useState(false); // 메시지 전송 중 상태
    const [chatHistory, setChatHistory] = useState([]); // 채팅 기록
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const chunksRef = useRef([]);
    const ctxRef = useRef(null);
    const procRef = useRef(null);
    const streamRef = useRef(null);

    // 레벨과 날짜에 맞는 레슨 데이터 가져오기
    const levelLessons = lessonData[level] || [];
    const currentLesson = levelLessons.find(lesson => lesson.Day === parseInt(day));

    // 레벨별 아이콘 설정
    const getLevelIcon = () => {
        switch (level) {
            case 'Beginner': return '🐥';
            case 'Intermediate': return '🦤';
            case 'Advanced': return '🦜';
            default: return '📖';
        }
    };

    // 채팅 메시지 전송 API 함수 (Chat Conversation API 사용)
    const sendChatMessage = async (message) => {
        try {
            setIsSending(true);

            const token = 'ZATae5h-sckvlY06-aks7r-Kn2uMq';

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            console.log('=== Chat Conversation API 호출 ===');
            console.log('Endpoint: /api/v1/chat/conversation');
            console.log('chatId:', chatId);
            console.log('chatId 타입:', typeof chatId);
            console.log('message:', message);

            // chatId가 없으면 에러
            if (!chatId) {
                throw new Error('Chat ID가 없습니다. 레슨을 다시 시작해주세요.');
            }

            // Chat Conversation API 스펙에 맞는 요청 본문
            const requestBody = {
                chat_id: chatId,
                message: message
            };

            console.log('Request body:', JSON.stringify(requestBody, null, 2));
            console.log('Request headers:', headers);

            const response = await fetch('/api/v1/chat/conversation', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            console.log('응답 상태:', response.status);
            console.log('응답 OK:', response.ok);

            const responseText = await response.text();
            console.log('응답 본문 (raw):', responseText);

            if (!response.ok) {
                console.log('=== API 오류 분석 ===');

                if (response.status === 404) {
                    console.log('404 에러: Chat history not found');
                    console.log('가능한 원인:');
                    console.log('1. chatId가 잘못되었을 수 있음:', chatId);
                    console.log('2. 채팅 세션이 만료되었을 수 있음');
                    console.log('3. 채팅 생성 후 충분한 시간이 지나지 않았을 수 있음');

                    // chatId 형식 확인
                    console.log('chatId 길이:', chatId?.length);
                    console.log('chatId UUID 형식 체크:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId));

                    throw new Error(`채팅 세션을 찾을 수 없습니다. chatId: ${chatId}\n레슨을 다시 시작해주세요.`);
                } else if (response.status === 422) {
                    console.log('422 에러: 요청 데이터 검증 실패');
                    try {
                        const errorData = JSON.parse(responseText);
                        console.log('검증 오류 상세:', errorData);
                        throw new Error(`요청 데이터 오류: ${JSON.stringify(errorData)}`);
                    } catch (parseError) {
                        throw new Error(`요청 데이터 검증 실패: ${responseText}`);
                    }
                } else {
                    throw new Error(`API 오류 ${response.status}: ${responseText}`);
                }
            }

            // 성공 응답 처리
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('=== 성공 응답 ===');
                console.log('파싱된 데이터:', data);
            } catch (parseError) {
                console.error('JSON 파싱 오류:', parseError);
                throw new Error(`서버 응답 파싱 실패: ${responseText}`);
            }

            // 메시지 전송 성공 후 채팅 기록을 다시 로드
            console.log('메시지 전송 성공, 채팅 기록을 새로 로드합니다.');
            await loadChatHistory();

            // 입력 필드 초기화
            setTranscription('');

            console.log('메시지 전송 완료!');
            return data;

        } catch (error) {
            console.error('=== 채팅 전송 최종 오류 ===');
            console.error('오류 상세:', error);
            alert(`메시지 전송 실패: ${error.message}`);
            throw error;
        } finally {
            setIsSending(false);
        }
    };

    // 채팅 기록 로드 함수
    const loadChatHistory = async () => {
        if (!chatId) return false;

        try {
            const token = 'ZATae5h-sckvlY06-aks7r-Kn2uMq';

            console.log('=== 채팅 기록 로드 ===');
            console.log('chatId:', chatId);

            const response = await fetch(`/api/v1/chat/${chatId}/history`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('채팅 기록 응답 상태:', response.status);

            if (response.ok) {
                const historyData = await response.json();
                console.log('채팅 기록 데이터:', historyData);

                // API 응답을 우리 채팅 기록 형식으로 변환
                const formattedHistory = historyData.map(item => ({
                    type: item.role === 'user' ? 'user' : 'ai',
                    message: item.content,
                    timestamp: item.timestamp
                }));

                setChatHistory(formattedHistory);
                console.log('채팅 기록 로드 완료:', formattedHistory);
                return true;
            } else {
                const errorText = await response.text();
                console.log('채팅 기록 로드 실패:', errorText);

                if (response.status === 404) {
                    console.log('404 에러: 새로운 채팅 세션이거나 아직 준비되지 않음');
                    // 빈 채팅 기록으로 시작
                    setChatHistory([]);
                }
                return false;
            }
        } catch (error) {
            console.error('채팅 기록 로드 오류:', error);
            // 오류가 있어도 빈 배열로 시작
            setChatHistory([]);
            return false;
        }
    };

    // 컴포넌트 마운트 시 채팅 기록 로드
    useEffect(() => {
        if (chatId) {
            console.log('chatId가 설정됨, 채팅 기록 로드 시작');
            // 채팅 기록 로드가 실패해도 계속 진행
            loadChatHistory().catch(error => {
                console.log('초기 채팅 기록 로드 실패, 빈 상태로 시작:', error);
            });
        }
    }, [chatId]);

    // Send 버튼 클릭 핸들러
    const handleSendMessage = async () => {
        if (!transcription.trim() || isSending) return;

        console.log('=== Send 버튼 클릭 디버그 ===');
        console.log('현재 chatId:', chatId);
        console.log('보낼 메시지:', transcription.trim());

        if (!chatId) {
            alert('채팅 세션이 없습니다. 다시 시작해주세요.');
            return;
        }

        // 채팅 기록이 없어도 메시지 전송 시도
        console.log('메시지 전송을 시도합니다...');
        await sendChatMessage(transcription.trim());
    };

    // IPA 변환 함수 (텍스트용)
    const convertTextToIPA = async (text) => {
        try {
            const token = 'ZATae5h-sckvlY06-aks7r-Kn2uMq';

            const response = await fetch('/api/v1/ipa/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: text
                })
            });

            if (!response.ok) {
                throw new Error(`IPA 변환 실패: ${response.status}`);
            }

            const data = await response.json();
            console.log('IPA 변환 결과:', data);
            return data;
        } catch (error) {
            console.error('IPA 변환 오류:', error);
            return null;
        }
    };

    // 발음 비교 함수
    const comparePronunciation = (originalIPA, userIPA) => {
        console.log('=== 발음 비교 ===');
        console.log('원본 IPA:', originalIPA);
        console.log('사용자 IPA:', userIPA);

        if (!originalIPA || !userIPA) {
            return {
                score: 0,
                feedback: '발음 분석을 할 수 없습니다.',
                differences: []
            };
        }

        // 간단한 문자 단위 비교 (실제로는 더 정교한 음성학적 비교가 필요)
        const original = originalIPA.toLowerCase().replace(/\s+/g, '');
        const user = userIPA.toLowerCase().replace(/\s+/g, '');

        let matches = 0;
        let differences = [];
        const maxLength = Math.max(original.length, user.length);

        for (let i = 0; i < maxLength; i++) {
            const originalChar = original[i] || '';
            const userChar = user[i] || '';

            if (originalChar === userChar) {
                matches++;
            } else {
                differences.push({
                    position: i,
                    expected: originalChar,
                    actual: userChar
                });
            }
        }

        const score = Math.round((matches / maxLength) * 100);

        let feedback = '';
        if (score >= 90) {
            feedback = '완벽한 발음입니다! 🎉';
        } else if (score >= 70) {
            feedback = '좋은 발음입니다! 조금 더 연습하면 완벽해질 거예요. 👍';
        } else if (score >= 50) {
            feedback = '발음을 더 연습해보세요. 천천히 따라해보세요. 📚';
        } else {
            feedback = '발음을 다시 연습해보세요. 예시를 들어보고 따라해보세요. 🔄';
        }

        return {
            score,
            feedback,
            differences,
            originalIPA,
            userIPA
        };
    };

    // 레슨 데이터에 IPA 추가
    const [lessonIPA, setLessonIPA] = useState('');
    const [pronunciationResult, setPronunciationResult] = useState(null);

    // 컴포넌트 마운트 시 레슨 텍스트의 IPA 생성
    useEffect(() => {
        if (currentLesson && currentLesson.ExampleSentence) {
            console.log('레슨 텍스트 IPA 변환 시작:', currentLesson.ExampleSentence);
            convertTextToIPA(currentLesson.ExampleSentence).then(result => {
                if (result && result.original) {
                    setLessonIPA(result.original);
                    console.log('레슨 IPA 설정 완료:', result.original);
                }
            });
        }
    }, [currentLesson]);

    // 음성을 텍스트로 변환하는 함수 (수정됨)
    const transcribeAudio = async (wavBlob) => {
        try {
            setIsTranscribing(true);
            setTranscription('');

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
            console.log('Transcription response text:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
            }

            try {
                const data = JSON.parse(responseText);
                console.log('Transcription parsed data:', data);

                const transcribedText = data.transcription || '';
                setTranscription(transcribedText);

                // 음성 인식 성공 시 발음 비교 수행
                if (transcribedText && lessonIPA) {
                    console.log('발음 비교 시작...');
                    const userIPAResult = await convertTextToIPA(transcribedText);

                    if (userIPAResult && userIPAResult.original) {
                        const comparison = comparePronunciation(lessonIPA, userIPAResult.original);
                        setPronunciationResult(comparison);

                        // 발음 결과를 사용자에게 표시
                        setTimeout(() => {
                            alert(`발음 점수: ${comparison.score}점\n${comparison.feedback}`);
                        }, 500);
                    }
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

    // WAV 변환 함수
    const convertToWav = async (audioBlob) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // WAV 헤더 생성
        const length = audioBuffer.length * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);

        // WAV 파일 헤더 작성
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);

        // 오디오 데이터 작성
        const channelData = audioBuffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    };

    // 녹음 시작 함수
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
            setTranscription('');

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
            console.log('recording')
        } catch (err) {
            console.error('마이크 접근 오류:', err);
            alert('마이크 접근 권한이 필요합니다.');
        }
    };

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
        // RIFF 헤더
        new TextEncoder().encodeInto("RIFF", new Uint8Array(buffer, 0, 4));
        view.setUint32(4, 36 + samples.length * 2, true);
        new TextEncoder().encodeInto("WAVE", new Uint8Array(buffer, 8, 4));
        new TextEncoder().encodeInto("fmt ", new Uint8Array(buffer, 12, 4));
        view.setUint32(16, 16, true);       // fmt chunk size
        view.setUint16(20, 1, true);        // PCM
        view.setUint16(22, 1, true);        // 채널 수
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        new TextEncoder().encodeInto("data", new Uint8Array(buffer, 36, 4));
        view.setUint32(40, samples.length * 2, true);
        floatTo16BitPCM(view, 44, samples);
        return view;
    }

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
            setAudioUrl(URL.createObjectURL(blob));
            chunksRef.current = [];
            setIsRecording(false);

            const url = URL.createObjectURL(blob);
            setAudioURL(url);

            if (audioRef.current) {
                audioRef.current.src = url;
            }

            const audio = new Audio(url);

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

    // Enter 키로 메시지 전송
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // 컴포넌트 언마운트 시 cleanup
    useEffect(() => {
        return () => {
            // 오디오 URL 정리
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
            // 녹음 중이면 중지
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [audioURL, isRecording]);

    // chatId 확인용 로그
    useEffect(() => {
        console.log('LessonDetail에서 받은 chatId:', chatId);
    }, [chatId]);

    if (!currentLesson) {
        return (
            <div className="lesson-detail">
                <header className="lesson-header">
                    <button className="back-button" onClick={() => navigate(-1)}>←</button>
                    <h2>📖 Daily Learning</h2>
                </header>
                <div className="lesson-content">
                    <p>레슨을 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lesson-detail">
            <header className="lesson-header">
                <button className="back-button" onClick={() => navigate(-1)}>←</button>
                <h2>📖 Daily Learning</h2>
            </header>

            <div className="lesson-content">
                <div className="lesson-title">
                    <span className="lesson-icon">{getLevelIcon()}</span>
                    <h1>Day {currentLesson.Day} - {currentLesson.Topic}</h1>
                </div>

                <div className="tutor-section">
                    <div className="tutor-avatar">👤</div>
                    <div className="tutor-message">
                        <p>Hi, ICIGI</p>
                        <p>Today, we're going to learn how to use "{currentLesson.KeyExpression}" in Korean.</p>
                        <p>Let's start with a simple sentence!</p>

                        <div className="korean-example">
                            <p className="korean-text">👉 "{currentLesson.ExampleSentence}"</p>
                            <p className="translation">Key Expression: {currentLesson.KeyExpression}</p>
                            <p className="meaning">💬 Topic: {currentLesson.Topic}</p>
                            {lessonIPA && (
                                <p className="ipa-text">🔊 IPA: /{lessonIPA}/</p>
                            )}
                        </div>

                        <p>Try saying it out loud with me!</p>
                        <p>Ready? Let's go</p>
                    </div>
                </div>

                {/* 발음 비교 결과 표시 */}
                {pronunciationResult && (
                    <div className="pronunciation-result">
                        <div className="result-header">
                            <h3>🎯 발음 분석 결과</h3>
                            <span className={`score ${pronunciationResult.score >= 70 ? 'good' : 'needs-practice'}`}>
                                {pronunciationResult.score}점
                            </span>
                        </div>
                        <p className="feedback">{pronunciationResult.feedback}</p>

                        <div className="ipa-comparison">
                            <div className="ipa-row">
                                <span className="label">목표:</span>
                                <span className="ipa">/{pronunciationResult.originalIPA}/</span>
                            </div>
                            <div className="ipa-row">
                                <span className="label">당신:</span>
                                <span className="ipa">/{pronunciationResult.userIPA}/</span>
                            </div>
                        </div>

                        {pronunciationResult.differences.length > 0 && (
                            <div className="differences">
                                <h4>개선할 부분:</h4>
                                <ul>
                                    {pronunciationResult.differences.slice(0, 3).map((diff, index) => (
                                        <li key={index}>
                                            위치 {diff.position + 1}: '{diff.expected}' → '{diff.actual}'
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            className="try-again-btn"
                            onClick={() => setPronunciationResult(null)}
                        >
                            다시 시도하기
                        </button>
                    </div>
                )}

                {/* 채팅 기록 표시 */}
                {chatHistory.length > 0 && (
                    <div className="chat-history">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`chat-message ${chat.type}`}>
                                <div className="message-content">
                                    {chat.type === 'user' ? '👤 ' : '🤖 '}
                                    {chat.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="audio-controls">
                    <button
                        className={`audio-button ${audioURL ? 'has-audio' : ''} ${isPlaying ? 'playing' : ''}`}
                        onClick={handlePlayClick}
                        disabled={!audioURL}
                    >
                        <span className="play-icon">{isPlaying ? '⏸' : '▶'}</span>
                    </button>
                </div>

                <div className="ai-tutor-section">
                    <input
                        type="text"
                        placeholder={isTranscribing ? "음성을 텍스트로 변환 중..." : "Speak to your AI tutor!"}
                        className="ai-input"
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isTranscribing || isSending}
                    />
                    <div className="ai-buttons">
                        <button
                            className={`mic-button ${isRecording ? 'recording' : ''}`}
                            onClick={handleMicClick}
                            disabled={isTranscribing || isSending}
                        >
                            {isRecording ? '⏹️' : '🎤'}
                        </button>
                        <button
                            className={`send-button ${!transcription.trim() || isSending ? 'disabled' : ''}`}
                            onClick={handleSendMessage}
                            disabled={!transcription.trim() || isSending}
                        >
                            {isSending ? '⏳' : '▶'}
                        </button>
                    </div>
                </div>

                {/* 숨겨진 오디오 엘리먼트 */}
                <audio
                    ref={audioRef}
                    onEnded={handleAudioEnded}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
}