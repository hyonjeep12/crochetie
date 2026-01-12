import { useState, useEffect } from 'react';
import { saveProject } from '../utils/storage';

export default function KnittingMode({ recipe, project, onClose }) {
  const [mode, setMode] = useState('list'); // 'list' or 'gallery'
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); // 선택된 단
  const [completedRows, setCompletedRows] = useState(new Set(project?.completed_rows || []));
  const [expandedSections, setExpandedSections] = useState(new Set([0]));
  const [showSectionInfo, setShowSectionInfo] = useState(new Set());

  // 도안 설명을 줄 단위로 분리 및 섹션 추출
  const parsePattern = () => {
    if (!recipe?.description) return { sections: [], rows: [] };
    
    const lines = recipe.description.split('\n').filter(line => line.trim());
    const sections = [];
    const rows = [];
    let currentSection = { name: '전체', rows: [] };
    
    lines.forEach((line, index) => {
      // 섹션 헤더 감지 (예: "Head:", "Body:", "Leg:")
      const sectionMatch = line.match(/^([가-힣A-Za-z]+)\s*[:：]/);
      if (sectionMatch) {
        if (currentSection.rows.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { name: sectionMatch[1], rows: [] };
      } else {
        // 단 정보 추출 (예: "R1", "1단:", "R7" 등)
        const rowMatch = line.match(/(?:R|Row|단)\s*(\d+)/i) || line.match(/^(\d+)단/);
        const rowNumber = rowMatch ? parseInt(rowMatch[1]) : index + 1;
        const rowData = {
          index: rows.length,
          number: rowNumber,
          text: line,
          section: currentSection.name,
        };
        currentSection.rows.push(rowData);
        rows.push(rowData);
      }
    });
    
    if (currentSection.rows.length > 0) {
      sections.push(currentSection);
    }
    
    // 섹션이 없으면 전체를 하나의 섹션으로
    if (sections.length === 0) {
      sections.push({ name: '전체', rows: rows.map((_, i) => ({ index: i, number: i + 1, text: rows[i].text, section: '전체' })) });
    }
    
    return { sections, rows };
  };

  const { sections, rows: parsedRows } = parsePattern();
  const rows = parsedRows.length > 0 ? parsedRows.map(r => r.text) : (recipe?.description ? recipe.description.split('\n').filter(line => line.trim()) : []);

  useEffect(() => {
    // 갤러리 모드일 때 스크롤 방지 및 화면 방향 변경
    if (mode === 'gallery') {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      // 화면 방향을 가로 모드로 변경
      const lockOrientation = async () => {
        try {
          // Screen Orientation API 사용
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
          } else if (screen.lockOrientation) {
            // 구형 브라우저 지원
            screen.lockOrientation('landscape');
          } else if (screen.mozLockOrientation) {
            // Firefox 지원
            screen.mozLockOrientation('landscape');
          } else if (screen.msLockOrientation) {
            // IE/Edge 지원
            screen.msLockOrientation('landscape');
          }
        } catch (err) {
          // 화면 방향 잠금이 실패해도 계속 진행 (일부 브라우저/디바이스에서 제한될 수 있음)
          console.log('화면 방향 잠금 실패:', err);
        }
      };
      
      lockOrientation();
      
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        
        // 화면 방향 잠금 해제
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          } else if (screen.unlockOrientation) {
            screen.unlockOrientation();
          } else if (screen.mozUnlockOrientation) {
            screen.mozUnlockOrientation();
          } else if (screen.msUnlockOrientation) {
            screen.msUnlockOrientation();
          }
        } catch (err) {
          console.log('화면 방향 잠금 해제 실패:', err);
        }
      };
    }
  }, [mode]);

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const toggleRowComplete = (index) => {
    const newCompleted = new Set(completedRows);
    
    // 현재 클릭한 단이 이미 완료된 상태인지 확인
    const isCurrentlyCompleted = newCompleted.has(index);
    
    // 가장 마지막 완료된 단의 인덱스 찾기
    const completedIndices = Array.from(newCompleted).sort((a, b) => a - b);
    const lastCompletedIndex = completedIndices.length > 0 
      ? Math.max(...completedIndices) 
      : -1;
    
    if (isCurrentlyCompleted) {
      // 완료된 단을 클릭한 경우: 해당 단부터 마지막 단까지 모두 미완료 처리
      for (let i = index; i < rows.length; i++) {
        newCompleted.delete(i);
      }
    } else {
      // 미완료 단을 클릭한 경우: 1단부터 해당 단까지 모두 완료 처리
      // 단, 이미 완료된 단보다 이전 단은 건너뛰고 그 이후부터 완료 처리
      const startIndex = lastCompletedIndex + 1;
      for (let i = startIndex; i <= index; i++) {
        newCompleted.add(i);
      }
    }
    
    setCompletedRows(newCompleted);
    
    // 프로젝트 저장
    if (project) {
      saveProject({
        ...project,
        completed_rows: Array.from(newCompleted),
      });
    }
  };

  const progress = rows.length > 0 ? (completedRows.size / rows.length) * 100 : 0;

  // 현재 진행 중인 단 찾기 (완료되지 않은 첫 번째 단)
  const getCurrentRowIndex = () => {
    const completedIndices = Array.from(completedRows).sort((a, b) => a - b);
    if (completedIndices.length === 0) return 0;
    const lastCompleted = Math.max(...completedIndices);
    return lastCompleted + 1 < rows.length ? lastCompleted + 1 : lastCompleted;
  };

  const currentActiveRowIndex = getCurrentRowIndex();

  // 현재 단의 섹션과 단 번호 찾기
  const getCurrentRowInfo = () => {
    const currentRow = parsedRows[currentActiveRowIndex];
    if (!currentRow) return { section: '전체', rowNumber: 1 };
    
    const section = sections.find(s => s.rows.some(r => r.index === currentActiveRowIndex));
    return {
      section: section?.name || '전체',
      rowNumber: currentRow.number || currentActiveRowIndex + 1
    };
  };

  const currentRowInfo = getCurrentRowInfo();

  // 선택된 단의 정보 가져오기
  const getSelectedRowInfo = () => {
    const targetIndex = selectedRowIndex !== null ? selectedRowIndex : currentActiveRowIndex;
    const targetRow = parsedRows[targetIndex];
    if (!targetRow) return { section: '전체', rowNumber: 1 };
    
    const section = sections.find(s => s.rows.some(r => r.index === targetIndex));
    return {
      section: section?.name || '전체',
      rowNumber: targetRow.number || targetIndex + 1
    };
  };

  const selectedRowInfo = getSelectedRowInfo();
  const displayRowIndex = selectedRowIndex !== null ? selectedRowIndex : currentActiveRowIndex;
  const isSelectedRowCompleted = completedRows.has(displayRowIndex);

  const toggleSection = (sectionIndex) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex);
    } else {
      newExpanded.add(sectionIndex);
    }
    setExpandedSections(newExpanded);
  };

  const toggleSectionInfo = (sectionIndex) => {
    const newShow = new Set(showSectionInfo);
    if (newShow.has(sectionIndex)) {
      newShow.delete(sectionIndex);
    } else {
      newShow.add(sectionIndex);
    }
    setShowSectionInfo(newShow);
  };

  const handleSelectRow = (index) => {
    setSelectedRowIndex(index);
  };

  const handleCompleteRow = () => {
    toggleRowComplete(displayRowIndex);
    // 완료 후 선택 해제 (선택 사항)
    if (selectedRowIndex !== null) {
      setSelectedRowIndex(null);
    }
  };

  // 목록 형식
  if (mode === 'list') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* 1. 상단 바 */}
        <div className="sticky top-0 bg-white z-10">
          {/* 진행 바 (얇은) */}
          <div className="w-full h-1 bg-gray-200">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* 앱바 */}
          <div className="border-b px-4 py-3 flex items-center justify-between relative">
            {/* 뒤로가기 */}
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* 작품명 - 가운데 정렬 */}
            <h2 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-800 text-center">
              {recipe?.title}
            </h2>
            
            {/* 갤러리 모드 버튼 */}
            <button
              onClick={() => setMode('gallery')}
              className="text-gray-600 hover:text-gray-800 text-sm ml-auto"
            >
              갤러리 모드
            </button>
          </div>
        </div>

        {/* 2. 도안 섹션 */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="px-4 py-4 space-y-4">
            {sections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(sectionIndex);
              const isInfoShown = showSectionInfo.has(sectionIndex);

              return (
                <div key={sectionIndex} className="border rounded-lg overflow-hidden bg-white">
                  {/* 섹션 헤더 */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <span className="font-semibold text-gray-800">{section.name}</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      {/* 정보 아이콘 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionInfo(sectionIndex);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 섹션 정보 (정보 아이콘 클릭 시 표시) */}
                  {isInfoShown && (
                    <div className="px-4 pb-3 border-t bg-gray-50">
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        이 그룹을 진행할 때 참고할 수 있는 정보입니다. 예를 들어 특별한 기법이나 주의사항이 있을 수 있습니다.
                      </p>
                    </div>
                  )}

                  {/* 3. 단 리스트 */}
                  {isExpanded && (
                    <div className="border-t">
                      {section.rows.map((rowData) => {
                        const index = rowData.index;
                        const isExpanded = expandedRows.has(index);
                        const isCompleted = completedRows.has(index);
                        const isCurrent = index === currentActiveRowIndex; // 현재 진행 중인 단
                        const isSelected = selectedRowIndex === index; // 선택된 단
                        const rowNumber = rowData.number || index + 1;

                        return (
                          <div
                            key={index}
                            className={`border-b last:border-0 ${
                              isCurrent
                                ? 'bg-primary/10 border-l-4 border-l-primary'
                                : isCompleted
                                ? 'border-l-[3px] border-l-primary'
                                : 'bg-white'
                            }`}
                          >
                            {/* 단 헤더 */}
                            <div className="w-full px-4 py-3 flex items-center justify-between">
                              {/* 단 카드 전체 영역 - 선택만 */}
                              <button
                                onClick={() => handleSelectRow(index)}
                                className="flex items-center gap-3 flex-1 text-left"
                              >
                                {/* 상태 표시 아이콘 영역 */}
                                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                  {/* 현재 진행 중인 단 - 가장 강하게 강조 */}
                                  {isCurrent && (
                                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                  )}
                                  
                                  {/* 선택된 단 - 보라색 원 안에 화살표 (현재 진행 단이 아닐 때) */}
                                  {isSelected && !isCurrent && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  )}
                                  
                                  {/* 완료된 단은 아이콘 없음 - 왼쪽 보라색 3px 라인만 표시 */}
                                </div>
                                
                                {/* 단 제목: "단수 · 도안 요약" 형식 */}
                                <span className={`flex-1 truncate ${
                                  isCurrent
                                    ? 'text-primary font-bold text-base'
                                    : isSelected
                                    ? 'text-primary font-semibold text-sm'
                                    : isCompleted
                                    ? 'text-gray-400 text-sm'
                                    : 'text-gray-800 text-sm'
                                }`}>
                                  <span className="font-medium">{rowNumber}단</span>
                                  <span className="mx-1.5 text-gray-400">·</span>
                                  <span className={isCompleted ? 'text-gray-400' : ''}>
                                    {rowData.text.length > 40 ? rowData.text.substring(0, 40) + '...' : rowData.text}
                                  </span>
                                </span>
                              </button>
                              
                              {/* 쉐브론 아이콘 - 펼침/닫힘 전용 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(index);
                                }}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                >
                                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>

                            {/* 4. 상세 설명 (펼쳐진 상태) - 제목 없이 보조 정보만 */}
                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-3 bg-gray-50">
                                {/* 가이드 텍스트 */}
                                <div className="pt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-xs text-blue-800 leading-relaxed">
                                    💡 가이드: 이 단을 진행할 때 주의할 점이나 팁이 여기에 표시됩니다.
                                  </p>
                                </div>

                                {/* 영상/이미지 버튼 */}
                                <div className="flex items-center gap-3">
                                  {recipe?.source_url && (
                                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" fill="currentColor"/>
                                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                                      </svg>
                                      <span className="text-xs text-gray-700">영상 보기</span>
                                    </button>
                                  )}
                                  {recipe?.pattern_images && recipe.pattern_images[index] && (
                                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                      </svg>
                                      <span className="text-xs text-gray-700">이미지 보기</span>
                                    </button>
                                  )}
                                </div>

                                {/* 추가 설명 (필요한 경우) */}
                                {rowData.text.length > 50 && (
                                  <div className="pt-1">
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                      {rowData.text}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. 하단 고정 영역 */}
        <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
          <div className="flex items-center justify-between gap-4">
            {/* 선택된 단 정보 (또는 현재 진행 단) */}
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                {selectedRowIndex !== null ? '선택한 단' : '지금 뜨는 단'}
              </p>
              <p className="text-base font-semibold text-gray-800">
                {selectedRowInfo.section} {selectedRowInfo.rowNumber}단
              </p>
            </div>
            
            {/* CTA 버튼 */}
            <button
              onClick={handleCompleteRow}
              className={`px-6 py-3 rounded-lg font-semibold text-base transition-colors ${
                isSelectedRowCompleted
                  ? 'bg-gray-300 text-gray-600'
                  : 'bg-primary text-white hover:bg-opacity-90'
              }`}
            >
              {isSelectedRowCompleted ? '이 단부터 다시 뜨기' : '이 단 완료'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 갤러리 형식
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col landscape:flex-row">
      {/* 드로워 메뉴 */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r z-30 transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Pattern</h3>
            <button
              onClick={() => setDrawerOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          <div className="p-2">
            {sections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(sectionIndex);
              
              return (
                <div key={sectionIndex} className="mb-2">
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedSections);
                      if (newExpanded.has(sectionIndex)) {
                        newExpanded.delete(sectionIndex);
                      } else {
                        newExpanded.add(sectionIndex);
                      }
                      setExpandedSections(newExpanded);
                    }}
                    className="w-full text-left px-3 py-2 font-medium text-gray-800 hover:bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <span>{section.name}</span>
                    <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-2 space-y-0.5">
                      {section.rows.map((rowData) => {
                        const index = rowData.index;
                        const isActive = currentRowIndex === index;
                        const isCompleted = completedRows.has(index);
                        const rowNumber = rowData.number || index + 1;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentRowIndex(index);
                              setDrawerOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 ${
                              isActive
                                ? 'bg-white text-black font-medium'
                                : isCompleted
                                ? 'text-gray-600 hover:bg-gray-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`w-4 h-4 flex items-center justify-center ${
                              isCompleted ? 'text-green-500' : 'text-gray-300'
                            }`}>
                              {isCompleted ? '✓' : ''}
                            </span>
                            <span>
                              R{rowNumber} {rowData.text.includes('줄이기') && '줄이기'}
                              {rowData.text.includes('늘리기') && '늘리기'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 - 플로팅 버튼들만 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="text-white hover:text-gray-200 text-xl bg-black/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center pointer-events-auto"
          >
            ☰
          </button>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setMode('list')}
              className="text-white hover:text-gray-200 text-sm bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
              목록
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl bg-black/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* 자막 영역 - 상단 고정 */}
        <div className="absolute top-16 left-0 right-0 px-4 z-10 pointer-events-none">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* 도안 설명 박스 */}
            <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg">
              <p className="text-sm font-mono leading-relaxed">
                {rows[currentRowIndex] || ''}
              </p>
            </div>
            {/* 메모 박스 */}
            {recipe?.additional_note && (
              <div className="bg-yellow-400 text-black px-4 py-3 rounded-lg">
                <p className="text-sm leading-relaxed">{recipe.additional_note}</p>
              </div>
            )}
          </div>
        </div>

        {/* 스와이프 영역 */}
        <div
          className="flex-1 overflow-hidden relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="absolute inset-0 flex transition-transform duration-300"
            style={{
              transform: `translateX(-${currentRowIndex * 100}%)`,
            }}
          >
            {rows.map((row, index) => (
              <div
                key={index}
                className="min-w-full h-full flex items-center justify-center overflow-hidden bg-gray-900"
                style={{ touchAction: 'pan-x' }}
              >
                {/* 배경 이미지 - 뜨개질 손 이미지 */}
                <div className="absolute inset-0">
                  <img
                    src="/crochet-hands-bg.jpg"
                    alt="뜨개질 배경"
                    className="w-full h-full object-cover"
                    style={{ 
                      objectFit: 'cover',
                      opacity: 0.3
                    }}
                    onError={(e) => {
                      // 이미지가 없으면 그라데이션 배경으로 대체
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        parent.className = 'absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900';
                      }
                    }}
                  />
                </div>
                
                {/* 도안 이미지/비디오 오버레이 */}
                <div className="absolute inset-0 z-0">
                  {recipe?.pattern_images && recipe.pattern_images[index] ? (
                    <img
                      src={recipe.pattern_images[index]}
                      alt={`${index + 1}단 도안`}
                      className="w-full h-full object-cover opacity-50"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : recipe?.source_url && index === 0 ? (
                    <div className="w-full h-full">
                      <iframe
                        src={recipe.source_url.includes('youtube.com') || recipe.source_url.includes('youtu.be')
                          ? `https://www.youtube.com/embed/${recipe.source_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]}?autoplay=1&mute=1&loop=1&playlist=${recipe.source_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]}`
                          : recipe.source_url}
                        title={recipe.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* 스와이프 네비게이션 */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {rows.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentRowIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentRowIndex === index
                    ? 'bg-yarn-lavender w-8'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* 좌우 화살표 */}
          {currentRowIndex > 0 && (
            <button
              onClick={() => setCurrentRowIndex(currentRowIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white shadow-lg hover:bg-gray-800/80 transition-colors z-10 pointer-events-auto"
            >
              ←
            </button>
          )}
          {currentRowIndex < rows.length - 1 && (
            <button
              onClick={() => setCurrentRowIndex(currentRowIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white shadow-lg hover:bg-gray-800/80 transition-colors z-10 pointer-events-auto"
            >
              →
            </button>
          )}

          {/* Complete 버튼 - 우측 하단 */}
          <button
            onClick={() => toggleRowComplete(currentRowIndex)}
            className={`absolute bottom-6 right-6 px-6 py-3 rounded-lg font-semibold text-lg shadow-lg transition-colors z-10 pointer-events-auto ${
              completedRows.has(currentRowIndex)
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-yellow-400 text-black hover:bg-yellow-500'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>✓</span>
              <span>Complete</span>
            </span>
          </button>
        </div>
      </div>

      {/* 드로워 오버레이 */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
