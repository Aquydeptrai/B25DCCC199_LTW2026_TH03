import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const NoticeContext = createContext(null);

export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((text) => {
    setNotice({ text });
  }, []);

  useEffect(() => {
    if (notice === null) {
      return undefined;
    }
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <NoticeContext.Provider value={showNotice}>
      {notice !== null && (
        <div role="status" className="notice">
          {notice.text}
        </div>
      )}
      {children}
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const showNotice = useContext(NoticeContext);
  if (showNotice === null) {
    throw new Error('useNotice phải dùng bên trong NoticeProvider');
  }
  return showNotice;
}

export default NoticeContext;