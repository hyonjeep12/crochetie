export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: '홈' },
    { id: 'upload', icon: '➕', label: '업로드' },
    { id: 'mystudio', icon: '🎨', label: '마이스튜디오' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                activeTab === tab.id
                  ? 'text-yarn-lavender'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
