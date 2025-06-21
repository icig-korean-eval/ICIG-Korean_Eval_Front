# Frontend

## 1. Development Environment & Tech Stack

### 1.1 Development Environment

- **Development Tool**: Visual Studio Code  
- **Version Control**: Git  
- **Package Manager**: npm  
- **Development Server**: Create React App Development Server  

### 1.2 Tech Stack

- **Frontend Framework**: React 18.3.1  
- **Routing**: React Router DOM 6.27.0  
- **Language**: JavaScript (ES6+)  
- **Styling**: CSS3 (Modular CSS files)  
- **State Management**: React Context API  
- **Build Tool**: Create React App  

### 1.3 Component Structure

- **App.jsx**: Main application container  
- **HomePage.js**: Landing page and service introduction  
- **DailyLearning.jsx**: Manages learning list and progress  
- **LessonDetail.js**: Individual lesson learning interface  
- **LevelTabs.jsx**: Global state management context  

## 4. Key Development Outcomes

### 4.1 Core Features Implemented

### 4.1.1 User Interface (UI/UX)

- **Modern and Intuitive Design**: User-friendly interface  
- **Responsive Web Design**: Optimized for various devices  
- **Consistent Design System**: Unified color palette and typography  

### 4.1.2 Routing System

- **SPA (Single Page Application)**: Client-side routing using React Router  
- **Dynamic Routing**: Parameter-based routing like `/lesson/:level/:day`  
- **Navigation Control**: Smooth transitions and back navigation  

### 4.1.3 State Management System

- **Using React Context API**: Global state management  
- **Learning Progress Tracking**: Track completed lessons by level  
- **Real-time State Updates**: Synchronization across components  

### 4.1.4 Learning System

- **3-Level Curriculum**: Beginner, Intermediate, Advanced  
- **10-Day Curriculum per Level**: Total of 30 structured learning modules  
- **Sequential Learning System**: Unlock next lesson after completion  
- **Progress Visualization**: Display of completed and unlocked status  

### 4.2 Data Structure Design

### 4.2.1 Learning Content JSON Structure

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
### 4.2.2 Curriculum Structure

- **Beginner**: Basic greetings, daily conversations, fundamental grammar  
- **Intermediate**: Expressing opinions, constructing compound sentences, situational conversations  
- **Advanced**: Advanced expressions, idioms, discussions on abstract topics  

### 4.3 Implementation Details by Page

### 4.3.1 Home Page (HomePage.js)

**Implemented Features**:

- Service introduction and overview of main features  
- Provides menus for Context-aware Learning and Daily Learning  
- Navigation bar and logo section  
- Responsive layout applied  

**Key Outcomes**:

- Users can intuitively understand the service upon first visit  
- Clean and modern design enhances user experience  

### 4.3.2 Daily Learning Page (DailyLearning.jsx)

**Implemented Features**:

- Tab interface for selecting one of three levels  
- List of 10-day lesson cards for each level  
- Displays completion status and manages progress  
- Sequential lesson lock/unlock system  

**Key Outcomes**:

- Users can easily grasp their learning progress at a glance  
- Motivates learning through a structured learning path  

### 4.3.3 Lesson Page (LessonDetail.js)

**Implemented Features**:

- Conversational learning interface with an AI tutor  
- Korean sentence learning with example sentences  
- Pronunciation correction feedback UI  
- Voice input button field  

**Key Outcomes**:

- Realistic UI that feels like conversing with an AI tutor  
- Interactive interface enhances learner engagement  

## 5. Technical Implementation Details

### 5.1 React Component Design

### 5.1.1 Use of Functional Components

- All components are implemented as functional components following the latest React patterns  
- Actively used React Hooks such as `useState`, `useContext`, and `useNavigate`  
- Maximized component reusability and maintainability

### 5.1.2 Props and State Management

```jsx
// LevelContext를 통한 전역 상태 관리
const { currentLevel, setCurrentLevel, completedDays, markDayComplete } = useLevel();

// 지역 상태와 전역 상태의 적절한 분리
const [selectedLevel, setSelectedLevelState] = useState(currentLevel || 'Beginner');
```

### 5.2 Routing Implementation

### 5.2.1 React Router Configuration

```jsx
<Router>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/daily" element={<DailyLearning />} />
    <Route path="/lesson/:level/:day" element={<LessonPage />} />
  </Routes>
</Router>
```

### 5.2.2 Dynamic Routing

- Passed lesson data via URL parameters  
- Used `useParams` hook to extract route parameters  
- Enabled programmatic navigation using `useNavigate` hook  

### 5.3 Styling Implementation

### 5.3.1 CSS Modularization

- Managed independent CSS files per page  
- Applied naming conventions to avoid class name collisions  
- Designed reusable style components  

### 5.3.2 Responsive Design

- Used Flexbox layout for flexible UI  
- Applied media queries for device-specific optimization  
- Followed mobile-first design principles  

## 6. Performance Optimization and Code Quality

### 6.1 Performance Optimization

- **Component Memoization**: Prevented unnecessary re-rendering  
- **Efficient State Management**: Optimized data sharing via Context API  
- **Code Splitting**: Divided components by page to improve initial load time  

### 6.2 Code Quality Management

- **Consistent Coding Style**: Followed ESLint rules  
- **Structured Components**: Applied Single Responsibility Principle  
- **Commenting and Documentation**: Improved code readability  
