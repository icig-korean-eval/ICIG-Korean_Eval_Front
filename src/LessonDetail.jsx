import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Style/LessonDetail.css';
import lessonData from './Data/Lesson.json';

export default function LessonDetail() {
    const navigate = useNavigate();
    const { level, day } = useParams();

    // 녹음 관련 state와 ref
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
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

    // 음성을 텍스트로 변환하는 함수
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
                    // 'Content-Type'은 자동 설정되므로 절대 명시하지 마세요.
                },
                body: formData
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
            }

            try {
                const data = JSON.parse(responseText);
                console.log('Parsed data:', data);
                setTranscription(data.transcription || '');
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
                        </div>

                        <p>Try saying it out loud with me!</p>
                        <p>Ready? Let's go</p>
                    </div>
                </div>

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
                        disabled={isTranscribing}
                    />
                    <div className="ai-buttons">
                        <button
                            className={`mic-button ${isRecording ? 'recording' : ''}`}
                            onClick={handleMicClick}
                            disabled={isTranscribing}
                        >
                            {isRecording ? '⏹️' : '🎤'}
                        </button>
                        <button className="send-button">▶</button>
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