# 프론트

## 1. 개발 환경 및 기술 스택

### 1.1 개발 환경

- **개발 도구**: Visual Studio Code
- **버전 관리**: Git
- **패키지 관리자**: npm
- **개발 서버**: Create React App Development Server

### 1.2 기술 스택

- **Frontend Framework**: React 18.3.1
- **라우팅**: React Router DOM 6.27.0
- **언어**: JavaScript (ES6+)
- **스타일링**: CSS3 (모듈화된 CSS 파일)
- **상태 관리**: React Context API
- **빌드 도구**: Create React App

### 1.3 컴포넌트 구조

- **App.jsx**: 메인 애플리케이션 컨테이너
- **HomePage.js**: 랜딩 페이지 및 서비스 소개
- **DailyLearning.jsx**: 학습 목록 및 진행도 관리
- **LessonDetail.js**: 개별 레슨 학습 인터페이스
- **LevelTabs.jsx**: 전역 상태 관리 컨텍스트

## 2. 주요 개발 성과

### 2.1 구현된 핵심 기능

### 2.1.1 사용자 인터페이스 (UI/UX)

- **모던하고 직관적인 디자인**: 사용자 친화적인 인터페이스 설계
- **반응형 웹 디자인**: 다양한 디바이스에서 최적화된 화면 제공
- **일관성 있는 디자인 시스템**: 컬러 팔레트 및 타이포그래피 통일

### 2.1.2 라우팅 시스템

- **SPA (Single Page Application) 구조**: React Router를 활용한 클라이언트 사이드 라우팅
- **동적 라우팅**: `/lesson/:level/:day` 형태의 매개변수 기반 라우팅
- **네비게이션 관리**: 페이지 간 원활한 이동 및 뒤로가기 기능

### 2.1.3 상태 관리 시스템

- **React Context API 활용**: 전역 상태 관리 구현
- **학습 진행도 추적**: 레벨별 완료된 학습일 관리
- **실시간 상태 업데이트**: 컴포넌트 간 데이터 동기화

### 2.1.4 학습 시스템

- **3단계 레벨 구성**: Beginner, Intermediate, Advanced
- **각 레벨당 10일 커리큘럼**: 총 30개의 체계적인 학습 모듈
- **순차적 학습 시스템**: 이전 레슨 완료 후 다음 레슨 해제
- **진행도 시각화**: 완료 상태 및 잠금 해제 표시

### 2.2 데이터 구조 설계

### 2.2.1 학습 컨텐츠 JSON 구조

```json
{
  "Beginner": [
    {
      "Day": 1,
      "Topic": "Self-introduction + Hobbies",
      "KeyExpression": "저는 ~를 좋아해요",
      "ExampleSentence": "저는 음악 듣는 걸 좋아해요."
    }
  ]
}

```

### 2.2.2 커리큘럼 구성

- **초급 (Beginner)**: 기본 인사, 일상 대화, 기초 문법
- **중급 (Intermediate)**: 의견 표현, 복합 문장 구성, 상황별 대화
- **고급 (Advanced)**: 고급 표현, 관용구, 추상적 주제 토론

### 2.3 주요 페이지별 구현 내용

### 2.3.1 홈페이지 (HomePage.js)

**구현 기능**:

- 서비스 소개 및 주요 기능 안내
- Context-aware learning과 Daily Learning 메뉴 제공
- 네비게이션 바 및 로고 섹션
- 반응형 레이아웃 적용

**주요 성과**:

- 사용자 첫 방문 시 직관적인 서비스 이해 가능
- 깔끔하고 모던한 디자인으로 사용자 경험 향상

### 2.3.2 일일 학습 페이지 (DailyLearning.jsx)

**구현 기능**:

- 3단계 레벨 선택 탭 인터페이스
- 각 레벨별 10일차 학습 카드 목록
- 학습 완료 상태 표시 및 진행도 관리
- 순차적 레슨 잠금/해제 시스템

**주요 성과**:

- 사용자의 학습 진행 상황을 한눈에 파악 가능
- 체계적인 학습 경로 제시로 학습 동기 부여

### 4.3.3 레슨 페이지 (LessonDetail.js)

**구현 기능**:

- AI 튜터와의 대화형 학습 인터페이스
- 한국어 문장 학습 및 예문 제시
- 발음 교정 피드백 UI
- 음성 입력 버튼 필드

**주요 성과**:

- 실제 AI 튜터와 대화하는 듯한 자연스러운 UI 구현
- 학습자의 몰입도를 높이는 인터랙티브한 인터페이스

## 3. 기술적 구현 세부사항

### 3.1 React 컴포넌트 설계

### 3.1.1 함수형 컴포넌트 활용

- 모든 컴포넌트를 함수형으로 구현하여 최신 React 패턴 적용
- React Hooks (useState, useContext, useNavigate) 적극 활용
- 컴포넌트 재사용성 및 유지보수성 극대화

### 3.1.2 Props 및 상태 관리

```jsx
// LevelContext를 통한 전역 상태 관리
const { currentLevel, setCurrentLevel, completedDays, markDayComplete } = useLevel();

// 지역 상태와 전역 상태의 적절한 분리
const [selectedLevel, setSelectedLevelState] = useState(currentLevel || 'Beginner');
```

### 3.2 라우팅 구현

### 3.2.1 React Router 설정

```jsx
<Router>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/daily" element={<DailyLearning />} />
    <Route path="/lesson/:level/:day" element={<LessonPage />} />
  </Routes>
</Router>
```

### 3.2.2 동적 라우팅 활용

- URL 매개변수를 통한 레슨 정보 전달
- useParams Hook을 활용한 라우트 매개변수 추출
- useNavigate Hook을 통한 프로그래밍 방식 네비게이션

### 3.3 스타일링 구현

### 3.3.1 CSS 모듈화

- 페이지별 독립적인 CSS 파일 관리
- 클래스명 충돌 방지를 위한 명명 규칙 적용
- 재사용 가능한 스타일 컴포넌트 설계

### 3.3.2 반응형 디자인

- Flexbox 레이아웃을 활용한 유연한 UI 구성
- 미디어 쿼리를 통한 디바이스별 최적화
- 모바일 우선 설계 원칙 적용

## 4. 성능 최적화 및 코드 품질

### 4.1 성능 최적화

- **컴포넌트 메모이제이션**: 불필요한 리렌더링 방지
- **효율적인 상태 관리**: Context API를 통한 최적화된 상태 전달
- **코드 분할**: 페이지별 컴포넌트 분리로 초기 로딩 속도 개선

### 4.2 코드 품질 관리

- **일관된 코딩 스타일**: ESLint 규칙 준수
- **컴포넌트 구조화**: 단일 책임 원칙 적용
- **주석 및 문서화**: 코드 가독성 향상

## 5. Contribution

- 류시우
  - 상태관리 구현
  - router 설정
  - Daily Learning UI 구현
  - Daily Learning api 연동
- 김준철
  - Context-Aware Learning UI 구현
  - Context-Aware Learning api 연동
- 김민서
  - Context-Aware Learning UI 구현
