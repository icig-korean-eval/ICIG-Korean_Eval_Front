import React from 'react';
import IconButton from '../common/IconButton';
// @ts-ignore
import logoIcon from '../../assets/icons/clarity_talk-bubbles-outline-badged.svg';
// @ts-ignore
import arrowIcon from '../../assets/icons/clarity_arrow-line.svg';

/**
 * 헤더 컴포넌트
 * 뒤로가기 버튼, 로고, 타이틀을 포함합니다
 */
const Header: React.FC = () => {
  // 뒤로가기 처리 함수
  const handleBack = () => {
    // 실제 구현에서는 라우팅 처리나 히스토리 이동 등을 구현
    console.log('뒤로가기 클릭');
  };
  
  return (
    <header className="learning-interface-header">
      {/* 화살표 버튼 (나가기) */}
      <div className="arrow-button">
        <IconButton 
          icon={arrowIcon} 
          alt="뒤로가기" 
          onClick={handleBack}
          width={25}
          height={25}
          className="inline-block transform scale-x-[-1]"
        />
      </div>
      
      {/* 로고 */}
      <div className="logo-icon">
        <img src={logoIcon} alt="로고" width="50" height="50" />
      </div>
      
      {/* 타이틀 */}
      <div className="title">
        <span>Context-aware learning</span>
      </div>
    </header>
  );
};

export default Header;
