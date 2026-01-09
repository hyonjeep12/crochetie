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
      className="relative bg-white rounded-lg overflow-hidden cursor-pointer mb-3 break-inside-avoid"
    >
      {/* 썸네일 */}
      <div className="relative overflow-hidden rounded-lg">
        {recipe.thumbnail_url ? (
          <img
            src={recipe.thumbnail_url}
            alt={recipe.title}
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7slYzslrTrrLjsp4A8L3RleHQ+PC9zdmc+';
            }}
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center text-gray-400 bg-gray-200">
            🧶
          </div>
        )}
        
        {/* 위시 버튼 - 우측 상단 */}
        <button
          onClick={handleWishClick}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all ${
            isWished || hasProject
              ? 'text-red-500'
              : 'text-gray-400'
          }`}
        >
          {isWished || hasProject ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}
