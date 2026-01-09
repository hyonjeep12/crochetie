import { useState } from 'react';
import RecipeCard from './RecipeCard';

export default function MyPageView({ recipes, projects, onView }) {
  const [activeSection, setActiveSection] = useState('progress');

  // 상태별 프로젝트 필터링
  const getProjectsByStatus = (status) => {
    return projects
      .filter(p => p.status === status)
      .map(project => {
        const recipe = recipes.find(r => r.id === project.recipe_id);
        return { project, recipe };
      })
      .filter(item => item.recipe);
  };

  const wishlistItems = getProjectsByStatus('wishlist');
  const progressItems = getProjectsByStatus('progress');
  const completedItems = getProjectsByStatus('completed');

  const sections = [
    { id: 'progress', label: '진행중', count: progressItems.length, icon: '✨' },
    { id: 'completed', label: '완성작', count: completedItems.length, icon: '🎨' },
    { id: 'wishlist', label: '위시리스트', count: wishlistItems.length, icon: '💭' },
  ];

  const getCurrentItems = () => {
    switch (activeSection) {
      case 'wishlist':
        return wishlistItems;
      case 'progress':
        return progressItems;
      case 'completed':
        return completedItems;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();

  return (
    <div className="pb-20">
      {/* 프로필 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-screen-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yarn-pink to-yarn-lavender flex items-center justify-center text-4xl">
              👤
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">나의 아카이브</h2>
              <p className="text-sm text-gray-500 mt-1">
                총 {recipes.length}개의 레시피
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 섹션 탭 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-screen-lg mx-auto px-4">
          <div className="flex gap-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-yarn-lavender text-yarn-lavender font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{section.icon}</span>
                  <span className="text-sm">{section.label}</span>
                  {section.count > 0 && (
                    <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full ml-1">
                      {section.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {currentItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {activeSection === 'progress' && '🧵'}
              {activeSection === 'completed' && '🎁'}
              {activeSection === 'wishlist' && '🔖'}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeSection === 'progress' && '진행중인 프로젝트가 없습니다'}
              {activeSection === 'completed' && '완성작이 없습니다'}
              {activeSection === 'wishlist' && '위시리스트가 비어있습니다'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeSection === 'wishlist' && '탐색 페이지에서 마음에 드는 레시피를 저장해보세요'}
              {(activeSection === 'progress' || activeSection === 'completed') && '새로운 프로젝트를 시작해보세요'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentItems.map(({ recipe, project }) => (
              <div key={project.id} className="relative">
                <RecipeCard
                  recipe={recipe}
                  onView={onView}
                />
                {/* 진행률 표시 */}
                {project.status === 'progress' && project.progress_note && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                    <div className="truncate">{project.progress_note}</div>
                  </div>
                )}
                {project.status === 'completed' && project.completed_photos?.length > 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    완성 ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
