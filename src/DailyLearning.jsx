import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Style/DailyLearning.css';
import { useLevel } from './LevelTabs';
import lessonData from './Data/Lesson.json';

export default function DailyLearning() {
    const navigate = useNavigate();
    const { completedDays, markDayComplete } = useLevel();

    const [selectedLevel, setSelectedLevel] = useState('Beginner');
    const [isLoading, setIsLoading] = useState(false);

    const levelLessons = lessonData[selectedLevel] || [];

    const lessons = levelLessons.map((lesson) => ({
        day: `Day ${lesson.Day}`,
        topic: lesson.Topic,
        expression: lesson.KeyExpression,
        example: lesson.ExampleSentence,
        index: lesson.Day - 1,
        situation: lesson.Situation, // API에 보낼 상황 데이터
    }));

    const isUnlocked = (index) => {
        if (index === 0) return true;
        return completedDays[selectedLevel]?.includes(index);
    };

    // 채팅 생성 API 호출 함수
    const createChat = async (situation) => {
        try {
            const token = 'ZATae5h-sckvlY06-aks7r-Kn2uMq';

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            console.log('채팅 생성 API 호출 중...');

            const response = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    situation: situation
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 오류:', errorText);
                throw new Error(`API 요청 실패: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('채팅 생성 성공:', data);
            return data.chat_id;
        } catch (error) {
            console.error('채팅 생성 오류:', error);
            throw error;
        }
    };

    const handleStartLesson = async (index) => {
        if (index === 0 || isUnlocked(index)) {
            setIsLoading(true);

            try {
                // 완료 상태 업데이트
                if (!completedDays[selectedLevel]?.includes(index + 1)) {
                    markDayComplete(selectedLevel, index + 1);
                }

                console.log('=== 레슨 시작 ===');
                console.log('레벨:', selectedLevel);
                console.log('일차:', index + 1);

                // 채팅 생성 없이 바로 LessonDetail 페이지로 이동
                navigate(`/lesson/${selectedLevel}/${index + 1}`);

                console.log('페이지 이동 완료');

            } catch (error) {
                console.error('Failed to start lesson:', error);
                alert('레슨을 시작하는 중 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="daily-learning">
            <header className="dl-header">
                <button className="back-button" onClick={() => navigate(-1)}>←</button>
                <h2>📖 Daily Learning</h2>
            </header>

            <div className="level-selector">
                <button
                    className={`level-btn beginner ${selectedLevel === 'Beginner' ? 'active' : ''}`}
                    onClick={() => setSelectedLevel('Beginner')}
                >
                    🐥 Beginner Level
                    <span className="level-desc">Basic Conversation<br />& Expression Expansion</span>
                </button>
                <button
                    className={`level-btn intermediate ${selectedLevel === 'Intermediate' ? 'active' : ''}`}
                    onClick={() => setSelectedLevel('Intermediate')}
                >
                    🦤 Intermediate Level
                    <span className="level-desc">Expressing Opinions<br />& Constructing Complex Sentence</span>
                </button>
                <button
                    className={`level-btn advanced ${selectedLevel === 'Advanced' ? 'active' : ''}`}
                    onClick={() => setSelectedLevel('Advanced')}
                >
                    🦜 Advanced Level
                    <span className="level-desc">Natural Expressions<br />& Conveying Complex Thoughts</span>
                </button>
            </div>

            <div className="lesson-list">
                {lessons.map((lesson) => {
                    const unlocked = isUnlocked(lesson.index);
                    const status = unlocked ? 'Get Started' : 'Complete Previous Lesson';
                    const statusType = unlocked ? 'start' : 'lock';

                    return (
                        <div key={lesson.index} className="lesson-card">
                            <div className="lesson-day">{lesson.day}</div>
                            <div className="lesson-content">
                                <div className="lesson-topic">
                                    <strong>Topic:</strong> {lesson.topic}
                                </div>
                                <div className="lesson-expression">
                                    <strong>Key Expression:</strong> {lesson.expression}
                                </div>
                                <div className="lesson-example">Ex) {lesson.example}</div>
                            </div>
                            <button
                                className={`lesson-button ${statusType === 'start' ? 'start' : 'disabled'}`}
                                disabled={statusType !== 'start' || isLoading}
                                onClick={() => handleStartLesson(lesson.index)}
                            >
                                {isLoading ? 'Loading...' : status}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}