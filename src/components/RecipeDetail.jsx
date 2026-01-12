import { useState, useEffect, useRef } from 'react';
import { getProjectByRecipeId, saveProject } from '../utils/storage';

export default function RecipeDetail({ recipe, onClose, onStartKnitting }) {
  const [project, setProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPatternExpanded, setIsPatternExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (recipe) {
      const existingProject = getProjectByRecipeId(recipe.id);
      setProject(existingProject);
    }
  }, [recipe]);

  if (!recipe) return null;

  // 이미지 배열 구성 (썸네일 + 패턴 이미지)
  const allImages = [
    recipe.thumbnail_url,
    ...(recipe.pattern_images || [])
  ].filter(Boolean);

  // 스와이프 핸들러
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // 도안 텍스트를 단수별로 분리
  const patternRows = recipe.description 
    ? recipe.description.split('\n').filter(row => row.trim())
    : [];

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
      {/* 1. 상단 앱바 */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        {/* 뒤로가기 */}
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 오른쪽: 좋아요 + 3dot 메뉴 */}
        <div className="flex items-center gap-4">
          {/* 좋아요 */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isLiked ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF6B6B" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* 3dot 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg py-2 min-w-[120px] z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // 수정하기 기능 (추후 구현)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  수정하기
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // 삭제하기 기능 (추후 구현)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* 2. 메인 이미지 영역 */}
        {allImages.length > 0 && (
          <div className="relative w-full aspect-square bg-gray-100">
            <div
              className="w-full h-full overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {allImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${recipe.title} ${index + 1}`}
                    className="w-full h-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 페이지 점 인디케이터 */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-6 space-y-6">
          {/* 3. 작품 정보 영역 */}
          <div className="space-y-4">
            {/* 작품명 */}
            <h1 className="text-2xl font-bold text-gray-800">
              {recipe.title}
            </h1>

            {/* 작품 정보 텍스트 영역 */}
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {recipe.additional_note || '작품 정보가 없습니다'}
            </div>
          </div>

          {/* 4. 도안 미리보기 영역 */}
          {patternRows.length > 0 && (
            <div className="border-t pt-6">
              <button
                onClick={() => setIsPatternExpanded(!isPatternExpanded)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800">도안 미리보기</h3>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform ${isPatternExpanded ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* 단수별 도안 리스트 */}
              {isPatternExpanded && (
                <div className="mt-4 space-y-2">
                  {patternRows.map((row, index) => (
                    <div
                      key={index}
                      className="text-gray-700 py-2 border-b border-gray-100 last:border-0"
                    >
                      {row}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. 하단 CTA */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
        <button
          onClick={handleStartKnitting}
          className="w-full py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors"
        >
          뜨개 시작
        </button>
      </div>

      {/* 메뉴 외부 클릭 시 닫기 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
