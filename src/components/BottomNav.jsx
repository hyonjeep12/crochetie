export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', left: 50 },
    { id: 'upload', label: 'Upload', left: 170 },
    { id: 'mystudio', label: 'My Studio', left: 290 },
  ];

  const HomeIcon = ({ isActive }) => (
    <div style={{ width: '28px', height: '28px', position: 'relative' }}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 2.66666L4 12V26.6667C4 27.3739 4.28095 28.0522 4.78105 28.5523C5.28115 29.0524 5.95942 29.3333 6.66667 29.3333H12V18H20V29.3333H25.3333C26.0406 29.3333 26.7189 29.0524 27.219 28.5523C27.719 28.0522 28 27.3739 28 26.6667V12L16 2.66666Z"
          stroke={isActive ? '#6060E6' : '#313131'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ opacity: isActive ? 1 : 0.5 }}
        />
      </svg>
    </div>
  );

  const UploadIcon = ({ isActive }) => (
    <div style={{ width: '28px', height: '28px', position: 'relative' }}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 10.6667V21.3333M10.6667 16H21.3333M6.66667 4H25.3333C26.8061 4 28 5.19391 28 6.66667V25.3333C28 26.8061 26.8061 28 25.3333 28H6.66667C5.19391 28 4 26.8061 4 25.3333V6.66667C4 5.19391 5.19391 4 6.66667 4Z"
          stroke={isActive ? '#6060E6' : '#313131'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: isActive ? 1 : 0.5 }}
        />
      </svg>
    </div>
  );

  const MyStudioIcon = ({ isActive }) => (
    <div style={{ width: '28px', height: '28px', position: 'relative' }}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.333 19C23.0126 19 24.6238 19.6678 25.8115 20.8555C26.999 22.0431 27.6659 23.6536 27.666 25.333V28C27.666 28.5523 27.2183 29 26.666 29C26.114 28.9997 25.666 28.5521 25.666 28V25.333C25.6659 24.184 25.2098 23.0821 24.3975 22.2695C23.6356 21.5077 22.6188 21.058 21.5479 21.0049L21.333 21H10.666C9.51698 21.0002 8.41505 21.457 7.60254 22.2695C6.79006 23.0821 6.33309 24.1839 6.33301 25.333V28C6.33301 28.5523 5.88529 29 5.33301 29C4.78087 28.9998 4.33301 28.5522 4.33301 28V25.333C4.33309 23.6535 5.00092 22.0431 6.18848 20.8555C7.37605 19.6679 8.98654 19.0002 10.666 19H21.333ZM16 3C19.4975 3.00018 22.3328 5.83546 22.333 9.33301C22.333 12.8307 19.4977 15.6668 16 15.667C12.5023 15.6668 9.66602 12.8307 9.66602 9.33301C9.66619 5.83546 12.5025 3.00017 16 3ZM16 5C13.607 5.00017 11.6662 6.94003 11.666 9.33301C11.666 11.7261 13.6069 13.6668 16 13.667C18.3931 13.6668 20.333 11.7261 20.333 9.33301C20.3328 6.94003 18.393 5.00018 16 5Z"
          fill={isActive ? '#6060E6' : '#313131'}
          style={{ opacity: isActive ? 1 : 0.5 }}
        />
      </svg>
    </div>
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
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white z-50 safe-area-bottom"
      style={{ 
        height: '72px',
        borderTop: '1px solid #E0E0E0'
      }}
    >
      <div className="relative w-full h-full">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-start"
              style={{
                position: 'absolute',
                left: `${tab.left}px`,
                top: '13px',
                width: '72px',
                gap: '2px',
                opacity: isActive ? 1 : 0.5
              }}
            >
              <div>
                {renderIcon(tab.id, isActive)}
              </div>
              <span 
                className="text-center"
                style={{
                  fontSize: '13px',
                  lineHeight: '15.6px',
                  fontFamily: 'Pretendard Variable, Pretendard, sans-serif',
                  fontWeight: isActive ? '700' : '400',
                  color: isActive ? '#6060E6' : '#313131',
                  width: '100%'
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
