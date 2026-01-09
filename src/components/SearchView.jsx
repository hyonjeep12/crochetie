import { useState } from 'react';
import RecipeCard from './RecipeCard';
import { dummyRecipes } from '../utils/dummyData';
import { getRecipes } from '../utils/storage';

export default function SearchView({ onView, onWish }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 모든 공개 레시피 가져오기 (더미 + 실제)
  const allRecipes = [...dummyRecipes, ...getRecipes().filter(r => r.is_public)];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      // 검색 로직: 제목, 설명, 작성자로 검색
      const results = allRecipes.filter(recipe => {
        const lowerQuery = query.toLowerCase();
        return (
          recipe.title?.toLowerCase().includes(lowerQuery) ||
          recipe.description?.toLowerCase().includes(lowerQuery) ||
          recipe.author_id?.toLowerCase().includes(lowerQuery)
        );
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <div className="pb-20">
      {/* 검색 헤더 */}
      <div className="sticky top-0 bg-white border-b z-20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="검색"
              className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yarn-lavender focus:bg-white transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 검색 결과 또는 추천 콘텐츠 */}
      {isSearching ? (
        <div className="px-4 py-6">
          {searchResults.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                "{searchQuery}"에 대한 검색 결과 {searchResults.length}개
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {searchResults.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onView={onView}
                    onWish={onWish}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 mb-2">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-400">
                다른 키워드로 검색해보세요
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-6">
          {/* 인기 검색어 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">인기 검색어</h3>
            <div className="flex flex-wrap gap-2">
              {['곰돌이', '키링', '브로치', '인형', '가방'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* 최근 검색 (localStorage에서 가져올 수 있음) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">추천 콘텐츠</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allRecipes.slice(0, 9).map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={onView}
                  onWish={onWish}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
