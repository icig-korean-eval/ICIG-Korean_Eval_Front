import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DailyLearning from './DailyLearning';
import { LevelProvider } from './LevelTabs'; // LevelProvider를 import하세요

export default function App() {
  return (
    <LevelProvider> {/* LevelProvider로 Routes 전체를 감쌈 */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/daily" element={<DailyLearning />} />
        </Routes>
      </Router>
    </LevelProvider>
  );
}
