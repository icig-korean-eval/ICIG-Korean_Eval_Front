import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Style/LessonDetail.css';
import lessonData from './Data/Lesson.json';
import { useLevel } from './LevelTabs';

export default function LessonDetail() {
    const navigate = useNavigate();
    const { level, day } = useParams();

    const { markLessonComplete, getLessonInfo } = useLevel();

    // 녹음 관련 state와 ref (기존 기능 유지)
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const audioRef = useRef(null);

    // TTS 관련 state (기존 기능 유지)
    const [isTTSPlaying, setIsTTSPlaying] = useState(false);
    const [isTTSLoading, setIsTTSLoading] = useState(false);

    const chunksRef = useRef([]);
    const ctxRef = useRef(null);
    const procRef = useRef(null);
    const streamRef = useRef(null);

    // 레슨 완료 상태 (기존 기능 유지)
    const [isLessonCompleted, setIsLessonCompleted] = useState(false);
    const [showCompletionMessage, setShowCompletionMessage] = useState(false);

    const levelLessons = lessonData[level] || [];
    const currentLesson = levelLessons.find(lesson => lesson.Day === parseInt(day));

    const getLevelIcon = () => {
        switch (level) {
            case 'Beginner': return '🐥';
            case 'Intermediate': return '🦤';
            case 'Advanced': return '🦜';
            default: return '📖';
        }
    };

    // 모든 기존 함수들 유지
    const playTTS = () => {
        if (!currentLesson?.ExampleSentence) return;

        try {
            if (isTTSPlaying) {
                window.speechSynthesis.cancel();
                setIsTTSPlaying(false);
                return;
            }

            if (!('speechSynthesis' in window)) {
                alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
                return;
            }

            setIsTTSLoading(true);

            const utterance = new SpeechSynthesisUtterance(currentLesson.ExampleSentence);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const koreanVoice = voices.find(voice =>
                voice.lang.includes('ko') || voice.lang.includes('KR')
            );

            if (koreanVoice) {
                utterance.voice = koreanVoice;
                console.log('한국어 음성 사용:', koreanVoice.name);
            } else {
                console.log('한국어 음성을 찾을 수 없어 기본 음성 사용');
            }

            utterance.onstart = () => {
                console.log('TTS 시작');
                setIsTTSLoading(false);
                setIsTTSPlaying(true);
            };

            utterance.onend = () => {
                console.log('TTS 완료');
                setIsTTSPlaying(false);
            };

            utterance.onerror = (event) => {
                console.error('TTS 오류:', event.error);
                setIsTTSLoading(false);
                setIsTTSPlaying(false);
                alert('음성 재생 중 오류가 발생했습니다.');
            };

            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('TTS 재생 오류:', error);
            setIsTTSLoading(false);
            setIsTTSPlaying(false);
            alert('음성 재생에 실패했습니다.');
        }
    };

    const stopTTS = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsTTSPlaying(false);
        }
    };

    // 모든 기존 발음 분석 관련 함수들 유지...
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
            return data;
        } catch (error) {
            console.error('IPA 변환 오류:', error);
            return null;
        }
    };

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

        if (score >= 70 && !isLessonCompleted) {
            console.log('=== 레슨 완료 처리 ===');
            console.log('점수:', score, '레벨:', level, '일차:', day);

            const success = markLessonComplete(level, parseInt(day), score);
            if (success) {
                setIsLessonCompleted(true);
                setShowCompletionMessage(true);

                setTimeout(() => {
                    setShowCompletionMessage(false);
                }, 3000);
            }
        }

        return {
            score,
            feedback,
            differences,
            originalIPA,
            userIPA
        };
    };

    const [lessonIPA, setLessonIPA] = useState('');
    const [pronunciationResult, setPronunciationResult] = useState(null);

    // 모든 기존 녹음 관련 함수들 유지...
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

                if (transcribedText && lessonIPA) {
                    console.log('발음 비교 시작...');
                    console.log('인식된 텍스트:', transcribedText);

                    const userIPAResult = await convertTextToIPA(transcribedText);

                    if (userIPAResult && userIPAResult.original) {
                        const comparison = comparePronunciation(lessonIPA, userIPAResult.original);
                        setPronunciationResult(comparison);

                        setTimeout(() => {
                            alert(`발음 점수: ${comparison.score}점\n${comparison.feedback}`);
                        }, 500);
                    }
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

    // 녹음 관련 유틸리티 함수들 (기존 유지)
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
            setPronunciationResult(null);

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

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    // useEffect들 유지
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

    useEffect(() => {
        const lessonInfo = getLessonInfo(level, parseInt(day));
        if (lessonInfo && lessonInfo.completed && lessonInfo.score >= 70) {
            setIsLessonCompleted(true);
        }
    }, [level, day, getLessonInfo]);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('사용 가능한 음성:', voices.filter(v => v.lang.includes('ko')));
        };

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();

        return () => {
            stopTTS();
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
            if (isRecording && streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [audioURL, isRecording]);

    if (!currentLesson) {
        return (
            <div className="lesson-detail-modern">
                <div className="bg-shapes">
                    <div className="shape shape1"></div>
                    <div className="shape shape2"></div>
                    <div className="shape shape3"></div>
                </div>

                <header className="lesson-header-modern">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            <span>←</span>
                        </button>
                        <div className="lesson-info">
                            <h1>📖 Daily Learning</h1>
                        </div>
                    </div>
                </header>

                <div className="lesson-container">
                    <div className="error-message">
                        <h2>레슨을 찾을 수 없습니다.</h2>
                        <button onClick={() => navigate(-1)} className="back-to-lessons">
                            돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lesson-detail-modern">
            {/* Background Shapes */}
            <div className="bg-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>

            {/* Header */}
            <header className="lesson-header-modern">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <span>←</span>
                    </button>
                    <div className="lesson-info">
                        <h1>
                            <span className="lesson-icon">{getLevelIcon()}</span>
                            Day {currentLesson.Day} - {currentLesson.Topic}
                        </h1>
                        <div className="lesson-meta">
                            <span className="level-badge">{level}</span>
                            {isLessonCompleted && (
                                <span className="completion-badge-header">✅ 완료</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="lesson-main">
                <div className="lesson-container">
                    {/* 레슨 완료 메시지 */}
                    {showCompletionMessage && (
                        <div className="completion-message-modern">
                            <div className="completion-icon">🎉</div>
                            <div className="completion-text">
                                <h3>축하합니다!</h3>
                                <p>레슨을 완료했습니다!<br />다음 레슨이 해제되었습니다.</p>
                            </div>
                        </div>
                    )}

                    {/* AI Tutor Section */}
                    <section className="chat-section tutor-section">
                        <div className="avatar tutor-avatar">
                            🤖
                        </div>
                        <div className="message-bubble tutor-bubble">
                            <div className="tutor-greeting">
                                <h3>Hi, ICIGI! 👋</h3>
                                <p>Today, we're going to learn how to use <strong>"{currentLesson.KeyExpression}"</strong> in Korean.</p>
                                <p>Let's start with a simple sentence!</p>
                            </div>

                            <div className="korean-example-modern">
                                <div className="sentence-header">
                                    <div className="korean-text">
                                        👉 "{currentLesson.ExampleSentence}"
                                    </div>
                                    <button
                                        className={`tts-button-modern ${isTTSPlaying ? 'playing' : ''}`}
                                        onClick={playTTS}
                                        disabled={isTTSLoading}
                                        title="음성으로 듣기"
                                    >
                                        {isTTSLoading ? (
                                            <span className="loading-spinner">⏳</span>
                                        ) : isTTSPlaying ? (
                                            <span className="speaker-icon">🔊</span>
                                        ) : (
                                            <span className="speaker-icon">🔈</span>
                                        )}
                                    </button>
                                </div>

                                <div className="lesson-details">
                                    <div className="detail-item">
                                        <span className="label">Key Expression:</span>
                                        <span className="value">{currentLesson.KeyExpression}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">💬 Topic:</span>
                                        <span className="value">{currentLesson.Topic}</span>
                                    </div>
                                    {lessonIPA && (
                                        <div className="detail-item">
                                            <span className="label">🔊 IPA:</span>
                                            <span className="value ipa-text">/{lessonIPA}/</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="instruction-box">
                                <p>🎯 <strong>목표: 70점 이상을 받아서 다음 레슨을 해제하세요!</strong></p>
                                <p>Click the speaker button to listen, then try saying it out loud!</p>
                                {isLessonCompleted && (
                                    <div className="completion-note-modern">
                                        ✅ 이미 완료한 레슨입니다. 복습해보세요!
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 발음 비교 결과 */}
                    {pronunciationResult && (
                        <section className="pronunciation-result-modern">
                            <div className="result-header">
                                <h3>🎯 발음 분석 결과</h3>
                                <span className={`score-badge ${pronunciationResult.score >= 70 ? 'good' : 'needs-practice'}`}>
                                    {pronunciationResult.score}점
                                </span>
                            </div>

                            <div className="feedback-content">
                                <p className="feedback-text">{pronunciationResult.feedback}</p>

                                <div className="ipa-comparison-modern">
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
                                    <div className="differences-modern">
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
                                    className="try-again-btn-modern"
                                    onClick={() => setPronunciationResult(null)}
                                >
                                    다시 시도하기
                                    <span className="btn-arrow">🔄</span>
                                </button>
                            </div>
                        </section>
                    )}

                    {/* 오디오 재생 컨트롤 */}
                    {audioURL && (
                        <section className="audio-section">
                            <div className="audio-controls-modern">
                                <button
                                    className={`audio-play-btn ${isPlaying ? 'playing' : ''}`}
                                    onClick={handlePlayClick}
                                >
                                    <span className="play-icon">{isPlaying ? '⏸️' : '▶️'}</span>
                                </button>
                                <span className="audio-label">녹음된 음성 재생</span>
                            </div>
                        </section>
                    )}

                    {/* 음성 녹음 섹션 */}
                    <section className="recording-section-modern">
                        <div className="recording-header">
                            <h3>🎤 음성 녹음하기</h3>
                            <p>아래 버튼을 눌러서 예시 문장을 따라 말해보세요!</p>
                        </div>

                        <div className="target-sentence-modern">
                            "{currentLesson.ExampleSentence}"
                        </div>

                        <div className="recording-controls-modern">
                            <button
                                className={`mic-button-modern ${isRecording ? 'recording' : ''}`}
                                onClick={handleMicClick}
                                disabled={isTranscribing}
                            >
                                <div className="mic-content">
                                    <span className="mic-icon">
                                        {isRecording ? '⏹️' : '🎤'}
                                    </span>
                                    <span className="mic-text">
                                        {isRecording ? '녹음 중지' : (isTranscribing ? '분석 중...' : '녹음 시작')}
                                    </span>
                                </div>
                            </button>
                        </div>

                        {isTranscribing && (
                            <div className="analyzing-message-modern">
                                <div className="analyzing-spinner">🔄</div>
                                <p>음성을 분석하고 있습니다...</p>
                            </div>
                        )}
                    </section>

                    {/* 숨겨진 오디오 엘리먼트 */}
                    <audio
                        ref={audioRef}
                        onEnded={handleAudioEnded}
                        style={{ display: 'none' }}
                    />
                </div>
            </main>
        </div>
    );
}