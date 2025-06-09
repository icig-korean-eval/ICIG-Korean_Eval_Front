import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DailyLearning from './DailyLearning';
import LessonDetail from './LessonDetail'; // LessonDetail import 추가
import { LevelProvider } from './LevelTabs';

export default function App() {
  return (
    <LevelProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/daily" element={<DailyLearning />} />
          <Route path="/lesson/:level/:day" element={<LessonDetail />} /> {/* 새로운 라우트 추가 */}
        </Routes>
      </Router>
    </LevelProvider>
  );
}