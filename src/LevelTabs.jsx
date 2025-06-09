import React, { createContext, useContext, useState } from 'react';

const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
    const [currentLevel, setCurrentLevel] = useState('Beginner'); // 대소문자 통일
    const [completedDays, setCompletedDays] = useState({
        Beginner: [],
        Intermediate: [],
        Advanced: []
    });

    const markDayComplete = (level, dayNumber) => {
        setCompletedDays(prev => {
            const prevDays = prev[level] || [];
            if (!prevDays.includes(dayNumber)) {
                return {
                    ...prev,
                    [level]: [...prevDays, dayNumber]
                };
            }
            return prev;
        });
    };

    return (
        <LevelContext.Provider value={{ currentLevel, setCurrentLevel, completedDays, markDayComplete }}>
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
