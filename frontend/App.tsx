// frontend/App.tsx

import React, { useState, useMemo, useEffect } from "react";
// 1. 匯入我們新的 api 和 AuthContext
import api from "./api";
import { useAuth } from "./AuthContext";
import { Classroom, Reservation } from "./types";
import Header from "./components/Header";
import ClassroomList from "./components/ClassroomList";
import ScheduleCalendar from "./components/ScheduleCalendar";
import BookingModal from "./components/BookingModal";
import AuthPage from "./pages/AuthPage"; // 2. 匯入登入頁面

type SelectedSlot = { date: Date; timeSlot: string };

const App: React.FC = () => {
  // 3. 從 AuthContext 取得使用者狀態
  const { user, isLoading: isAuthLoading } = useAuth();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 4. 新增一個函式來載入資料
  const fetchData = async () => {
    try {
      // 使用 Promise.all 同時發送兩個請求
      const [classroomsRes, reservationsRes] = await Promise.all([
        api.get("/classrooms"),
        api.get("/reservations"),
      ]);

      // 處理教室資料
      const formattedClassrooms = classroomsRes.data.map((c: any) => ({
        ...c,
        id: String(c.id),
      }));
      setClassrooms(formattedClassrooms);
      if (formattedClassrooms.length > 0 && !selectedClassroomId) {
        setSelectedClassroomId(formattedClassrooms[0].id);
      }

      // 處理預約資料
      const formattedReservations = reservationsRes.data.map((r: any) => ({
        ...r,
        id: String(r.id),
        classroomId: String(r.classroomId),
      }));
      setReservations(formattedReservations);
    } catch (error) {
      console.error("Error fetching data:", error);
      // 在這裡可以加入錯誤處理，例如登出使用者
    }
  };

  // 5. 修改 useEffect，只在 "登入成功後" (user 存在時) 才載入資料
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]); // 依賴 user 狀態

  // ... (handleSelectClassroom, handleDateChange, handleToggleSlot, ...) ...

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

  // 6. ★★★ 升級 handleAddReservation ★★★
  //    現在它會呼叫真實的後端 API
  const handleAddReservation = async (details: { purpose: string }) => {
    if (!selectedClassroomId || selectedSlots.length === 0 || !user) {
      alert("發生錯誤：缺少必要資訊。");
      return;
    }

    // 準備要 POST 到 API 的資料
    const reservationData = {
      classroomId: Number(selectedClassroomId), // API 期望 number
      purpose: details.purpose,
      slots: selectedSlots.map((slot) => ({
        date: `${slot.date.getFullYear()}-${(slot.date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${slot.date
          .getDate()
          .toString()
          .padStart(2, "0")}`,
        timeSlot: slot.timeSlot,
      })),
    };

    try {
      // 使用我們設定好的 api 實例 (它會自動帶 Token)
      await api.post("/reservations", reservationData);

      // 預約成功
      alert("預約成功！");
      handleCloseModal();
      handleClearSelection();

      // 重新載入預約資料，以顯示剛剛的新預約
      const reservationsRes = await api.get("/reservations");
      const formattedReservations = reservationsRes.data.map((r: any) => ({
        ...r,
        id: String(r.id),
        classroomId: String(r.classroomId),
      }));
      setReservations(formattedReservations);
    } catch (err: any) {
      console.error("Error creating reservation:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(`預約失敗： ${err.response.data.message}`);
      } else {
        alert("預約失敗，請稍後再試。");
      }
    }
  };

  // 7. 檢查 AuthContext 是否還在載入
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>
    );
  }

  // 8. 如果沒有登入 (user 是 null)，就顯示登入頁面
  if (!user) {
    return <AuthPage />;
  }

  // 9. (如果已登入) 顯示主應用程式
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header /> {/* 我們會在第八階段修改 Header 來顯示使用者名稱和登出按鈕 */}
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
