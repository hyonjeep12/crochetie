import { useState, useRef, useEffect } from 'react';
import { parseYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/urlParser';
import { saveRecipe } from '../utils/storage';

export default function UploadView({ onUploadComplete }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [capturedPatterns, setCapturedPatterns] = useState([]);
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState(null);
  
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // YouTube IFrame API 로드 및 플레이어 초기화
  useEffect(() => {
    if (isVideoLoaded && videoId && videoRef.current && window.YT && window.YT.Player) {
      // 기존 플레이어가 있으면 제거
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log('기존 플레이어 제거 실패:', e);
        }
      }

      // 새 플레이어 생성
      const newPlayer = new window.YT.Player(videoRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
        },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
          },
        },
      });
      playerRef.current = newPlayer;

      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.log('플레이어 정리 실패:', e);
          }
        }
      };
    }
  }, [isVideoLoaded, videoId]);

  const handleLoadVideo = () => {
    if (!youtubeUrl.trim()) return;
    
    const id = parseYouTubeUrl(youtubeUrl);
    if (id) {
      setVideoId(id);
      setThumbnailUrl(getYouTubeThumbnail(id));
      setIsVideoLoaded(true);
    } else {
      alert('유효한 유튜브 URL을 입력해주세요.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThumbnailAtTime = (videoId, time) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const handleCapture = () => {
    if (!player) return;
    
    // 현재 재생 시간 가져오기
    const time = player.getCurrentTime();
    setCurrentTime(time);
    
    // 영상 일시정지
    player.pauseVideo();
    
    // 새 패턴 생성
    const newPattern = {
      id: Date.now(),
      rowNumber: '',
      pattern: '',
      note: '',
      captureTime: time,
      thumbnail: getThumbnailAtTime(videoId, time),
    };
    
    setCurrentPattern(newPattern);
    setBottomSheetOpen(true);
  };

  const handleSavePattern = () => {
    if (!currentPattern || !currentPattern.pattern.trim()) {
      alert('도안 내용을 입력해주세요.');
      return;
    }

    // 저장된 패턴에 추가
    const savedPattern = {
      ...currentPattern,
      isSaved: true,
    };
    
    setSavedPatterns(prev => [...prev, savedPattern]);
    
    // 바텀시트 닫기
    setBottomSheetOpen(false);
    setCurrentPattern(null);
    
    // 영상 재생 (멈춘 시간부터)
    if (player) {
      player.seekTo(currentTime, true);
      player.playVideo();
    }
  };

  const handleUpdateCurrentPattern = (field, value) => {
    if (currentPattern) {
      setCurrentPattern(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDeleteSavedPattern = (id) => {
    setSavedPatterns(prev => prev.filter(p => p.id !== id));
  };

  const handleComplete = async () => {
    if (!title.trim()) {
      alert('작품 제목을 입력해주세요.');
      return;
    }

    if (savedPatterns.length === 0) {
      alert('최소 하나의 도안을 등록해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 도안 설명 생성 (Row 번호 순서대로 정렬)
      const sortedPatterns = [...savedPatterns].sort((a, b) => {
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
      setSavedPatterns([]);
      setTitle('');
      setThumbnailUrl('');
      setAdditionalNote('');
      setIsPublic(true);
      setBottomSheetOpen(false);
      setCurrentPattern(null);
      if (player) {
        player.destroy();
        setPlayer(null);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

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
    <div className={`pb-20 max-w-4xl mx-auto px-4 py-6 ${bottomSheetOpen ? 'relative' : ''}`}>
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

        {/* 영상 표시 - 상단 고정 */}
        {isVideoLoaded && videoId && (
          <div className={`space-y-4 ${bottomSheetOpen ? 'sticky top-0 z-30 bg-white pb-4 shadow-md' : ''}`}>
            <div 
              ref={videoRef} 
              id="youtube-player"
              className="w-full aspect-video bg-black rounded-lg overflow-hidden"
            />
            
            {/* 기록 버튼 */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={!player}
              className="w-full px-6 py-3 bg-orange text-white rounded-lg hover:bg-opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              기록
            </button>
          </div>
        )}

        {/* 저장된 도안 카드 리스트 */}
        {savedPatterns.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">등록된 도안</h3>
            {savedPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className="flex gap-4 border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                {/* 좌측 썸네일 */}
                <div className="flex-shrink-0">
                  <img
                    src={pattern.thumbnail}
                    alt="캡처 썸네일"
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = thumbnailUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7slYzslrTrrLjsp4A8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                
                {/* 우측 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {pattern.rowNumber && (
                          <span className="text-sm font-semibold text-gray-800">
                            R{pattern.rowNumber}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(pattern.captureTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mb-1 line-clamp-2">
                        {pattern.pattern}
                      </p>
                      {pattern.note && (
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {pattern.note}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedPattern(pattern.id)}
                      className="text-red-500 hover:text-red-700 text-sm flex-shrink-0"
                    >
                      삭제
                    </button>
                  </div>
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
          disabled={isSubmitting || savedPatterns.length === 0}
          className="w-full px-6 py-3 bg-yarn-lavender text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? '업로드 중...' : '완료'}
        </button>
      </div>

      {/* 바텀시트 - 유튜브 스타일 */}
      {bottomSheetOpen && currentPattern && (
        <div className="fixed inset-0 z-40 flex flex-col pointer-events-none">
          {/* 바텀시트 - 영상 아래에서 시작 */}
          <div 
            className="flex-1 bg-white rounded-t-2xl shadow-2xl overflow-y-auto pointer-events-auto"
            style={{ 
              marginTop: 'auto',
              maxHeight: 'calc(100vh - 60vh)' // 영상 높이를 고려한 최대 높이
            }}
          >
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">도안 작성</h3>
              <button
                type="button"
                onClick={() => {
                  setBottomSheetOpen(false);
                  setCurrentPattern(null);
                  if (player) {
                    player.playVideo();
                  }
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* 캡처 시간 */}
              <div className="text-center text-sm text-gray-600">
                캡처 시간: {formatTime(currentPattern.captureTime)}
              </div>
              
              {/* Row 번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Row 번호
                </label>
                <input
                  type="text"
                  value={currentPattern.rowNumber}
                  onChange={(e) => handleUpdateCurrentPattern('rowNumber', e.target.value)}
                  placeholder="예: 1, 2, 3..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
                />
              </div>
              
              {/* 도안 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  도안 *
                </label>
                <textarea
                  value={currentPattern.pattern}
                  onChange={(e) => handleUpdateCurrentPattern('pattern', e.target.value)}
                  placeholder="도안 내용을 입력하세요"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
                />
              </div>
              
              {/* 메모 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모
                </label>
                <textarea
                  value={currentPattern.note}
                  onChange={(e) => handleUpdateCurrentPattern('note', e.target.value)}
                  placeholder="추가 메모를 입력하세요"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yarn-lavender focus:border-transparent"
                />
              </div>
              
              {/* 저장 버튼 */}
              <button
                type="button"
                onClick={handleSavePattern}
                disabled={!currentPattern.pattern.trim()}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                저장
              </button>
            </div>
            
            {/* 하단 고정 버튼 영역 */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  // 도안 필드에 줄바꿈 추가하여 내용 추가
                  if (currentPattern) {
                    const newPattern = currentPattern.pattern 
                      ? `${currentPattern.pattern}\n` 
                      : '';
                    handleUpdateCurrentPattern('pattern', newPattern);
                  }
                }}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                + 내용 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
