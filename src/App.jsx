import { useState, useEffect, useRef } from 'react';
import { getRecipes, getProjects, getProjectByRecipeId, saveRecipe } from './utils/storage';
import { dummyRecipes } from './utils/dummyData';
import { parseYouTubeUrl, getYouTubeEmbedUrl } from './utils/urlParser';
import BottomNav from './components/BottomNav';
import UploadView from './components/UploadView';
import MyStudioView from './components/MyStudioView';
import RecipeDetail from './components/RecipeDetail';
import KnittingMode from './components/KnittingMode';
import RecipeCard from './components/RecipeCard';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [recipes, setRecipes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [knittingMode, setKnittingMode] = useState(null); // { recipe, project }
  const [uploadBottomSheetOpen, setUploadBottomSheetOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(null); // null, 'step1', 'step2', 'step3'
  const [uploadData, setUploadData] = useState({ type: null, videoId: null, videoUrl: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(getRecipes());
    setProjects(getProjects());
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseViewer = () => {
    setSelectedRecipe(null);
    loadData(); // 데이터 새로고침
  };

  const handleUploadComplete = () => {
    loadData();
    setActiveTab('home'); // 업로드 완료 후 홈으로 이동
  };

  const handleStartKnitting = (recipe, project) => {
    setKnittingMode({ recipe, project });
  };

  const handleCloseKnittingMode = () => {
    setKnittingMode(null);
    loadData();
  };

  const handleWish = () => {
    loadData();
  };

  const handleUploadTabClick = () => {
    setUploadBottomSheetOpen(true);
  };

  const handleCloseUploadBottomSheet = () => {
    setUploadBottomSheetOpen(false);
    setUploadStep(null);
    setUploadData({ type: null, videoId: null, videoUrl: null });
  };

  const handleGoToStep1 = (type, videoId = null, videoUrl = null) => {
    setUploadData({ type, videoId, videoUrl });
    setUploadStep('step1');
    setUploadBottomSheetOpen(false);
  };

  const handleBackFromStep1 = () => {
    setUploadStep(null);
    setUploadData({ type: null, videoId: null, videoUrl: null });
    setUploadBottomSheetOpen(true);
  };

  // 뜨기 모드
  if (knittingMode) {
    return (
      <KnittingMode
        recipe={knittingMode.recipe}
        project={knittingMode.project}
        onClose={handleCloseKnittingMode}
      />
    );
  }

  // 상세보기 모드
  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onClose={handleCloseViewer}
        onStartKnitting={handleStartKnitting}
      />
    );
  }

  // 모든 공개 레시피 (더미 + 실제)
  const allPublicRecipes = [...dummyRecipes, ...recipes.filter(r => r.is_public)];

  return (
    <div className="min-h-screen bg-white">

      {/* 메인 콘텐츠 */}
      <main className="pb-20">
        {activeTab === 'home' && (
          <HomeView
            recipes={allPublicRecipes}
            onView={handleViewRecipe}
            onWish={handleWish}
          />
        )}
        {activeTab === 'mystudio' && (
          <MyStudioView
            key={`mystudio-${recipes.length}-${projects.length}`}
            recipes={recipes}
            projects={projects}
            onView={handleViewRecipe}
            onStartKnitting={handleStartKnitting}
          />
        )}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          if (tab === 'upload') {
            handleUploadTabClick();
          } else {
            setActiveTab(tab);
          }
        }} 
      />

      {/* 업로드 바텀시트 */}
      {uploadBottomSheetOpen && (
        <UploadBottomSheet 
          onClose={handleCloseUploadBottomSheet}
          onGoToStep1={handleGoToStep1}
        />
      )}

      {/* 업로드 Step 1 */}
      {uploadStep === 'step1' && (
        <UploadStep1
          uploadData={uploadData}
          onBack={handleBackFromStep1}
          onNext={(patternText) => {
            setUploadStep('step2');
            setUploadData(prev => ({ ...prev, patternText }));
          }}
        />
      )}

      {/* 업로드 Step 2 */}
      {uploadStep === 'step2' && (
        <UploadStep2
          uploadData={uploadData}
          onBack={() => {
            setUploadStep('step1');
          }}
          onNext={(parsedSections) => {
            // parsedSections를 uploadData에 저장
            setUploadData(prev => ({ ...prev, parsedSections }));
            setUploadStep('step3');
          }}
        />
      )}

      {/* 업로드 Step 3 */}
      {uploadStep === 'step3' && (
        <UploadStep3
          uploadData={uploadData}
          onBack={() => {
            setUploadStep('step2');
          }}
          onComplete={() => {
            // 업로드 완료 처리
            handleCloseUploadBottomSheet();
            handleUploadComplete();
          }}
        />
      )}
    </div>
  );
}

