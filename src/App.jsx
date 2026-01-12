import { useState, useEffect } from 'react';
import { getRecipes, getProjects, getProjectByRecipeId } from './utils/storage';
import { dummyRecipes } from './utils/dummyData';
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
        {activeTab === 'upload' && (
          <UploadView onUploadComplete={handleUploadComplete} />
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
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
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

export default App;
