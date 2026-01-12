export default function RecipeCard({ recipe, onView }) {
  // 비디오 여부 확인 (source_url에 youtube가 포함되어 있으면 비디오)
  const isVideo = recipe.source_url && recipe.source_url.includes('youtube');

  return (
    <div
      onClick={() => onView?.(recipe)}
      className="relative cursor-pointer w-full"
      style={{ 
        aspectRatio: '136 / 138',
        position: 'relative'
      }}
    >
      {/* 썸네일 */}
      <div className="relative w-full h-full overflow-hidden">
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
          <div 
            className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200"
          >
            🧶
          </div>
        )}
        
        {/* Badge - 비디오 아이콘만 표시 */}
        {isVideo && (
          <div 
            className="absolute top-2 left-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
            style={{ width: '24px', height: '24px' }}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7z" fill="white"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
