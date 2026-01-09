export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'HOME' },
    { id: 'upload', label: 'Upload' },
    { id: 'mystudio', label: 'My Studio' },
  ];

  const HomeIcon = ({ isActive }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={isActive ? 'text-orange' : 'text-gray-400'}
    >
      <path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const UploadIcon = ({ isActive }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={isActive ? 'text-orange' : 'text-gray-400'}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 8V16M8 12H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const MyStudioIcon = ({ isActive }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={isActive ? 'text-orange' : 'text-gray-400'}
    >
      <path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );

  const renderIcon = (tabId, isActive) => {
    switch (tabId) {
      case 'home':
        return <HomeIcon isActive={isActive} />;
      case 'upload':
        return <UploadIcon isActive={isActive} />;
      case 'mystudio':
        return <MyStudioIcon isActive={isActive} />;
      default:
        return null;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-orange'
                    : 'text-gray-400'
              }`}
            >
                <div className="mb-1">
                  {renderIcon(tab.id, isActive)}
                </div>
                <span className={`text-xs ${isActive ? 'font-bold' : 'font-normal'}`}>
                  {tab.label}
                </span>
            </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
