import React, { useState, useMemo, useEffect, useCallback } from "react";
import api from "../api";
import { Classroom, Reservation } from "../types";
import ClassroomList from "../components/ClassroomList";
import ScheduleCalendar from "../components/ScheduleCalendar";
import BookingModal from "../components/BookingModal";

type SelectedSlot = { date: Date; timeSlot: string };

const MainPage: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. fetchData 現在使用 useCallback
  const fetchData = useCallback(async () => {
    try {
      const [classroomsRes, reservationsRes] = await Promise.all([
        api.get("/classrooms"),
        api.get("/reservations"),
      ]);

      const formattedClassrooms = classroomsRes.data.map((c: any) => ({
        ...c,
        id: String(c.id),
      }));
      setClassrooms(formattedClassrooms);

      // 檢查是否需要設定預設教室
      if (formattedClassrooms.length > 0 && !selectedClassroomId) {
        setSelectedClassroomId(formattedClassrooms[0].id);
      }

      // 2. 確保 formattedReservations 包含 userId
      const formattedReservations = reservationsRes.data.map((r: any) => ({
        id: String(r.id),
        classroomId: String(r.classroomId),
        userId: r.userId,
        userNickname: r.userNickname,
        purpose: r.purpose,
        date: r.date,
        timeSlot: r.timeSlot,
      }));
      setReservations(formattedReservations);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    // 依賴 selectedClassroomId，以便在切換教室時... 不，fetchData 應該只載入一次
    // 我們在 handleSelectClassroom 中已經清空 selectedSlots 了
    // fetchData 應該只載入所有資料
  }, []); // 保持空依賴，只在載入時執行一次

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleAddReservation = async (details: { purpose: string }) => {
    if (!selectedClassroomId || selectedSlots.length === 0) return;

    const reservationData = {
      classroomId: Number(selectedClassroomId),
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
      await api.post("/reservations", reservationData);
      alert("預約成功！");
      handleCloseModal();
      handleClearSelection();
      fetchData(); // 3. 預約成功後呼叫 fetchData 重新載入
    } catch (err: any) {
      console.error("Error creating reservation:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(`預約失敗： ${err.response.data.message}`);
      } else {
        alert("預約失敗，請稍後再試。");
      }
    }
  };

  // 4. 新增的 handleCancelReservation 函式
  const handleCancelReservation = async (reservationId: string) => {
    if (window.confirm("您確定要取消這個預約嗎？")) {
      try {
        await api.delete(`/reservations/${reservationId}`);
        alert("預約已取消。");
        fetchData(); // 取消成功後呼叫 fetchData 重新載d入
      } catch (err: any) {
        console.error("Error cancelling reservation:", err);
        alert(`取消失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

  // 5. 確保 return 區塊在函式結尾
  return (
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
            onCancelReservation={handleCancelReservation} // 6. 傳遞 prop
          />
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddReservation}
        classroom={selectedClassroom}
        selectedSlots={selectedSlots}
      />
    </main>
  );
};

export default MainPage;
