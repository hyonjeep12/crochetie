// YouTube URL 파싱 유틸리티
export const parseYouTubeUrl = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

export const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const getYouTubeEmbedUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

// 일반 URL에서 썸네일 추출 시도
export const extractUrlInfo = async (url) => {
  const info = {
    source_url: url,
    thumbnail_url: null,
    title: null,
  };
  
  // YouTube 처리
  const videoId = parseYouTubeUrl(url);
  if (videoId) {
    info.thumbnail_url = getYouTubeThumbnail(videoId);
    // YouTube 제목은 클라이언트에서 직접 가져올 수 없으므로, 사용자가 입력하도록 함
    info.title = '';
    return info;
  }
  
  // 다른 URL 처리 (향후 확장 가능)
  return info;
};
