import { useState } from 'react';
import { extractUrlInfo } from '../utils/urlParser';
import { saveRecipe } from '../utils/storage';

export default function UploadView({ onUploadComplete }) {
  const [formData, setFormData] = useState({
    title: '',
    thumbnail_url: '',
    source_url: '',
    video_url: '',
    pattern_images: [],
    description: '',
    additional_note: '',
    is_public: true,
  });
  
  const [isParsing, setIsParsing] = useState(false);
  const [patternImageUrl, setPatternImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recipe = {
        ...formData,
        author_id: 'me',
        source_url: formData.source_url || formData.video_url,
      };
      
      saveRecipe(recipe);
      
      // 폼 초기화
      setFormData({
        title: '',
        thumbnail_url: '',
        source_url: '',
        video_url: '',
        pattern_images: [],
        description: '',
        additional_note: '',
        is_public: true,
      });
      
      if (onUploadComplete) {
        onUploadComplete(recipe);
      }
      
      alert('업로드가 완료되었습니다!');
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">작품 업로드</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 작품 이미지 (대표 이미지) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작품 이미지 *
          </label>
          <input
            type="url"
            required
            value={formData.thumbnail_url}
            onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
            placeholder="작품 대표 이미지 URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
          />
          {formData.thumbnail_url && (
            <img
              src={formData.thumbnail_url}
              alt="작품 미리보기"
              className="mt-3 w-full max-w-md aspect-square object-cover rounded-lg border"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작품 제목 *
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

        {/* 영상 링크 또는 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            영상 링크 (유튜브 등)
          </label>
          <div className="space-y-2">
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
            />
            {formData.video_url && (
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, source_url: prev.video_url }));
                  handleUrlParse();
                }}
                disabled={isParsing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm"
              >
                {isParsing ? '파싱 중...' : '정보 자동 추출'}
              </button>
            )}
          </div>
        </div>

        {/* 원본 링크 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            원본 링크 (인스타/블로그 등)
          </label>
          <input
            type="url"
            value={formData.source_url}
            onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
            onBlur={handleUrlParse}
            placeholder="https://instagram.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
          />
        </div>

        {/* 도안 이미지 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            도안 이미지
          </label>
          <div className="flex gap-2 mb-3">
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
          {formData.pattern_images.length > 0 && (
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
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 도안 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            도안 설명 *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="도안 텍스트나 만드는 방법을 설명해주세요"
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
          />
        </div>

        {/* 추가 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추가 메모
          </label>
          <textarea
            value={formData.additional_note}
            onChange={(e) => setFormData(prev => ({ ...prev, additional_note: e.target.value }))}
            placeholder="추가로 전하고 싶은 말이나 팁을 적어주세요"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
          />
        </div>

        {/* 공개 설정 */}
        <div className="flex items-center pb-4">
          <input
            type="checkbox"
            id="is_public"
            checked={formData.is_public}
            onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
            className="w-4 h-4 text-yarn-lavender border-gray-300 rounded focus:ring-yarn-lavender"
          />
          <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
            탐색 페이지에 공개하기
          </label>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-yarn-lavender text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? '업로드 중...' : '업로드하기'}
        </button>
      </form>
    </div>
  );
}
