import { useState, useEffect, useRef } from 'react';
import { getRecipes, getProjects, getProjectByRecipeId } from './utils/storage';
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
  const [uploadStep, setUploadStep] = useState(null); // null, 'step1', 'step2'
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
          onNext={() => {
            // Step 3로 이동 - 추후 구현
            console.log('Step 3로 이동');
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
          startTime: null, // 시간 기록용
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

  // 시간 기록 핸들러
  const handleRecordTime = (sectionIndex, rowIndex) => {
    const newSections = [...parsedSections];
    newSections[sectionIndex].rows[rowIndex].startTime = Math.floor(currentTime);
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
        <h1 className="text-lg font-bold text-gray-800">단별 시간 기록</h1>
      </div>

      {/* 영상 영역 (상단 고정, 화면 가로폭에 맞춤) */}
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
      <div className="flex-1 overflow-y-auto pb-24">

        {/* 파싱된 단 리스트 */}
        <div className="px-4 py-6 space-y-6">
          {parsedSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border rounded-lg overflow-hidden">
              {/* 섹션 헤더 */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">{section.name}</h3>
                {section.guide && (
                  <p className="text-sm text-gray-600 mt-1">{section.guide}</p>
                )}
              </div>

              {/* 단 리스트 */}
              <div className="divide-y">
                {section.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{row.number}R:</span>
                        <span className="text-gray-700">{row.content}</span>
                      </div>
                      {row.startTime !== null && (
                        <p className="text-xs text-primary mt-1">
                          시작 시간: {formatTime(row.startTime)}
                        </p>
                      )}
                    </div>
                    
                    {/* 시간 기록 버튼 (영상이 있을 때만) */}
                    {uploadData.type === 'video' && (
                      <button
                        onClick={() => handleRecordTime(sectionIndex, rowIndex)}
                        className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          row.startTime !== null
                            ? 'bg-green-100 text-green-700'
                            : 'bg-primary text-white hover:bg-opacity-90'
                        }`}
                      >
                        {row.startTime !== null ? '✓ 기록됨' : '시간 기록'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 하단 CTA */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-lg font-semibold text-base bg-primary text-white hover:bg-opacity-90 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default App;
