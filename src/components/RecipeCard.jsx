import { useState } from 'react';
import { getProjectByRecipeId, saveProject } from '../utils/storage';

export default function RecipeCard({ recipe, onView, onWish }) {
  const [isWished, setIsWished] = useState(false);

  const handleWishClick = (e) => {
    e.stopPropagation();
    const existingProject = getProjectByRecipeId(recipe.id);
    
    if (existingProject) {
      // 이미 프로젝트가 있으면 위시리스트 상태로 변경
      saveProject({ ...existingProject, status: 'wishlist' });
    } else {
      // 새 프로젝트 생성 (위시리스트 상태)
      saveProject({
        recipe_id: recipe.id,
        status: 'wishlist',
        yarn_info: '',
        needle_size: '',
        progress_note: '',
        completed_photos: [],
      });
    }
    
    setIsWished(true);
    if (onWish) onWish();
    
    // 시각적 피드백
    setTimeout(() => setIsWished(false), 300);
  };

  const existingProject = getProjectByRecipeId(recipe.id);
  const hasProject = !!existingProject;

  return (
    <div
      onClick={() => onView?.(recipe)}
      className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl group"
    >
      {/* 썸네일 */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        {recipe.thumbnail_url ? (
          <img
            src={recipe.thumbnail_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7slYzslrTrrLjsp4A8L3RleHQ+PC9zdmc+';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            🧶
          </div>
        )}
        
        {/* 상태 배지 */}
        {hasProject && (
          <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
            {existingProject.status === 'wishlist' && '💭 위시리스트'}
            {existingProject.status === 'progress' && '✨ 진행중'}
            {existingProject.status === 'completed' && '🎨 완성'}
          </div>
        )}
        
        {/* 위시 버튼 */}
        <button
          onClick={handleWishClick}
          className={`absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-all ${
            isWished || hasProject
              ? 'text-red-500 scale-110'
              : 'text-gray-400 hover:text-red-400 hover:scale-110'
          }`}
        >
          {isWished || hasProject ? '❤️' : '🤍'}
        </button>
      </div>
      
      {/* 정보 */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
          {recipe.title || '제목 없음'}
        </h3>
        {recipe.author_id && (
          <p className="text-xs text-gray-500">by {recipe.author_id}</p>
        )}
      </div>
    </div>
  );
}
