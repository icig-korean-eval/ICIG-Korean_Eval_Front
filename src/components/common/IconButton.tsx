import React from 'react';

interface IconButtonProps {
  icon: string;
  alt: string;
  onClick?: () => void;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 재사용 가능한 아이콘 버튼 컴포넌트
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  alt,
  onClick,
  width = 30,
  height = 30,
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`icon-button ${className}`}
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        ...style
      }}
    >
      <img src={icon} alt={alt} width={width} height={height} />
    </div>
  );
};

export default IconButton;
