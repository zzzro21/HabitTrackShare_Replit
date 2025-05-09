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
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-100">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left border-r w-1/6">행동습관</th>
                    <th className="px-3 py-2 text-center border-r w-1/6">점수</th>
                    <th className="px-3 py-2 text-left">세부내용</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit, index) => (
                    <tr key={habit.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                      <td className="px-3 py-3 border-r align-top">
                        <div className="font-medium text-gray-800">{index + 1}</div>
                        <div>{habit.label}</div>
                      </td>
                      <td className="px-3 py-3 border-r text-center align-top">
                        <div className="font-medium">{habit.scoreValue}</div>
                      </td>
                      <td className="px-3 py-3">
                        <textarea
                          value={notes[habit.id] || ''}
                          onChange={(e) => handleNoteChange(habit.id, e.target.value)}
                          placeholder={`${habit.label}에 대한 세부 내용을 작성하세요...`}
                          className="w-full border border-gray-300 h-16 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                          rows={3}
                        />
                        <div className="mt-1 text-right">
                          <button
                            onClick={() => handleSaveNote(habit.id)}
                            disabled={isSubmitting}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-2 rounded"
                          >
                            저장
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="px-3 py-3">
                      <div className="font-medium mb-1">소감/피드백</div>
                      <textarea 
                        placeholder="오늘의 활동에 대한 소감이나 피드백을 작성하세요..."
                        className="w-full border border-gray-300 h-20 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                        rows={3}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
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