import React from 'react';
import Header from './Header';
import ChatContainer from '../chat/ChatContainer';
import MicButton from '../common/MicButton';
import FeedbackPanel from '../feedback/FeedbackPanel';
import {LearningProvider} from "../../context/LearningContext";
import { useParams } from 'react-router-dom';


type RouteParams = {
    chatId: string;
};


/**
 * 메인 레이아웃 컴포넌트
 * 애플리케이션의 전체 레이아웃 구조를 정의합니다
 */
const MainChatLayout: React.FC = () => {
    const { chatId } = useParams<RouteParams>();

    return (
    <LearningProvider>
        <div className="v1_248">
            <Header />
            <ChatContainer />
            <MicButton />
            <FeedbackPanel />
        </div>
    </LearningProvider>
  );
};

export default MainChatLayout;
