import React, { createContext, useContext, useState } from 'react';

const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
    const [currentLevel, setCurrentLevel] = useState('Beginner');

    // 완료된 레슨 정보 (점수 포함)
    const [completedLessons, setCompletedLessons] = useState({
        Beginner: {},
        Intermediate: {},
        Advanced: {}
    });

    // 기존 completedDays 호환성을 위한 계산된 값
    const completedDays = {
        Beginner: Object.keys(completedLessons.Beginner || {}).map(day => parseInt(day)),
        Intermediate: Object.keys(completedLessons.Intermediate || {}).map(day => parseInt(day)),
        Advanced: Object.keys(completedLessons.Advanced || {}).map(day => parseInt(day))
    };

    // 점수 기반으로 레슨 완료 처리 (70점 이상)
    const markLessonComplete = (level, dayNumber, score) => {
        console.log('=== markLessonComplete 호출 ===');
        console.log('Level:', level, 'Day:', dayNumber, 'Score:', score);

        if (score >= 70) { // 70점 이상일 때만 완료 처리
            setCompletedLessons(prev => {
                const updated = {
                    ...prev,
                    [level]: {
                        ...prev[level],
                        [dayNumber]: {
                            completed: true,
                            score: score,
                            completedAt: new Date().toISOString()
                        }
                    }
                };
                console.log('업데이트된 완료 레슨:', updated);
                return updated;
            });
            return true; // 완료 처리됨
        } else {
            console.log('점수가 70점 미만이므로 완료 처리하지 않음');
            return false; // 완료 처리되지 않음
        }
    };

    // 기존 함수 호환성 유지 (점수 없이 완료 처리)
    const markDayComplete = (level, dayNumber) => {
        setCompletedLessons(prev => ({
            ...prev,
            [level]: {
                ...prev[level],
                [dayNumber]: {
                    completed: true,
                    score: null,
                    completedAt: new Date().toISOString()
                }
            }
        }));
    };

    // 특정 레슨의 완료 정보 가져오기
    const getLessonInfo = (level, dayNumber) => {
        return completedLessons[level]?.[dayNumber] || null;
    };

    // 레슨이 완료되었는지 확인 (점수 조건 포함)
    const isLessonCompleted = (level, dayNumber) => {
        const lessonInfo = getLessonInfo(level, dayNumber);
        return lessonInfo?.completed === true && (lessonInfo?.score === null || lessonInfo?.score >= 70);
    };

    return (
        <LevelContext.Provider value={{
            currentLevel,
            setCurrentLevel,
            completedDays, // 기존 호환성
            completedLessons,
            markDayComplete, // 기존 호환성
            markLessonComplete, // 새로운 점수 기반 완료 함수
            getLessonInfo,
            isLessonCompleted
        }}>
            {children}
        </LevelContext.Provider>
    );
};

export const useLevel = () => {
    const context = useContext(LevelContext);
    if (!context) {
        throw new Error('useLevel must be used within a LevelProvider');
    }
    return context;
};