// 업로드 바텀시트
function UploadBottomSheet({ onClose, onGoToStep1 }) {
  const [step, setStep] = useState('select'); // 'select' or 'video'
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleVideoUpload = () => {
    setStep('video');
  };

  const handleImageUpload = () => {
    // 이미지로 올리기 - Step 1로 이동
    onGoToStep1('image');
  };

  const handleLoadVideo = () => {
    if (!youtubeUrl.trim()) return;
    
    // YouTube URL 파싱
    const videoId = parseYouTubeUrl(youtubeUrl);
    if (videoId) {
      // Step 1로 이동 (영상 정보와 함께)
      onGoToStep1('video', videoId, youtubeUrl);
    } else {
      alert('유효한 유튜브 URL을 입력해주세요.');
    }
  };

  const handleBack = () => {
    setStep('select');
    setYoutubeUrl('');
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 safe-area-bottom max-h-[90vh] overflow-y-auto">
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 내용 */}
        <div className="px-4 pb-6">
          {step === 'select' ? (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">업로드 방법 선택</h2>
              
              <div className="space-y-3">
                {/* 영상으로 올리기 */}
                <button
                  onClick={handleVideoUpload}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" fill="#6060E6"/>
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#6060E6" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">영상으로 올리기</p>
                      <p className="text-sm text-gray-500">YouTube 영상 URL을 입력하여 업로드</p>
                    </div>
                  </div>
                </button>

                {/* 이미지로 올리기 */}
                <button
                  onClick={handleImageUpload}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6060E6" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="#6060E6"/>
                        <path d="M21 15l-5-5L5 21" stroke="#6060E6" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">이미지로 올리기</p>
                      <p className="text-sm text-gray-500">도안 이미지를 직접 업로드</p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 뒤로가기 버튼 */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-800">영상으로 올리기</h2>
              </div>

              {/* 유튜브 URL 입력 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube 영상 URL
                  </label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800"
                  />
                </div>

                {/* 영상 불러오기 CTA */}
                <button
                  onClick={handleLoadVideo}
                  disabled={!youtubeUrl.trim()}
                  className={`w-full py-4 rounded-lg font-semibold text-base transition-colors ${
                    youtubeUrl.trim()
                      ? 'bg-primary text-white hover:bg-opacity-90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  영상 불러오기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// 홈 뷰
function HomeView({ recipes, onView, onWish }) {
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  
  const categories = ['Trending', 'Toy', 'Seasonal', 'Baby & Kids'];

  // 카테고리별 레시피 필터링 (현재는 모든 레시피 표시)
  const filteredRecipes = recipes;

  return (
    <div className="pb-[72px] min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-20">
        <div className="px-4 py-4">
          <h1 
            className="text-black font-bold mb-0"
            style={{ 
              fontSize: '28px', 
              lineHeight: '33.6px',
              fontFamily: 'Pretendard Variable, Pretendard, sans-serif',
              color: '#000000'
            }}
          >
            Crochetie
          </h1>
          
          {/* 카테고리 네비게이션 */}
          <div className="flex justify-start" style={{ marginTop: '16px', gap: '24px' }}>
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="relative whitespace-nowrap transition-colors"
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '19.2px',
                    fontFamily: 'Pretendard Variable, Pretendard, sans-serif',
                    color: isActive ? '#6060E6' : '#8A8A8A',
                    fontWeight: isActive ? '600' : '400'
                  }}
                >
                  {category}
                  {isActive && (
                    <span 
                      className="absolute"
                      style={{ 
                        bottom: '-8px',
                        left: '0',
                        width: '100%',
                        height: '2px',
                        backgroundColor: '#6060E6'
                      }}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 그리드 레이아웃 - 3열 고정 */}
      <div className="px-0 pt-4">
        <div 
          className="grid grid-cols-3"
          style={{ 
            gap: '2px',
            width: '100%'
          }}
        >
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={onView}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 업로드 Step 1
function UploadStep1({ uploadData, onBack, onNext }) {
  const [patternText, setPatternText] = useState('');

  const videoEmbedUrl = uploadData.videoId ? getYouTubeEmbedUrl(uploadData.videoId) : null;

  const handleNext = () => {
    if (patternText.trim()) {
      onNext(patternText);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 1. 상단 */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* 타이틀 */}
        <h1 className="text-lg font-bold text-gray-800">도안 만들기</h1>
      </div>

      {/* 2. 메인 영역 */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* 영상 영역 (영상으로 올리기일 경우) */}
        {uploadData.type === 'video' && videoEmbedUrl && (
          <div className="w-full aspect-video bg-gray-100">
            <iframe
              src={videoEmbedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* 도안 텍스트 입력 영역 */}
        <div className="px-4 py-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            도안 텍스트
          </label>
          <textarea
            value={patternText}
            onChange={(e) => setPatternText(e.target.value)}
            placeholder="도안 텍스트를 복사/붙여넣기 하세요..."
            className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800 resize-none"
            style={{ fontFamily: 'Pretendard Variable, Pretendard, sans-serif' }}
          />
        </div>
      </div>

      {/* 3. 하단 CTA */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
        <button
          onClick={handleNext}
          disabled={!patternText.trim()}
          className={`w-full py-4 rounded-lg font-semibold text-base transition-colors ${
            patternText.trim()
              ? 'bg-primary text-white hover:bg-opacity-90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}

// 업로드 Step 2
function UploadStep2({ uploadData, onBack, onNext }) {
  const [parsedSections, setParsedSections] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // { sectionIndex, rowIndex } - 이미지 업로드용
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // 도안 파싱
  useEffect(() => {
    if (uploadData.patternText) {
      const parsed = parsePattern(uploadData.patternText);
      setParsedSections(parsed);
    }
  }, [uploadData.patternText]);

  // YouTube 플레이어 초기화
  useEffect(() => {
    if (uploadData.type === 'video' && uploadData.videoId && window.YT && window.YT.Player) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log('기존 플레이어 제거 실패:', e);
        }
      }

      const newPlayer = new window.YT.Player(videoRef.current, {
        videoId: uploadData.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
        },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
            // 시간 업데이트 리스너
            const interval = setInterval(() => {
              if (event.target.getCurrentTime) {
                const time = event.target.getCurrentTime();
                setCurrentTime(time);
              }
            }, 100);
            return () => clearInterval(interval);
          },
        },
      });
      playerRef.current = newPlayer;

      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.log('플레이어 정리 실패:', e);
          }
        }
      };
    }
  }, [uploadData.videoId, uploadData.type]);

  // 도안 파싱 함수
  const parsePattern = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      
      // 섹션 감지: [그룹명] 가이드 문구
      const sectionMatch = trimmed.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (sectionMatch) {
        const sectionName = sectionMatch[1];
        const guideText = sectionMatch[2];
        
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          name: sectionName,
          guide: guideText,
          rows: [],
        };
        return;
      }

      // 단 감지: 숫자R: 도안 내용
      const rowMatch = trimmed.match(/^(\d+)R:\s*(.*)$/);
      if (rowMatch) {
        const rowNumber = parseInt(rowMatch[1]);
        const rowContent = rowMatch[2];
        
        if (!currentSection) {
          currentSection = {
            name: '전체',
            guide: '',
            rows: [],
          };
        }
        
        currentSection.rows.push({
          number: rowNumber,
          content: rowContent,
          startTime: uploadData.type === 'video' ? null : undefined, // 영상일 때만 시간 기록용
          guideMemo: '', // 가이드 텍스트 (이미지 업로드용)
        });
        return;
      }

      // 빈 줄이거나 섹션/단이 아닌 경우, 마지막 단의 내용에 추가
      if (trimmed && currentSection && currentSection.rows.length > 0) {
        const lastRow = currentSection.rows[currentSection.rows.length - 1];
        lastRow.content += ' ' + trimmed;
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  // 시간 기록 핸들러 (영상 업로드용)
  const handleRecordTime = (sectionIndex, rowIndex) => {
    const newSections = [...parsedSections];
    newSections[sectionIndex].rows[rowIndex].startTime = Math.floor(currentTime);
    setParsedSections(newSections);
  };

  // 카드 확장/축소
  const handleToggleRow = (sectionIndex, rowIndex) => {
    if (expandedRow && expandedRow.sectionIndex === sectionIndex && expandedRow.rowIndex === rowIndex) {
      setExpandedRow(null);
    } else {
      setExpandedRow({ sectionIndex, rowIndex });
    }
  };

  // 단 정보 수정 핸들러
  const handleUpdateRow = (sectionIndex, rowIndex, field, value) => {
    const newSections = [...parsedSections];
    if (field === 'number') {
      newSections[sectionIndex].rows[rowIndex].number = parseInt(value) || 1;
    } else if (field === 'content') {
      newSections[sectionIndex].rows[rowIndex].content = value;
    } else if (field === 'startTime') {
      // 시간 입력 (초 단위)
      const timeValue = value.trim();
      if (timeValue === '') {
        newSections[sectionIndex].rows[rowIndex].startTime = null;
      } else {
        // M:SS 형식 파싱
        const timeMatch = timeValue.match(/^(\d+):(\d{2})$/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1]);
          const seconds = parseInt(timeMatch[2]);
          newSections[sectionIndex].rows[rowIndex].startTime = minutes * 60 + seconds;
        } else {
          // 숫자만 입력된 경우 초로 간주
          const seconds = parseInt(timeValue);
          if (!isNaN(seconds)) {
            newSections[sectionIndex].rows[rowIndex].startTime = seconds;
          }
        }
      }
    } else if (field === 'guideMemo') {
      newSections[sectionIndex].rows[rowIndex].guideMemo = value;
    }
    setParsedSections(newSections);
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    if (seconds === null) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const videoEmbedUrl = uploadData.videoId ? getYouTubeEmbedUrl(uploadData.videoId) : null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 1. 상단 */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* 타이틀 */}
        <h1 className="text-lg font-bold text-gray-800">
          {uploadData.type === 'video' ? '단별 시간 기록' : '도안 편집'}
        </h1>
      </div>

      {/* 영상 영역 (상단 고정, 영상으로 올리기일 경우만) */}
      {uploadData.type === 'video' && videoEmbedUrl && (
        <div className="w-full bg-gray-100 relative" style={{ aspectRatio: '16/9' }}>
          <div ref={videoRef} className="w-full h-full" />
          {/* 현재 시간 표시 */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-sm z-10">
            {formatTime(currentTime)}
          </div>
        </div>
      )}

      {/* 2. 메인 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* 파싱된 단 리스트 */}
        <div className="px-4 py-6 space-y-6">
          {parsedSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              {/* 섹션 헤더 (읽기 전용) */}
              <div className="px-0 py-2">
                <h3 className="font-semibold text-gray-800 break-words">{section.name}</h3>
                {section.guide && (
                  <p className="text-sm text-gray-600 mt-1 break-words">{section.guide}</p>
                )}
              </div>

              {/* 단 리스트 */}
              <div className="space-y-2">
                {section.rows.map((row, rowIndex) => {
                  const isExpanded = expandedRow?.sectionIndex === sectionIndex && expandedRow?.rowIndex === rowIndex;
                  
                  return (
                    <div key={rowIndex} className="border-b border-gray-200 pb-3 last:border-b-0">
                      {/* 단 카드 헤더 */}
                      <div className="px-0 py-3 flex items-center gap-2 min-w-0">
                        {/* 접기 버튼 (왼쪽) */}
                        <button
                          onClick={() => handleToggleRow(sectionIndex, rowIndex)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>

                        {/* 카드 내용 (클릭 가능) */}
                        <button
                          onClick={() => handleToggleRow(sectionIndex, rowIndex)}
                          className="flex-1 flex items-center text-left hover:bg-gray-50 transition-colors -mx-4 px-4 py-0 min-w-0"
                        >
                          <div className="flex-1 min-w-0">
                            {/* 단 이름과 도안 정보 (한 줄) */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-medium text-gray-800 flex-shrink-0">{row.number}R:</span>
                              <span className="text-gray-700 text-sm truncate">{row.content}</span>
                            </div>
                            
                            {/* 가이드 텍스트 표시 (있을 때만, 모든 타입) */}
                            {row.guideMemo && (
                              <p className="text-xs text-gray-500 mt-1 italic break-words">
                                💡 {row.guideMemo}
                              </p>
                            )}
                          </div>
                        </button>
                        
                        {/* 시간 표시 + 시간 기록 버튼 (오른쪽, 영상 업로드일 때만) */}
                        {uploadData.type === 'video' && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* 시간 표시 */}
                            <div className="text-xs">
                              {row.startTime !== null ? (
                                <span className="text-primary">
                                  {formatTime(row.startTime)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-:--</span>
                              )}
                            </div>
                            
                            {/* 시간 기록 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecordTime(sectionIndex, rowIndex);
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                row.startTime !== null
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-primary text-white hover:bg-opacity-90'
                              }`}
                            >
                              {row.startTime !== null ? '✓' : '기록'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 확장된 수정 영역 */}
                      {isExpanded && (
                        <div className="px-0 pb-4 pt-4 space-y-4 bg-gray-50 rounded-lg mt-2 mx-0">
                          {/* 단 번호와 시작 시간 (2컬럼 레이아웃, 영상 업로드일 때만) */}
                          {uploadData.type === 'video' && (
                            <div className="grid grid-cols-2 gap-4">
                              {/* 단 번호 수정 */}
                              <div className="min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  단 번호
                                </label>
                                <input
                                  type="number"
                                  value={row.number}
                                  onChange={(e) => handleUpdateRow(sectionIndex, rowIndex, 'number', e.target.value)}
                                  min="1"
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800 text-sm"
                                />
                              </div>

                              {/* 시작 시간 수정 */}
                              <div className="min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  시작 시간
                                </label>
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="text"
                                    value={row.startTime !== null ? formatTime(row.startTime) : ''}
                                    onChange={(e) => handleUpdateRow(sectionIndex, rowIndex, 'startTime', e.target.value)}
                                    placeholder="M:SS"
                                    className="flex-1 min-w-0 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800 text-sm"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRecordTime(sectionIndex, rowIndex);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                                      row.startTime !== null
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-primary text-white hover:bg-opacity-90'
                                    }`}
                                  >
                                    현재
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 이미지 업로드: 단 이름 수정 */}
                          {uploadData.type === 'image' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                단 이름
                              </label>
                              <input
                                type="number"
                                value={row.number}
                                onChange={(e) => handleUpdateRow(sectionIndex, rowIndex, 'number', e.target.value)}
                                min="1"
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800 text-sm"
                              />
                            </div>
                          )}

                          {/* 도안 내용 수정 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              도안 내용
                            </label>
                            <textarea
                              value={row.content}
                              onChange={(e) => handleUpdateRow(sectionIndex, rowIndex, 'content', e.target.value)}
                              placeholder="도안 내용을 입력하세요"
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800 text-sm resize-none"
                              rows="3"
                            />
                          </div>

                          {/* 가이드 메모 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              가이드 메모 (옵션)
                            </label>
                            <textarea
                              value={row.guideMemo || ''}
                              onChange={(e) => handleUpdateRow(sectionIndex, rowIndex, 'guideMemo', e.target.value)}
                              placeholder="이 단에 대한 참고 메모를 입력하세요"
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800 text-sm resize-none"
                              rows="2"
                            />
                          </div>

                          {/* 닫기 컨트롤 */}
                          <div className="pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleToggleRow(sectionIndex, rowIndex)}
                              className="w-full flex items-center justify-center gap-1 text-gray-600 hover:text-gray-800 transition-colors py-2"
                            >
                              <span className="text-sm">접기</span>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-gray-600"
                              >
                                <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* 다음 버튼 (리스트 맨 아래, 영상 업로드일 때만) */}
          {uploadData.type === 'video' && (
            <div className="px-4 py-6">
              <button
                onClick={() => onNext(parsedSections)}
                disabled={!parsedSections.every(section => 
                  section.rows.every(row => row.startTime !== null)
                )}
                className={`w-full py-4 rounded-lg font-semibold text-base transition-colors ${
                  parsedSections.every(section => 
                    section.rows.every(row => row.startTime !== null)
                  )
                    ? 'bg-primary text-white hover:bg-opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                단별 시간 기록 완료
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. 하단 CTA (이미지 업로드일 때만) */}
      {uploadData.type === 'image' && (
        <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
          <button
            onClick={() => onNext(parsedSections)}
            className="w-full py-4 rounded-lg font-semibold text-base bg-primary text-white hover:bg-opacity-90 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

// 업로드 Step 3: 작품 기본 설명 입력
function UploadStep3({ uploadData, onBack, onComplete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (!title.trim()) {
      alert('작품 이름을 입력해주세요.');
      return;
    }

    // 레시피 데이터 생성
    const recipeData = {
      title: title.trim(),
      description: uploadData.patternText || '', // Step 1에서 입력한 도안 텍스트
      additional_note: description.trim(), // Step 3에서 입력한 설명
      thumbnail_url: imagePreview || '', // 대표 이미지 (base64)
      source_url: uploadData.videoUrl || '', // YouTube URL (있는 경우)
      pattern_images: imagePreview ? [imagePreview] : [], // 패턴 이미지 배열
      is_public: true, // 홈화면에 표시
      // Step 2에서 파싱한 섹션 데이터 저장 (뜨개 모드에서 사용)
      parsedSections: uploadData.parsedSections || [],
    };

    // 레시피 저장
    saveRecipe(recipeData);
    
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 상단 */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 z-10">
        <div className="flex items-center gap-3 mb-2">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 타이틀 */}
          <h1 className="text-lg font-bold text-gray-800">도안 만들기</h1>
        </div>
        
        {/* 단계 안내 */}
        <p className="text-sm text-gray-600 ml-11">Step 3 작품 기본 설명</p>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 py-6 space-y-6">
          {/* 대표 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표 이미지
            </label>
            <button
              onClick={handleImageClick}
              className="w-full aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex items-center justify-center overflow-hidden"
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="대표 이미지" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm">이미지 업로드</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="작품 이름을 입력하세요"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800"
            />
          </div>

          {/* 도안 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도안 설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="도안에 대한 설명을 입력하세요"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-gray-800 resize-none"
              rows="6"
            />
          </div>
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
        <button
          onClick={handleComplete}
          className="w-full py-4 rounded-lg font-semibold text-base bg-primary text-white hover:bg-opacity-90 transition-colors"
        >
          도안 업로드
        </button>
      </div>
    </div>
  );
}

export default App;
