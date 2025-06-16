import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DailyLearning from './DailyLearning';
import LessonDetail from './LessonDetail'; // LessonDetail import 추가
import { LevelProvider } from './LevelTabs';
import MainChatRoomLayout from "./components/layout/MainChatRoomLayout";
import ChatLayout from "./components/ChatLayout";

export default function App() {
  return (
    <LevelProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/daily" element={<DailyLearning />} />
          <Route path="/lesson/:level/:day" element={<LessonDetail />} /> {/* 새로운 라우트 추가 */}
            <Route path='/context' element={<MainChatRoomLayout />}></Route>
          <Route path='/context/:chatId' element={<ChatLayout />}></Route>
        </Routes>
      </Router>
    </LevelProvider>
  );
}