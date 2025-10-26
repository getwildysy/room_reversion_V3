import React, { useState, useMemo } from 'react';
import { Classroom, Reservation } from './types';
import Header from './components/Header';
import ClassroomList from './components/ClassroomList';
import ScheduleCalendar from './components/ScheduleCalendar';
import BookingModal from './components/BookingModal';

const initialClassrooms: Classroom[] = [
  { id: 'c1', name: '電腦教室 (A)', capacity: 40, color: '#3b82f6' },
  { id: 'c2', name: '物理實驗室', capacity: 30, color: '#10b981' },
  { id: 'c3', name: '音樂教室', capacity: 50, color: '#8b5cf6' },
  { id: 'c4', name: '美術教室', capacity: 35, color: '#ef4444' },
  { id: 'c5', name: '語言教室', capacity: 40, color: '#f97316' },
];

const initialReservations: Reservation[] = [
  { id: 'r1', classroomId: 'c1', userName: '王老師', purpose: '程式設計課程', date: '2024-07-28', timeSlot: '第二節' },
  { id: 'r2', classroomId: 'c2', userName: '陳同學', purpose: '光學實驗', date: '2024-07-28', timeSlot: '第六節' },
  { id: 'r3', classroomId: 'c1', userName: '李同學', purpose: '專題討論', date: '2024-07-29', timeSlot: '第三節' },
];

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

initialReservations.push({
    id: 'r_today_1',
    classroomId: 'c1',
    userName: '張三',
    purpose: '資訊社社課',
    date: getTodayString(),
    timeSlot: '第三節'
});

initialReservations.push({
    id: 'r_today_2',
    classroomId: 'c3',
    userName: '李四',
    purpose: '合唱團練習',
    date: getTodayString(),
    timeSlot: '第五節'
});

type SelectedSlot = { date: Date; timeSlot: string };

const App: React.FC = () => {
  const [classrooms] = useState<Classroom[]>(initialClassrooms);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(classrooms[0].id);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const selectedClassroom = useMemo(() => 
    classrooms.find(c => c.id === selectedClassroomId),
    [classrooms, selectedClassroomId]
  );
  
  const handleSelectClassroom = (id: string) => {
    setSelectedClassroomId(id);
    setSelectedSlots([]); // Clear selection when changing classroom
  };
  
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleToggleSlot = (date: Date, timeSlot: string) => {
    setSelectedSlots(prev => {
      const exists = prev.some(s => s.date.getTime() === date.getTime() && s.timeSlot === timeSlot);
      if (exists) {
        return prev.filter(s => !(s.date.getTime() === date.getTime() && s.timeSlot === timeSlot));
      } else {
        return [...prev, { date, timeSlot }];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedSlots([]);
  };

  const handleOpenModal = () => {
    if (selectedSlots.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddReservation = (details: { userName: string; purpose: string }) => {
    if (selectedClassroomId && selectedSlots.length > 0) {
      const newReservations = selectedSlots.map((slot, index) => {
        const { date, timeSlot } = slot;
        return {
          id: `r${Date.now() + index}`,
          classroomId: selectedClassroomId,
          userName: details.userName,
          purpose: details.purpose,
          date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
          timeSlot: timeSlot,
        };
      });
      
      setReservations(prev => [...prev, ...newReservations]);
      handleClearSelection();
      handleCloseModal();
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="max-w-7xl mx-auto w-full flex-grow min-h-0 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
            <ClassroomList
              classrooms={classrooms}
              selectedClassroomId={selectedClassroomId}
              onSelectClassroom={handleSelectClassroom}
            />
          </div>
          <div className="flex-1 min-h-0 min-w-0">
            <ScheduleCalendar
              classroom={selectedClassroom}
              date={currentDate}
              reservations={reservations}
              selectedSlots={selectedSlots}
              onToggleSlot={handleToggleSlot}
              onConfirmBooking={handleOpenModal}
              onClearSelection={handleClearSelection}
              onDateChange={handleDateChange}
            />
          </div>
        </div>
      </main>
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddReservation}
        classroom={selectedClassroom}
        selectedSlots={selectedSlots}
      />
    </div>
  );
};

export default App;
