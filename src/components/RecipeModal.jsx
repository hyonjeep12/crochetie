import { useState, useEffect } from 'react';
import { extractUrlInfo } from '../utils/urlParser';
import { saveRecipe } from '../utils/storage';

export default function RecipeModal({ recipe, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    thumbnail_url: '',
    source_url: '',
    pattern_images: [],
    description: '',
    is_public: false,
    author_id: 'me', // 초기에는 디자이너님 ID
  });
  
  const [isParsing, setIsParsing] = useState(false);
  const [patternImageUrl, setPatternImageUrl] = useState('');

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        thumbnail_url: recipe.thumbnail_url || '',
        source_url: recipe.source_url || '',
        pattern_images: recipe.pattern_images || [],
        description: recipe.description || '',
        is_public: recipe.is_public ?? false,
        author_id: recipe.author_id || 'me',
      });
    }
  }, [recipe]);

  const handleUrlParse = async () => {
    if (!formData.source_url) return;
    
    setIsParsing(true);
    try {
      const info = await extractUrlInfo(formData.source_url);
      setFormData(prev => ({
        ...prev,
        thumbnail_url: info.thumbnail_url || prev.thumbnail_url,
        title: prev.title || info.title || prev.title,
      }));
    } catch (error) {
      console.error('URL 파싱 실패:', error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddPatternImage = () => {
    if (patternImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        pattern_images: [...prev.pattern_images, patternImageUrl.trim()],
      }));
      setPatternImageUrl('');
    }
  };

  const handleRemovePatternImage = (index) => {
    setFormData(prev => ({
      ...prev,
      pattern_images: prev.pattern_images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const savedRecipe = saveRecipe({
      ...recipe,
      ...formData,
    });
    if (onSave) onSave(savedRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {recipe ? '레시피 편집' : '새 레시피 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 소스 URL (자동 파싱) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              원본 링크 (유튜브/인스타/블로그)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                onBlur={handleUrlParse}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleUrlParse}
                disabled={isParsing || !formData.source_url}
                className="px-4 py-2 bg-yarn-lavender text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                {isParsing ? '⏳' : '🔍'}
              </button>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              소품 이름 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="예: 곰돌이 키링"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
            />
          </div>

          {/* 썸네일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표 이미지 URL
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
              placeholder="이미지 URL 또는 자동 생성됨"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
            />
            {formData.thumbnail_url && (
              <img
                src={formData.thumbnail_url}
                alt="썸네일 미리보기"
                className="mt-2 w-32 h-32 object-cover rounded-lg border"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

          {/* 도안 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도안 이미지
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={patternImageUrl}
                onChange={(e) => setPatternImageUrl(e.target.value)}
                placeholder="도안 이미지 URL 추가"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddPatternImage}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                추가
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {formData.pattern_images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`도안 ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePatternImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (줄글 도안 또는 메모)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="도안 텍스트나 메모를 입력하세요"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
            />
          </div>

          {/* 공개 여부 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="w-4 h-4 text-yarn-lavender border-gray-300 rounded focus:ring-yarn-lavender"
            />
            <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
              탐색 페이지에 공개
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yarn-lavender text-white rounded-lg hover:bg-opacity-90"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
