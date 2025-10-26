// frontend/App.tsx

import React, { useState, useMemo, useEffect } from "react"; // 1. 匯入 useEffect
import axios from "axios"; // 2. 匯入 axios
import { Classroom, Reservation } from "./types";
import Header from "./components/Header";
import ClassroomList from "./components/ClassroomList";
import ScheduleCalendar from "./components/ScheduleCalendar";
import BookingModal from "./components/BookingModal";

// 3. 定義後端 API 的網址
const API_URL = "http://localhost:3001/api";

// 4. 移除所有 initialClassrooms 和 initialReservations 的假資料

type SelectedSlot = { date: Date; timeSlot: string };

const App: React.FC = () => {
  // 5. 將 useState 的預設值改為空陣列
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // 6. 將 selectedClassroomId 預設值改為空字串
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 7. 【關鍵】使用 useEffect 在 component 載入時取得資料

  // 載入教室列表
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axios.get(`${API_URL}/classrooms`);

        // ★ 注意：我們的 API 回傳的 id 是 "number"
        // 但前端的 types.ts 和元件 期望 "string"
        // 我們在這裡手動轉換，以避免修改所有子元件
        const formattedClassrooms = response.data.map((c: any) => ({
          ...c,
          id: String(c.id), // 將 number 轉為 string
        }));

        setClassrooms(formattedClassrooms);

        // 預設選取第一間教室
        if (formattedClassrooms.length > 0) {
          setSelectedClassroomId(formattedClassrooms[0].id);
        }
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchClassrooms();
  }, []); // 空陣列 [] 表示這個 effect 只在"載入時"執行一次

  // 載入預約記錄
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`${API_URL}/reservations`);

        // 同樣，我們需要轉換 id 和 classroomId 為 string
        const formattedReservations = response.data.map((r: any) => ({
          ...r,
          id: String(r.id),
          classroomId: String(r.classroomId),
        }));

        setReservations(formattedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []); // 空陣列 [] 表示這個 effect 只在"載入時"執行一次

  // ----------------------------------------------------
  // (以下函式暫時保持不變，我們在第七、八階段再回來修改)
  // ----------------------------------------------------

  const selectedClassroom = useMemo(
    () => classrooms.find((c) => c.id === selectedClassroomId),
    [classrooms, selectedClassroomId],
  );

  const handleSelectClassroom = (id: string) => {
    setSelectedClassroomId(id);
    setSelectedSlots([]);
  };

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleToggleSlot = (date: Date, timeSlot: string) => {
    setSelectedSlots((prev) => {
      const exists = prev.some(
        (s) => s.date.getTime() === date.getTime() && s.timeSlot === timeSlot,
      );
      if (exists) {
        return prev.filter(
          (s) =>
            !(s.date.getTime() === date.getTime() && s.timeSlot === timeSlot),
        );
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

  // ★★★ 備註 ★★★
  // 這個 handleAddReservation 函式目前只會更新"前端"的狀態。
  // 它還沒有呼叫我們的 POST /api/reservations API。
  // 我們將在「第七階段 (登入)」取得 Token 之後，再回來修改這個函式！
  const handleAddReservation = (details: {
    userName: string;
    purpose: string;
  }) => {
    if (selectedClassroomId && selectedSlots.length > 0) {
      const newReservations = selectedSlots.map((slot, index) => {
        const { date, timeSlot } = slot;
        return {
          id: `r${Date.now() + index}`,
          classroomId: selectedClassroomId,
          userName: details.userName, // 這裡也將在登入後改成登入者的姓名
          purpose: details.purpose,
          date: `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`,
          timeSlot: timeSlot,
        };
      });

      setReservations((prev) => [...prev, ...newReservations]);
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
              reservations={reservations} // 傳入從 API 取得的 reservations
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
