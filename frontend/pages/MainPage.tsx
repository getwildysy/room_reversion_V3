import React, { useState, useMemo, useEffect } from "react";
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

  // 載入資料 (這個 useEffect 會在 MainPage 載入時執行)
  useEffect(() => {
    const fetchData = async () => {
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
        if (formattedClassrooms.length > 0) {
          setSelectedClassroomId(formattedClassrooms[0].id);
        }

        const formattedReservations = reservationsRes.data.map((r: any) => ({
          ...r,
          id: String(r.id),
          classroomId: String(r.classroomId),
        }));
        setReservations(formattedReservations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

  // 預約函式 (與第七階段相同)
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

  return (
    // ★★★ 這裡是最外層的 <main> ★★★
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

      {/* ★★★ 錯誤的 <main> 標籤已移除 ★★★ */}
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
