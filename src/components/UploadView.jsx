import { useState, useRef } from 'react';
import { parseYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/urlParser';
import { saveRecipe } from '../utils/storage';

export default function UploadView({ onUploadComplete }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [capturedPatterns, setCapturedPatterns] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const videoRef = useRef(null);

  const handleLoadVideo = () => {
    if (!youtubeUrl.trim()) return;
    
    const id = parseYouTubeUrl(youtubeUrl);
    if (id) {
      setVideoId(id);
      setVideoEmbedUrl(getYouTubeEmbedUrl(id));
      setThumbnailUrl(getYouTubeThumbnail(id));
      setIsVideoLoaded(true);
    } else {
      alert('유효한 유튜브 URL을 입력해주세요.');
    }
  };

  const handleCapture = () => {
    const newPattern = {
      id: Date.now(),
      rowNumber: '',
      pattern: '',
      note: '',
      isSaved: false,
    };
    setCapturedPatterns(prev => [...prev, newPattern]);
  };

  const handleSavePattern = (id) => {
    setCapturedPatterns(prev => 
      prev.map(p => 
        p.id === id ? { ...p, isSaved: true } : p
      )
    );
    
    // 영상 재생 - iframe을 다시 로드하여 재생
    if (videoId) {
      const newEmbedUrl = getYouTubeEmbedUrl(videoId) + '?autoplay=1';
      setVideoEmbedUrl(newEmbedUrl);
    }
  };

  const handleUpdatePattern = (id, field, value) => {
    setCapturedPatterns(prev =>
      prev.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleDeletePattern = (id) => {
    setCapturedPatterns(prev => prev.filter(p => p.id !== id));
  };

  const handleComplete = async () => {
    if (!title.trim()) {
      alert('작품 제목을 입력해주세요.');
      return;
    }

    if (capturedPatterns.length === 0) {
      alert('최소 하나의 도안을 등록해주세요.');
      return;
    }

    const unsavedPatterns = capturedPatterns.filter(p => !p.isSaved);
    if (unsavedPatterns.length > 0) {
      alert('저장되지 않은 도안이 있습니다. 모든 도안을 저장해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 도안 설명 생성 (Row 번호 순서대로 정렬)
      const sortedPatterns = [...capturedPatterns].sort((a, b) => {
        const aNum = parseInt(a.rowNumber) || 0;
        const bNum = parseInt(b.rowNumber) || 0;
        return aNum - bNum;
      });

      const description = sortedPatterns
        .map(p => {
          const rowPrefix = p.rowNumber ? `R${p.rowNumber} ` : '';
          return `${rowPrefix}${p.pattern}`;
        })
        .join('\n');

      const recipe = {
        title: title.trim(),
        thumbnail_url: thumbnailUrl,
        source_url: youtubeUrl,
        description: description,
        additional_note: additionalNote.trim(),
        pattern_images: [],
        is_public: isPublic,
        author_id: 'me',
      };

      saveRecipe(recipe);

      // 초기화
      setYoutubeUrl('');
      setVideoId(null);
      setVideoEmbedUrl('');
      setIsVideoLoaded(false);
      setCapturedPatterns([]);
      setTitle('');
      setThumbnailUrl('');
      setAdditionalNote('');
      setIsPublic(true);

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
    <div className="pb-20 max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">작품 업로드</h2>

      <div className="space-y-6">
        {/* 작품 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작품 제목 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 곰돌이 키링"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
          />
        </div>

        {/* 유튜브 영상 링크 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            유튜브 영상 링크 *
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleLoadVideo}
              disabled={!youtubeUrl.trim()}
              className="px-6 py-2 bg-yarn-lavender text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              불러오기
            </button>
          </div>
        </div>

        {/* 영상 표시 */}
        {isVideoLoaded && videoEmbedUrl && (
          <div className="space-y-4">
            <div ref={videoRef} className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={videoEmbedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            
            {/* 캡처 버튼 */}
            <button
              type="button"
              onClick={handleCapture}
              className="w-full px-6 py-3 bg-orange text-white rounded-lg hover:bg-opacity-90 font-medium"
            >
              📸 캡처
            </button>
          </div>
        )}

        {/* 캡처된 도안 카드들 */}
        {capturedPatterns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">캡처된 도안</h3>
            {capturedPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`border-2 rounded-lg p-4 ${
                  pattern.isSaved
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {pattern.isSaved ? '✓ 저장됨' : '저장 필요'}
                    </span>
                    {!pattern.isSaved && (
                      <button
                        type="button"
                        onClick={() => handleDeletePattern(pattern.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Row 번호
                    </label>
                    <input
                      type="text"
                      value={pattern.rowNumber}
                      onChange={(e) => handleUpdatePattern(pattern.id, 'rowNumber', e.target.value)}
                      placeholder="예: 1, 2, 3..."
                      disabled={pattern.isSaved}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      도안 *
                    </label>
                    <textarea
                      value={pattern.pattern}
                      onChange={(e) => handleUpdatePattern(pattern.id, 'pattern', e.target.value)}
                      placeholder="도안 내용을 입력하세요"
                      rows="3"
                      disabled={pattern.isSaved}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      메모
                    </label>
                    <textarea
                      value={pattern.note}
                      onChange={(e) => handleUpdatePattern(pattern.id, 'note', e.target.value)}
                      placeholder="추가 메모를 입력하세요"
                      rows="2"
                      disabled={pattern.isSaved}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {!pattern.isSaved && (
                    <button
                      type="button"
                      onClick={() => handleSavePattern(pattern.id)}
                      disabled={!pattern.pattern.trim()}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      저장
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 추가 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추가 메모
          </label>
          <textarea
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
            placeholder="추가로 전하고 싶은 말이나 팁을 적어주세요"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
          />
        </div>

        {/* 공개 설정 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-yarn-lavender border-gray-300 rounded focus:ring-yarn-lavender"
          />
          <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
            탐색 페이지에 공개하기
          </label>
        </div>

        {/* 완료 버튼 */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={isSubmitting || capturedPatterns.length === 0}
          className="w-full px-6 py-3 bg-yarn-lavender text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? '업로드 중...' : '완료'}
        </button>
      </div>
    </div>
  );
}
