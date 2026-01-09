import { useState, useEffect } from 'react';
import { getProjectByRecipeId, saveProject } from '../utils/storage';

export default function RecipeDetail({ recipe, onClose, onStartKnitting }) {
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (recipe) {
      const existingProject = getProjectByRecipeId(recipe.id);
      setProject(existingProject);
    }
  }, [recipe]);

  if (!recipe) return null;

  const handleStartKnitting = () => {
    // 프로젝트가 없으면 생성
    let currentProject = project;
    if (!currentProject) {
      currentProject = saveProject({
        recipe_id: recipe.id,
        status: 'progress',
        yarn_info: '',
        needle_size: '',
        technique: '',
        progress_note: '',
        completed_photos: [],
        completed_rows: [],
      });
      setProject(currentProject);
    }
    if (onStartKnitting) {
      onStartKnitting(recipe, currentProject);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-xl"
        >
          ←
        </button>
        <h2 className="text-lg font-bold text-gray-800 flex-1 text-center">
          {recipe.title}
        </h2>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* 작품 이미지 */}
        {recipe.thumbnail_url && (
          <div className="w-full aspect-square bg-gray-100">
            <img
              src={recipe.thumbnail_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* 재료 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">재료 정보</h3>
            
            {project?.yarn_info && (
              <div>
                <span className="text-sm font-medium text-gray-600">실:</span>
                <p className="text-gray-800 mt-1">{project.yarn_info}</p>
              </div>
            )}
            
            {project?.needle_size && (
              <div>
                <span className="text-sm font-medium text-gray-600">바늘:</span>
                <p className="text-gray-800 mt-1">{project.needle_size}</p>
              </div>
            )}
            
            {project?.technique && (
              <div>
                <span className="text-sm font-medium text-gray-600">기법:</span>
                <p className="text-gray-800 mt-1">{project.technique}</p>
              </div>
            )}

            {!project?.yarn_info && !project?.needle_size && !project?.technique && (
              <p className="text-gray-500 text-sm">뜨기 모드에서 재료 정보를 입력할 수 있습니다</p>
            )}
          </div>

          {/* 도안 요약 */}
          {recipe.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">도안 요약</h3>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{recipe.description}</p>
              </div>
            </div>
          )}

          {/* 도안 이미지 */}
          {recipe.pattern_images && recipe.pattern_images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">도안 이미지</h3>
              <div className="space-y-3">
                {recipe.pattern_images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`도안 ${index + 1}`}
                    className="w-full rounded-lg border shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
        <button
          onClick={handleStartKnitting}
          className="w-full py-4 bg-yarn-lavender text-white rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors"
        >
          🧶 뜨개 시작
        </button>
      </div>
    </div>
  );
}
