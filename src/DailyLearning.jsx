import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Style/DailyLearning.css';
import { useLevel } from './LevelTabs';
import lessonData from './Data/Lesson.json';

export default function DailyLearning() {
    const navigate = useNavigate();
    const { completedDays, isLessonCompleted, getLessonInfo } = useLevel();

    const [selectedLevel, setSelectedLevel] = useState('Beginner');
    const [isLoading, setIsLoading] = useState(false);

    const levelLessons = lessonData[selectedLevel] || [];

    const lessons = levelLessons.map((lesson) => ({
        day: `Day ${lesson.Day}`,
        topic: lesson.Topic,
        expression: lesson.KeyExpression,
        example: lesson.ExampleSentence,
        index: lesson.Day - 1,
        situation: lesson.Situation,
        dayNumber: lesson.Day
    }));

    // 레슨 상태 확인 함수
    const getLessonStatus = (dayNumber) => {
        const lessonInfo = getLessonInfo(selectedLevel, dayNumber);
        const isCompleted = isLessonCompleted(selectedLevel, dayNumber);

        return {
            isCompleted,
            score: lessonInfo?.score || null,
            completedAt: lessonInfo?.completedAt || null
        };
    };

    // 잠금 해제 로직
    const isUnlocked = (index) => {
        if (index === 0) return true; // Day 1은 항상 해제

        // 이전 레슨이 70점 이상으로 완료되었는지 확인
        const previousDay = index; // index는 0부터 시작하므로 이전 일차는 index
        return isLessonCompleted(selectedLevel, previousDay);
    };

    const handleStartLesson = async (index, dayNumber) => {
        if (index === 0 || isUnlocked(index)) {
            setIsLoading(true);

            try {
                console.log('=== 레슨 시작 ===');
                console.log('레벨:', selectedLevel);
                console.log('일차:', dayNumber);

                // LessonDetail 페이지로 이동
                navigate(`/lesson/${selectedLevel}/${dayNumber}`);

                console.log('페이지 이동 완료');

            } catch (error) {
                console.error('Failed to start lesson:', error);
                alert('레슨을 시작하는 중 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // 레벨별 완료된 레슨 수 계산
    const getCompletedCount = (level) => {
        const totalLessons = lessonData[level]?.length || 0;
        const completedCount = completedDays[level]?.length || 0;
        return { completed: completedCount, total: totalLessons };
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
                    <div className="level-content">
                        <div className="level-header">
                            <span className="level-icon">🐥</span>
                            <span className="level-title">Beginner Level</span>
                        </div>
                        <span className="level-desc">Basic Conversation<br />& Expression Expansion</span>
                        <div className="progress-indicator">
                            <span className="progress-text">
                                {getCompletedCount('Beginner').completed}/{getCompletedCount('Beginner').total} 완료
                            </span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${(getCompletedCount('Beginner').completed / getCompletedCount('Beginner').total) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </button>
                <button
                    className={`level-btn intermediate ${selectedLevel === 'Intermediate' ? 'active' : ''}`}
                    onClick={() => setSelectedLevel('Intermediate')}
                >
                    <div className="level-content">
                        <div className="level-header">
                            <span className="level-icon">🦤</span>
                            <span className="level-title">Intermediate Level</span>
                        </div>
                        <span className="level-desc">Expressing Opinions<br />& Constructing Complex Sentence</span>
                        <div className="progress-indicator">
                            <span className="progress-text">
                                {getCompletedCount('Intermediate').completed}/{getCompletedCount('Intermediate').total} 완료
                            </span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${(getCompletedCount('Intermediate').completed / getCompletedCount('Intermediate').total) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </button>
                <button
                    className={`level-btn advanced ${selectedLevel === 'Advanced' ? 'active' : ''}`}
                    onClick={() => setSelectedLevel('Advanced')}
                >
                    <div className="level-content">
                        <div className="level-header">
                            <span className="level-icon">🦜</span>
                            <span className="level-title">Advanced Level</span>
                        </div>
                        <span className="level-desc">Natural Expressions<br />& Conveying Complex Thoughts</span>
                        <div className="progress-indicator">
                            <span className="progress-text">
                                {getCompletedCount('Advanced').completed}/{getCompletedCount('Advanced').total} 완료
                            </span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${(getCompletedCount('Advanced').completed / getCompletedCount('Advanced').total) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            <div className="lesson-list">
                {lessons.map((lesson) => {
                    const unlocked = isUnlocked(lesson.index);
                    const status = getLessonStatus(lesson.dayNumber);

                    let buttonText = 'Complete Previous Lesson';
                    let buttonType = 'lock';
                    let cardClass = 'lesson-card';

                    if (unlocked) {
                        if (status.isCompleted) {
                            buttonText = 'Review';
                            buttonType = 'completed';
                            cardClass = 'lesson-card completed';
                        } else {
                            buttonText = 'Get Started';
                            buttonType = 'start';
                        }
                    }

                    return (
                        <div key={lesson.index} className={cardClass}>
                            <div className="lesson-day-container">
                                <div className="lesson-day">{lesson.day}</div>
                                {status.isCompleted && (
                                    <div className="completion-badge">
                                        <span className="badge-icon">✅</span>
                                        <span className="badge-score">{status.score}점</span>
                                    </div>
                                )}
                            </div>
                            <div className="lesson-content">
                                <div className="lesson-topic">
                                    <strong>Topic:</strong> {lesson.topic}
                                    {status.isCompleted && <span className="completed-indicator">🏆</span>}
                                </div>
                                <div className="lesson-expression">
                                    <strong>Key Expression:</strong> {lesson.expression}
                                </div>
                                <div className="lesson-example">Ex) {lesson.example}</div>
                                {status.isCompleted && status.completedAt && (
                                    <div className="completion-date">
                                        완료일: {new Date(status.completedAt).toLocaleDateString('ko-KR')}
                                    </div>
                                )}
                            </div>
                            <button
                                className={`lesson-button ${buttonType}`}
                                disabled={buttonType === 'lock' || isLoading}
                                onClick={() => handleStartLesson(lesson.index, lesson.dayNumber)}
                            >
                                {isLoading ? 'Loading...' : buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}