import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Style/DailyLearning.css';
import { useLevel } from './LevelTabs';
import lessonData from './Data/Lesson.json';

export default function DailyLearning() {
    const navigate = useNavigate();
    const { completedDays, markDayComplete } = useLevel();

    const [selectedLevel, setSelectedLevel] = useState('Beginner');

    const levelLessons = lessonData[selectedLevel] || [];

    const lessons = levelLessons.map((lesson) => ({
        day: `Day ${lesson.Day}`,
        topic: lesson.Topic,
        expression: lesson.KeyExpression,
        example: lesson.ExampleSentence,
        index: lesson.Day - 1,
    }));

    const isUnlocked = (index) => {
        if (index === 0) return true;
        return completedDays[selectedLevel]?.includes(index);
    };

    const handleStartLesson = (index) => {
        if (index === 0 || isUnlocked(index)) {
            if (!completedDays[selectedLevel]?.includes(index + 1)) {
                markDayComplete(selectedLevel, index + 1);
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
                                disabled={statusType !== 'start'}
                                onClick={() => handleStartLesson(lesson.index)}
                            >
                                {status}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
