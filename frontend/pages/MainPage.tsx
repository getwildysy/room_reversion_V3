import React, { useState, useMemo, useEffect, useCallback } from "react";
import api from "../api";
import { Classroom, Reservation } from "../types";
import ClassroomList from "../components/ClassroomList";
import ScheduleCalendar from "../components/ScheduleCalendar";
import BookingModal from "../components/BookingModal";
import BatchBookingModal from "../components/BatchBookingModal";
import { useAuth } from "../AuthContext";
import toast from "react-hot-toast";

type SelectedSlot = { date: Date; timeSlot: string };

const MainPage: React.FC = () => {
  const { user } = useAuth();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

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

      if (formattedClassrooms.length > 0 && !selectedClassroomId) {
        setSelectedClassroomId(formattedClassrooms[0].id);
      }

      // 2. 確保 formattedReservations 包含 userId 和 batch_id
      const formattedReservations = reservationsRes.data.map((r: any) => ({
        id: String(r.id),
        classroomId: String(r.classroomId),
        userId: r.userId,
        userNickname: r.userNickname,
        purpose: r.purpose,
        date: r.date,
        timeSlot: r.timeSlot,
        batch_id: r.batch_id,
      }));
      setReservations(formattedReservations);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [selectedClassroomId]); // ★ 修正：依賴 selectedClassroomId，確保在 fetchData 被呼叫時能拿到最新的值

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedClassroom = useMemo(
    () => classrooms.find((c) => c.id === selectedClassroomId),
    [classrooms, selectedClassroomId],
  );

  // --- ★ 3. 確保所有函式只被定義一次 ★ ---

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
      toast.success("預約成功！");
      handleCloseModal();
      handleClearSelection();
      fetchData(); // 預約成功後呼叫 fetchData 重新載入
    } catch (err: any) {
      console.error("Error creating reservation:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`預約失敗： ${err.response.data.message}`);
      } else {
        toast.error("預約失敗，請稍後再試。");
      }
    }
  };

  const handleCancelReservation = async (reservation: Reservation) => {
    let confirmText = "您確定要取消這個預約嗎？";
    let deleteUrl = `/reservations/${reservation.id}`;

    if (user?.role === "admin" && reservation.batch_id) {
      if (
        window.confirm(
          `這是一筆批次預約 (ID: ${reservation.batch_id})。\n\n[確定] = 取消 "所有" 屬於此批次的預約\n[取消] = 只取消 "這一筆" 預約`,
        )
      ) {
        deleteUrl = `/reservations/batch/${reservation.batch_id}`;
        confirmText = "即將刪除整個批次，確定嗎？";
      } else {
        confirmText = "即將取消此批次中的單筆預約，確定嗎？";
      }
    }

    if (window.confirm(confirmText)) {
      try {
        await api.delete(deleteUrl);
        toast.error("預約已取消。");
        fetchData(); // 取消成功後呼叫 fetchData 重新載入
      } catch (err: any) {
        console.error("Error cancelling reservation:", err);
        toast.error(`取消失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

  const handleOpenBatchModal = () => {
    if (user?.role === "admin") {
      setIsBatchModalOpen(true);
    }
  };

  const handleCloseBatchModal = () => {
    setIsBatchModalOpen(false);
  };

  const handleBatchSubmitSuccess = () => {
    fetchData(); // 成功後重新載入
  };

  // 4. 確保 return 區塊在函式結尾
  return (
    <main className="max-w-7xl mx-auto w-full flex-grow min-h-0 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-6 md:h-full">
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
            onCancelReservation={handleCancelReservation}
            onOpenBatchBooking={handleOpenBatchModal}
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

      {selectedClassroom && (
        <BatchBookingModal
          isOpen={isBatchModalOpen}
          onClose={handleCloseBatchModal}
          classroom={selectedClassroom}
          onBatchBookSuccess={handleBatchSubmitSuccess}
        />
      )}
    </main>
  );
};

export default MainPage;
