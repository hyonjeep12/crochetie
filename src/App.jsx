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
  
  const categories = ['Trending', 'Toy', 'Seasonal', 'Baby & Kids', 'Cloth'];

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Crochetie</h1>
          
          {/* 카테고리 네비게이션 */}
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative pb-2 whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === category
                    ? 'text-orange'
                    : 'text-gray-600'
                }`}
              >
                {category}
                {selectedCategory === category && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Pinterest 스타일 그리드 */}
      <div className="max-w-screen-lg mx-auto px-4 py-4">
        <div className="columns-2 gap-3">
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
