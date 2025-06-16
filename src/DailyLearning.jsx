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

    // 레슨 상태 확인 함수 (기존 기능 유지)
    const getLessonStatus = (dayNumber) => {
        const lessonInfo = getLessonInfo(selectedLevel, dayNumber);
        const isCompleted = isLessonCompleted(selectedLevel, dayNumber);

        return {
            isCompleted,
            score: lessonInfo?.score || null,
            completedAt: lessonInfo?.completedAt || null
        };
    };

    // 잠금 해제 로직 (기존 기능 유지)
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

    // 레벨별 완료된 레슨 수 계산 (기존 기능 유지)
    const getCompletedCount = (level) => {
        const totalLessons = lessonData[level]?.length || 0;
        const completedCount = completedDays[level]?.length || 0;
        return { completed: completedCount, total: totalLessons };
    };

    return (
        <div className="daily-learning-modern">
            {/* Background Shapes */}
            <div className="bg-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>

            {/* Header */}
            <header className="modern-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <span>←</span>
                    </button>
                    <div className="page-title">
                        <h1>📖 Daily Learning</h1>
                        <p>Build your skills through steady daily learning!</p>
                    </div>
                </div>
                <div className="user-profile">
                    <span className="user-greeting">Welcome back! 👋</span>
                </div>
            </header>

            {/* Main Container */}
            <main className="main-container">
                {/* Level Section */}
                <section className="level-section">
                    <h2 className="section-title">Choose Your Level</h2>
                    <div className="level-tabs">
                        <button
                            className={`level-tab beginner ${selectedLevel === 'Beginner' ? 'active' : ''}`}
                            onClick={() => setSelectedLevel('Beginner')}
                        >
                            <div className="tab-icon">🐥</div>
                            <div className="tab-content">
                                <h3>Beginner Level</h3>
                                <p>Basic Conversation & Expression Expansion</p>
                                <div className="tab-progress">
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
                            className={`level-tab intermediate ${selectedLevel === 'Intermediate' ? 'active' : ''}`}
                            onClick={() => setSelectedLevel('Intermediate')}
                        >
                            <div className="tab-icon">🦤</div>
                            <div className="tab-content">
                                <h3>Intermediate Level</h3>
                                <p>Expressing Opinions & Complex Sentences</p>
                                <div className="tab-progress">
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
                            className={`level-tab advanced ${selectedLevel === 'Advanced' ? 'active' : ''}`}
                            onClick={() => setSelectedLevel('Advanced')}
                        >
                            <div className="tab-icon">🦜</div>
                            <div className="tab-content">
                                <h3>Advanced Level</h3>
                                <p>Natural Expressions & Complex Thoughts</p>
                                <div className="tab-progress">
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
                </section>

                {/* Lessons Section */}
                <section className="lessons-section">
                    <h2 className="section-title">
                        {selectedLevel} Level Lessons
                        <span className="total-progress-indicator">
                            {getCompletedCount(selectedLevel).completed} / {getCompletedCount(selectedLevel).total} completed
                        </span>
                    </h2>

                    <div className="lessons-grid">
                        {lessons.map((lesson) => {
                            const unlocked = isUnlocked(lesson.index);
                            const status = getLessonStatus(lesson.dayNumber);

                            let buttonText = 'Complete Previous Lesson';
                            let buttonType = 'lock';
                            let cardClass = 'lesson-card-modern';

                            if (unlocked) {
                                if (status.isCompleted) {
                                    buttonText = 'Review';
                                    buttonType = 'completed';
                                    cardClass = 'lesson-card-modern completed';
                                } else {
                                    buttonText = 'Get Started';
                                    buttonType = 'start';
                                }
                            } else {
                                cardClass = 'lesson-card-modern locked';
                            }

                            return (
                                <div key={lesson.index} className={cardClass}>
                                    <div className="lesson-header">
                                        <div className="lesson-day-badge">
                                            {lesson.day}
                                            {status.isCompleted && <span className="check-mark">✓</span>}
                                        </div>
                                        <div className="lesson-status">
                                            {status.isCompleted ? '완료' : unlocked ? '시작 가능' : '잠김'}
                                        </div>
                                    </div>

                                    <div className="lesson-content">
                                        <h3 className="lesson-topic">
                                            {lesson.topic}
                                            {status.isCompleted && <span className="completed-trophy">🏆</span>}
                                        </h3>
                                        <div className="lesson-expression">
                                            <strong>Key Expression:</strong> {lesson.expression}
                                        </div>
                                        <div className="lesson-example">
                                            <strong>Example:</strong> {lesson.example}
                                        </div>

                                        {status.isCompleted && (
                                            <div className="completion-info">
                                                <div className="completion-score">
                                                    <span className="score-label">Score:</span>
                                                    <span className="score-value">{status.score}점</span>
                                                </div>
                                                {status.completedAt && (
                                                    <div className="completion-date">
                                                        완료일: {new Date(status.completedAt).toLocaleDateString('ko-KR')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className={`lesson-action-btn ${buttonType === 'lock' ? 'disabled' : 'enabled'}`}
                                        disabled={buttonType === 'lock' || isLoading}
                                        onClick={() => handleStartLesson(lesson.index, lesson.dayNumber)}
                                    >
                                        {isLoading ? 'Loading...' : buttonText}
                                        <span className="btn-arrow">→</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}