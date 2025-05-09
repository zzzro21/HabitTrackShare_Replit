import React, { useState, useEffect } from 'react';
import { useHabit } from '@/lib/HabitContext';
import { useLocation } from 'wouter';
import TabNavigation from '@/components/TabNavigation';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const NotePage: React.FC = () => {
  const { activeUser, habits, isLoading } = useHabit();
  const [day, setDay] = useState<number>(0);
  const [notes, setNotes] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // 날짜 범위 생성 (1-56일)
  const daysArray = Array.from({ length: 56 }, (_, i) => i);

  // 노트 데이터 가져오기
  useEffect(() => {
    const fetchNotes = async () => {
      if (!activeUser || day === undefined) return;
      
      try {
        setIsFetching(true);
        const response = await fetch(`/api/users/${activeUser}/notes/${day}`);
        const notesData = await response.json();
        
        // 노트 데이터를 habitId를 키로 하는 객체로 변환
        const notesMap = notesData.reduce((acc: {[key: number]: string}, note: any) => {
          acc[note.habitId] = note.note;
          return acc;
        }, {});
        
        setNotes(notesMap);
      } catch (error) {
        console.error('Error fetching notes:', error);
        // 노트 데이터가 없으면 빈 객체 설정
        setNotes({});
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchNotes();
  }, [activeUser, day]);

  // 노트 내용 변경 핸들러
  const handleNoteChange = (habitId: number, content: string) => {
    setNotes(prev => ({
      ...prev,
      [habitId]: content
    }));
  };

  // 노트 저장 핸들러
  const handleSaveNote = async (habitId: number) => {
    if (!activeUser) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('POST', '/api/notes', {
        userId: activeUser,
        habitId,
        day,
        note: notes[habitId] || ''
      });
      
      if (response.ok) {
        toast({
          title: "저장 완료",
          description: "습관 노트가 저장되었습니다.",
        });
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "저장 실패",
        description: "습관 노트 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모든 노트 저장 핸들러
  const handleSaveAllNotes = async () => {
    if (!activeUser) return;
    
    try {
      setIsSubmitting(true);
      
      const savePromises = Object.entries(notes).map(([habitId, note]) => 
        apiRequest('POST', '/api/notes', {
          userId: activeUser,
          habitId: parseInt(habitId),
          day,
          note: note || ''
        })
      );
      
      await Promise.all(savePromises);
      
      toast({
        title: "저장 완료",
        description: "모든 습관 노트가 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "저장 실패",
        description: "습관 노트 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg pb-16">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center">
            <button 
              onClick={handleBack}
              className="p-1 mr-2 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold flex-1 text-center">습관 일지</h1>
          </div>
        </header>
        
        <main className="p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-3"></div>
            <div className="h-40 bg-gray-200 rounded mb-3"></div>
            <div className="h-40 bg-gray-200 rounded mb-3"></div>
            <div className="h-40 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </main>
        
        <TabNavigation />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center">
          <button 
            onClick={handleBack}
            className="p-1 mr-2 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">습관 일지</h1>
        </div>
      </header>
      
      <main className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">일차 선택</label>
          <select
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {daysArray.map((d) => (
              <option key={d} value={d}>{d + 1}일차</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-3">자장격지 행동습관 점검표 {day + 1}일차</h2>
          
          {isFetching ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* 1번 책읽기 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-4 py-2 font-medium">
                  1. 책 읽기
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-2 mb-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="book-none" 
                        name="book-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(1, 0)} 
                      />
                      <label htmlFor="book-none">미완료 (0점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="book-half" 
                        name="book-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(1, 1)} 
                      />
                      <label htmlFor="book-half">30분 미만 (0.5점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="book-full" 
                        name="book-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(1, 2)} 
                      />
                      <label htmlFor="book-full">30분 이상 (1점)</label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">세부내용</label>
                    <textarea
                      value={notes[1] || ''}
                      onChange={(e) => handleNoteChange(1, e.target.value)}
                      placeholder="읽은 책의 제목과 내용, 느낀점 등을 작성하세요..."
                      className="w-full border border-gray-300 h-16 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 2번 동영상 시청 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-4 py-2 font-medium">
                  2. 동영상 시청
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-2 mb-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="video-none" 
                        name="video-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(2, 0)} 
                      />
                      <label htmlFor="video-none">미완료 (0점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="video-done" 
                        name="video-score" 
                        className="mr-2" 
                        onChange={() => handleHabitEntryUpdate(2, 1)}
                      />
                      <label htmlFor="video-done">영상제목 및 시청소감 (1점)</label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">세부내용</label>
                    <textarea
                      value={notes[2] || ''}
                      onChange={(e) => handleNoteChange(2, e.target.value)}
                      placeholder="시청한 영상의 제목과 내용, 느낀점 등을 작성하세요..."
                      className="w-full border border-gray-300 h-16 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 3번 제품 애용 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-4 py-2 font-medium">
                  3. 제품 애용
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-2 mb-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="product-none" 
                        name="product-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(3, 0)} 
                      />
                      <label htmlFor="product-none">미완료 (0점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="product-used" 
                        name="product-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(3, 1)} 
                      />
                      <label htmlFor="product-used">USED 제품후기 (1점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="product-new" 
                        name="product-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(3, 2)} 
                      />
                      <label htmlFor="product-new">NEW 제품후기 (2점)</label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">세부내용</label>
                    <textarea
                      value={notes[3] || ''}
                      onChange={(e) => handleNoteChange(3, e.target.value)}
                      placeholder="애용한 제품명과 후기를 작성하세요..."
                      className="w-full border border-gray-300 h-16 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 4번 미팅 참석 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-4 py-2 font-medium">
                  4. 미팅 참석
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-2 mb-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="meeting-none" 
                        name="meeting-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(4, 0)} 
                      />
                      <label htmlFor="meeting-none">미완료 (0점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="meeting-done" 
                        name="meeting-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(4, 1)} 
                      />
                      <label htmlFor="meeting-done">미팅참석 및 소감작성 (5점)</label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">세부내용</label>
                    <textarea
                      value={notes[4] || ''}
                      onChange={(e) => handleNoteChange(4, e.target.value)}
                      placeholder="참석한 미팅과 소감을 작성하세요..."
                      className="w-full border border-gray-300 h-16 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 5번 제품 전달 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-4 py-2 font-medium">
                  5. 제품 전달 및 소비자 관리
                </div>
                <div className="p-3">
                  <div className="flex flex-col space-y-2 mb-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="delivery-none" 
                        name="delivery-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(5, 0)} 
                      />
                      <label htmlFor="delivery-none">미완료 (0점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="delivery-explain" 
                        name="delivery-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(5, 1)} 
                      />
                      <label htmlFor="delivery-explain">설명 및 추천 (1점)</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="delivery-full" 
                        name="delivery-score" 
                        className="mr-2"
                        onChange={() => handleHabitEntryUpdate(5, 2)} 
                      />
                      <label htmlFor="delivery-full">전달 및 추천 (2점)</label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">세부내용</label>
                    <textarea
                      value={notes[5] || ''}
                      onChange={(e) => handleNoteChange(5, e.target.value)}
                      placeholder="전달한 제품과 소비자 관리 내용을 작성하세요..."
                      className="w-full border border-gray-300 h-16 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 소감/피드백 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium">
                  소감/피드백
                </div>
                <div className="p-3">
                  <textarea 
                    value={feedback || ''}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="오늘의 활동에 대한 소감이나 피드백을 작성하세요..."
                    className="w-full border border-gray-300 h-20 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={handleSaveAllNotes}
              disabled={isSubmitting || isFetching}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md"
            >
              {isSubmitting ? "저장 중..." : "모든 노트 저장"}
            </button>
          </div>
        </div>
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default NotePage;