import { useState } from 'react';
import { getProjectByRecipeId } from '../utils/storage';
import RecipeCard from './RecipeCard';

export default function MyStudioView({ recipes, projects, onView, onStartKnitting }) {
  const [activeSection, setActiveSection] = useState('progress');

  // 진행중인 프로젝트 (status가 'progress')
  const progressProjects = projects
    .filter(p => p.status === 'progress')
    .map(project => {
      const recipe = recipes.find(r => r.id === project.recipe_id);
      return { project, recipe };
    })
    .filter(item => item.recipe);

  // 저장한 작품들 (status가 'wishlist' 또는 'completed')
  const savedProjects = projects
    .filter(p => p.status === 'wishlist' || p.status === 'completed')
    .map(project => {
      const recipe = recipes.find(r => r.id === project.recipe_id);
      return { project, recipe };
    })
    .filter(item => item.recipe);

  const sections = [
    { id: 'progress', label: '지금 뜨고 있어요', count: progressProjects.length, icon: '✨' },
    { id: 'saved', label: '저장한 작품', count: savedProjects.length, icon: '💾' },
  ];

  const getCurrentItems = () => {
    switch (activeSection) {
      case 'progress':
        return progressProjects;
      case 'saved':
        return savedProjects;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();

  const handleItemClick = (item) => {
    if (activeSection === 'progress') {
      // 진행중인 작품은 뜨기 모드로 바로 이동
      if (onStartKnitting) {
        onStartKnitting(item.recipe, item.project);
      }
    } else {
      // 저장한 작품은 상세 화면으로
      if (onView) {
        onView(item.recipe);
      }
    }
  };

  return (
    <div className="pb-20">
      {/* 프로필 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-screen-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yarn-pink to-yarn-lavender flex items-center justify-center text-4xl">
              🎨
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">마이 스튜디오</h2>
              <p className="text-sm text-gray-500 mt-1">
                내 뜨개 현황을 확인하세요
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
              {activeSection === 'saved' && '🔖'}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeSection === 'progress' && '진행중인 작품이 없습니다'}
              {activeSection === 'saved' && '저장한 작품이 없습니다'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeSection === 'progress' && '홈 화면에서 작품을 선택하고 뜨개를 시작해보세요'}
              {activeSection === 'saved' && '홈 화면에서 마음에 드는 작품을 저장해보세요'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentItems.map(({ recipe, project }) => (
              <div key={project.id} className="relative">
                <div onClick={() => handleItemClick({ recipe, project })}>
                  <RecipeCard
                    recipe={recipe}
                    onView={() => handleItemClick({ recipe, project })}
                  />
                </div>
                {/* 진행률 표시 */}
                {project.status === 'progress' && project.completed_rows && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span>진행중</span>
                      <span>
                        {project.completed_rows.length}단 완료
                      </span>
                    </div>
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
