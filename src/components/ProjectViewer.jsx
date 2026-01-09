import { useState, useEffect } from 'react';
import { getYouTubeEmbedUrl, parseYouTubeUrl } from '../utils/urlParser';
import { getProjectByRecipeId, saveProject } from '../utils/storage';

export default function ProjectViewer({ recipe, onClose }) {
  const [project, setProject] = useState(null);
  const [counter, setCounter] = useState(0);
  const [formData, setFormData] = useState({
    status: 'wishlist',
    yarn_info: '',
    needle_size: '',
    progress_note: '',
    completed_photos: [],
  });
  const [completedPhotoUrl, setCompletedPhotoUrl] = useState('');

  useEffect(() => {
    if (recipe) {
      const existingProject = getProjectByRecipeId(recipe.id);
      if (existingProject) {
        setProject(existingProject);
        setCounter(existingProject.counter || 0);
        setFormData({
          status: existingProject.status,
          yarn_info: existingProject.yarn_info || '',
          needle_size: existingProject.needle_size || '',
          progress_note: existingProject.progress_note || '',
          completed_photos: existingProject.completed_photos || [],
        });
      } else {
        // 새 프로젝트 시작
        setProject({
          recipe_id: recipe.id,
          status: 'progress',
          yarn_info: '',
          needle_size: '',
          progress_note: '',
          completed_photos: [],
        });
        setFormData({
          status: 'progress',
          yarn_info: '',
          needle_size: '',
          progress_note: '',
          completed_photos: [],
        });
      }
    }
  }, [recipe]);

  const videoId = recipe?.source_url ? parseYouTubeUrl(recipe.source_url) : null;
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;

  const handleSave = () => {
    const updatedProject = {
      ...project,
      ...formData,
      counter,
      recipe_id: recipe.id,
    };
    saveProject(updatedProject);
    setProject(updatedProject);
    if (onClose) onClose();
  };

  const handleCounterIncrement = () => {
    setCounter(prev => prev + 1);
  };

  const handleCounterDecrement = () => {
    setCounter(prev => Math.max(0, prev - 1));
  };

  const handleAddCompletedPhoto = () => {
    if (completedPhotoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        completed_photos: [...prev.completed_photos, completedPhotoUrl.trim()],
      }));
      setCompletedPhotoUrl('');
    }
  };

  const handleRemoveCompletedPhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      completed_photos: prev.completed_photos.filter((_, i) => i !== index),
    }));
  };

  if (!recipe) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <h2 className="text-lg font-bold text-gray-800 truncate flex-1">
          {recipe.title}
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="wishlist">위시리스트</option>
            <option value="progress">진행중</option>
            <option value="completed">완성</option>
          </select>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-yarn-lavender text-white rounded-lg hover:bg-opacity-90 text-sm"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 영상 플레이어 (상단 고정) */}
        {embedUrl && (
          <div className="sticky top-14 bg-black z-10">
            <div className="aspect-video max-w-4xl mx-auto">
              <iframe
                src={embedUrl}
                title={recipe.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* 컨텐츠 영역 */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* 도안 이미지 */}
          {recipe.pattern_images && recipe.pattern_images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">도안</h3>
              <div className="grid grid-cols-1 gap-4">
                {recipe.pattern_images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`도안 ${index + 1}`}
                    className="w-full rounded-lg border shadow-sm"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 설명 */}
          {recipe.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">설명</h3>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700">
                {recipe.description}
              </div>
            </div>
          )}

          {/* 프로젝트 정보 입력 */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">나의 작업 기록</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용한 실 정보
              </label>
              <input
                type="text"
                value={formData.yarn_info}
                onChange={(e) => setFormData(prev => ({ ...prev, yarn_info: e.target.value }))}
                placeholder="예: 페트라 5호, 베이지 (색상번호: 123)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                바늘 사이즈
              </label>
              <input
                type="text"
                value={formData.needle_size}
                onChange={(e) => setFormData(prev => ({ ...prev, needle_size: e.target.value }))}
                placeholder="예: 모사용 5호 / 3.0mm"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                진행 메모
              </label>
              <textarea
                value={formData.progress_note}
                onChange={(e) => setFormData(prev => ({ ...prev, progress_note: e.target.value }))}
                placeholder="예: 팔은 2단 덜 떴음, 머리는 크게 만들었음"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
              />
            </div>

            {/* 완성작 사진 (완성 상태일 때만) */}
            {formData.status === 'completed' && (
              <div className="mt-6 border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  완성작 사진
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={completedPhotoUrl}
                    onChange={(e) => setCompletedPhotoUrl(e.target.value)}
                    placeholder="완성작 사진 URL 추가"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompletedPhoto}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    추가
                  </button>
                </div>
                {formData.completed_photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.completed_photos.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`완성작 ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCompletedPhoto(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 단수 카운터 (화면 가장자리) */}
      <div className="fixed bottom-6 right-6 z-20">
        <div className="bg-white rounded-full shadow-2xl border-4 border-yarn-lavender p-4 flex flex-col items-center min-w-[120px]">
          <div className="text-2xl font-bold text-gray-800 mb-2">{counter}</div>
          <div className="text-xs text-gray-500 mb-3">단수</div>
          <div className="flex gap-3">
            <button
              onClick={handleCounterDecrement}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold"
            >
              −
            </button>
            <button
              onClick={handleCounterIncrement}
              className="w-10 h-10 rounded-full bg-yarn-lavender text-white hover:bg-opacity-90 flex items-center justify-center text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
