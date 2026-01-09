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
      {/* 헤더 */}
      {activeTab === 'home' && (
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-screen-lg mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800">🧶 나만의 뜨개 아카이브</h1>
          </div>
        </header>
      )}

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
  return (
    <div className="pb-20">
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">작품 탐색</h2>
          <p className="text-gray-600 text-sm">업로드된 모든 작품 및 도안을 탐색하세요</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={onView}
              onWish={onWish}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
