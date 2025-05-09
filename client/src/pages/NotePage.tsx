import React, { useState, useEffect, useRef } from 'react';
import { useHabit } from '@/lib/HabitContext';
import { useLocation } from 'wouter';
import TabNavigation from '@/components/TabNavigation';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const NotePage: React.FC = () => {
  const { activeUser, habits, isLoading } = useHabit();
  const [day, setDay] = useState<number>(0);
  const [notes, setNotes] = useState<{[key: number]: string}>({});
  const [habitEntries, setHabitEntries] = useState<{[key: number]: number}>({});
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // 날짜 범위 생성 (1-56일)
  const daysArray = Array.from({ length: 56 }, (_, i) => i);

  // 노트 데이터 및 습관 항목 상태 가져오기
  useEffect(() => {
    const fetchData = async () => {
      if (!activeUser || day === undefined) return;
      
      try {
        setIsFetching(true);
        
        // 노트 데이터 가져오기
        const notesResponse = await fetch(`/api/users/${activeUser}/notes/${day}`);
        const notesData = await notesResponse.json();
        
        // 노트 데이터를 habitId를 키로 하는 객체로 변환
        const notesMap = notesData.reduce((acc: {[key: number]: string}, note: any) => {
          acc[note.habitId] = note.note;
          return acc;
        }, {});
        
        setNotes(notesMap);
        
        // 습관 항목 상태 가져오기
        const entriesResponse = await fetch(`/api/users/${activeUser}/entries`);
        const entriesData = await entriesResponse.json();
        
        // 해당 날짜의 습관 항목만 필터링
        const dayEntries = entriesData.filter((entry: any) => entry.day === day);
        
        // 습관 항목을 habitId를 키로 하는 객체로 변환
        const entriesMap = dayEntries.reduce((acc: {[key: number]: number}, entry: any) => {
          acc[entry.habitId] = entry.value;
          return acc;
        }, {});
        
        setHabitEntries(entriesMap);
        
        // 일일 피드백 가져오기
        try {
          const feedbackResponse = await fetch(`/api/users/${activeUser}/feedback/${day}`);
          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            if (feedbackData && feedbackData.feedback) {
              setFeedback(feedbackData.feedback);
            }
          }
        } catch (error) {
          console.error('Error fetching feedback:', error);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // 데이터가 없으면 빈 객체 설정
        setNotes({});
        setHabitEntries({});
        setFeedback("");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchData();
  }, [activeUser, day]);

  // 텍스트영역 참조 배열
  const textAreaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // 텍스트 영역 높이 조절 함수
  const adjustTextAreaHeight = (textArea: HTMLTextAreaElement | null) => {
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  };
  
  // 모든 텍스트 영역 높이 조절
  useEffect(() => {
    if (!isFetching) {
      // 노트 텍스트 영역 높이 조절
      Object.values(textAreaRefs.current).forEach(textArea => {
        adjustTextAreaHeight(textArea);
      });
      
      // 피드백 텍스트 영역 높이 조절
      adjustTextAreaHeight(feedbackTextAreaRef.current);
    }
  }, [isFetching, notes, feedback]);
  
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

  // 습관 항목 업데이트 핸들러 
  const handleHabitEntryUpdate = async (habitId: number, value: number) => {
    if (!activeUser) return;
    
    // 모든 습관은 내용이 작성된 후에만 체크 가능
    if (value > 0 && !notes[habitId]) {
      toast({
        title: "세부내용 필요",
        description: "세부내용을 작성한 후에 체크할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // UI 상태 즉시 업데이트
      setHabitEntries(prev => ({
        ...prev,
        [habitId]: value
      }));
      
      // 서버에 업데이트 요청
      const response = await apiRequest('POST', '/api/entries', {
        userId: activeUser,
        habitId,
        day,
        value
      });
      
      if (response.ok) {
        toast({
          title: "점수 업데이트",
          description: "습관 점수가 업데이트되었습니다.",
        });
      }
    } catch (error) {
      console.error('Error updating habit entry:', error);
      toast({
        title: "점수 업데이트 실패",
        description: "습관 점수 업데이트 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      
      // 오류 발생 시 이전 상태로 복원
      setHabitEntries(prev => {
        const prevState = { ...prev };
        delete prevState[habitId];
        return prevState;
      });
    }
  };
  
  // 피드백 저장 핸들러
  const handleSaveFeedback = async () => {
    if (!activeUser) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('POST', '/api/feedback', {
        userId: activeUser,
        day,
        feedback: feedback || ''
      });
      
      if (response.ok) {
        toast({
          title: "저장 완료",
          description: "소감/피드백이 저장되었습니다.",
        });
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "저장 실패",
        description: "소감/피드백 저장 중 오류가 발생했습니다.",
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
      
      // 노트 저장
      const saveNotesPromises = Object.entries(notes).map(([habitId, note]) => 
        apiRequest('POST', '/api/notes', {
          userId: activeUser,
          habitId: parseInt(habitId),
          day,
          note: note || ''
        })
      );
      
      // 피드백 저장
      const saveFeedbackPromise = apiRequest('POST', '/api/feedback', {
        userId: activeUser,
        day,
        feedback: feedback || ''
      });
      
      // 모든 저장 작업 병렬로 실행
      await Promise.all([...saveNotesPromises, saveFeedbackPromise]);
      
      toast({
        title: "저장 완료",
        description: "모든 습관 노트와 소감/피드백이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "저장 실패",
        description: "데이터 저장 중 오류가 발생했습니다.",
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
          <h2 className="text-base font-semibold mb-3">자장격지 행동습관 점검표 {day + 1}일차</h2>
          <select
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            className="w-full rounded-md border border-gray-300 py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent mb-3"
          >
            {daysArray.map((d) => (
              <option key={d} value={d}>{d + 1}일차</option>
            ))}
          </select>
          
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
                <div className="bg-blue-100 px-3 py-1.5 text-sm font-medium">
                  1. 책 읽기
                </div>
                <div className="p-2">
                  <div className="habit-option-group">
                    <div className={`habit-option ${habitEntries[1] === 0 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="book-none" 
                        name="book-score" 
                        className="mr-1.5"
                        checked={habitEntries[1] === 0}
                        onChange={() => handleHabitEntryUpdate(1, 0)} 
                      />
                      <label htmlFor="book-none" className="text-xs">미완료 (0점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[1] === 1 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="book-half" 
                        name="book-score" 
                        className="mr-1.5"
                        checked={habitEntries[1] === 1}
                        onChange={() => handleHabitEntryUpdate(1, 1)} 
                      />
                      <label htmlFor="book-half" className="text-xs">30분 미만 (0.5점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[1] === 2 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="book-full" 
                        name="book-score" 
                        className="mr-1.5"
                        checked={habitEntries[1] === 2}
                        onChange={() => handleHabitEntryUpdate(1, 2)} 
                      />
                      <label htmlFor="book-full" className="text-xs">30분 이상 (1점)</label>
                    </div>
                  </div>
                  <div className="mt-2">
                    <textarea
                      ref={el => textAreaRefs.current[1] = el}
                      value={notes[1] || ''}
                      onChange={(e) => handleNoteChange(1, e.target.value)}
                      placeholder="읽은 책의 제목과 내용, 느낀점 등을 작성하세요..."
                      className="w-full border border-gray-300 min-h-[40px] py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2번 동영상 시청 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-3 py-1.5 text-sm font-medium">
                  2. 동영상 시청
                </div>
                <div className="p-2">
                  <div className="habit-option-group">
                    <div className={`habit-option ${habitEntries[2] === 0 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="video-none" 
                        name="video-score" 
                        className="mr-1.5"
                        checked={habitEntries[2] === 0}
                        onChange={() => handleHabitEntryUpdate(2, 0)} 
                      />
                      <label htmlFor="video-none" className="text-xs">미완료 (0점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[2] === 1 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="video-done" 
                        name="video-score" 
                        className="mr-1.5"
                        checked={habitEntries[2] === 1}
                        onChange={() => handleHabitEntryUpdate(2, 1)}
                      />
                      <label htmlFor="video-done" className="text-xs">동영상 시청 1개이상 (1점)</label>
                    </div>
                  </div>
                  <div className="mt-2">
                    <textarea
                      ref={el => textAreaRefs.current[2] = el}
                      value={notes[2] || ''}
                      onChange={(e) => handleNoteChange(2, e.target.value)}
                      placeholder="시청한 영상의 제목과 내용, 느낀점 등을 작성하세요..."
                      className="w-full border border-gray-300 min-h-[40px] py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3번 제품 애용 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-3 py-1.5 text-sm font-medium">
                  3. 제품 애용
                </div>
                <div className="p-2">
                  <div className="habit-option-group">
                    <div className={`habit-option ${habitEntries[3] === 0 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="product-none" 
                        name="product-score" 
                        className="mr-1.5"
                        checked={habitEntries[3] === 0}
                        onChange={() => handleHabitEntryUpdate(3, 0)} 
                      />
                      <label htmlFor="product-none" className="text-xs">미완료 (0점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[3] === 1 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="product-used" 
                        name="product-score" 
                        className="mr-1.5"
                        checked={habitEntries[3] === 1}
                        onChange={() => handleHabitEntryUpdate(3, 1)} 
                      />
                      <label htmlFor="product-used" className="text-xs">USED 제품후기 (1점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[3] === 2 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="product-new" 
                        name="product-score" 
                        className="mr-1.5"
                        checked={habitEntries[3] === 2}
                        onChange={() => handleHabitEntryUpdate(3, 2)} 
                      />
                      <label htmlFor="product-new" className="text-xs">NEW 제품후기 (2점)</label>
                    </div>
                  </div>
                  <div className="mt-2">
                    <textarea
                      ref={el => textAreaRefs.current[3] = el}
                      value={notes[3] || ''}
                      onChange={(e) => handleNoteChange(3, e.target.value)}
                      placeholder="애용한 제품명과 후기를 작성하세요..."
                      className="w-full border border-gray-300 min-h-[40px] py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4번 미팅 참석 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-3 py-1.5 text-sm font-medium">
                  4. 미팅 참석
                </div>
                <div className="p-2">
                  <div className="habit-option-group">
                    <div className={`habit-option ${habitEntries[4] === 0 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="meeting-none" 
                        name="meeting-score" 
                        className="mr-1.5"
                        checked={habitEntries[4] === 0}
                        onChange={() => handleHabitEntryUpdate(4, 0)} 
                      />
                      <label htmlFor="meeting-none" className="text-xs">미완료 (0점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[4] === 1 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="meeting-done" 
                        name="meeting-score" 
                        className="mr-1.5"
                        checked={habitEntries[4] === 1}
                        onChange={() => handleHabitEntryUpdate(4, 1)} 
                      />
                      <label htmlFor="meeting-done" className="text-xs">미팅참석 및 소감작성 (5점)</label>
                    </div>
                  </div>
                  <div className="mt-2">
                    <textarea
                      ref={el => textAreaRefs.current[4] = el}
                      value={notes[4] || ''}
                      onChange={(e) => handleNoteChange(4, e.target.value)}
                      placeholder="참석한 미팅과 소감을 작성하세요..."
                      className="w-full border border-gray-300 min-h-[40px] py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 5번 제품 전달 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-3 py-1.5 text-sm font-medium">
                  5. 제품 전달 및 소비자 관리
                </div>
                <div className="p-2">
                  <div className="habit-option-group">
                    <div className={`habit-option ${habitEntries[5] === 0 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="delivery-none" 
                        name="delivery-score" 
                        className="mr-1.5"
                        checked={habitEntries[5] === 0}
                        onChange={() => handleHabitEntryUpdate(5, 0)} 
                      />
                      <label htmlFor="delivery-none" className="text-xs">미완료 (0점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[5] === 1 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="delivery-explain" 
                        name="delivery-score" 
                        className="mr-1.5"
                        checked={habitEntries[5] === 1}
                        onChange={() => handleHabitEntryUpdate(5, 1)} 
                      />
                      <label htmlFor="delivery-explain" className="text-xs">설명 및 추천 (1점)</label>
                    </div>
                    <div className={`habit-option ${habitEntries[5] === 2 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}>
                      <input 
                        type="radio" 
                        id="delivery-full" 
                        name="delivery-score" 
                        className="mr-1.5"
                        checked={habitEntries[5] === 2}
                        onChange={() => handleHabitEntryUpdate(5, 2)} 
                      />
                      <label htmlFor="delivery-full" className="text-xs">전달 및 추천 (2점)</label>
                    </div>
                  </div>
                  <div className="mt-2">
                    <textarea
                      ref={el => textAreaRefs.current[5] = el}
                      value={notes[5] || ''}
                      onChange={(e) => handleNoteChange(5, e.target.value)}
                      placeholder="전달한 제품과 소비자 관리 내용을 작성하세요..."
                      className="w-full border border-gray-300 min-h-[40px] py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 소감/피드백 */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-1.5 text-sm font-medium">
                  소감/피드백
                </div>
                <div className="p-2">
                  <textarea 
                    ref={feedbackTextAreaRef}
                    value={feedback || ''}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="오늘의 활동에 대한 소감이나 피드백을 작성하세요..."
                    className="w-full border border-gray-300 min-h-[60px] py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
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
              {isSubmitting ? "저장 중..." : "오늘도 해냈다! 💪"}
            </button>
          </div>
        </div>
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default NotePage;