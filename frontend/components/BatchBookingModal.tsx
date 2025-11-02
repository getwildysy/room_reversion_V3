import React, { useState } from "react";
import { Classroom } from "../types";
import { CloseIcon } from "./Icons";
import api from "../api";

interface BatchBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom;
  onBatchBookSuccess: () => void;
}

const getTodayString = () => new Date().toISOString().split("T")[0];

const allTimeSlots = [
  "第一節",
  "第二節",
  "第三節",
  "第四節",
  "午休",
  "第五節",
  "第六節",
  "第七節",
  "第八節",
  "晚上",
];

const allWeekDays = [
  { label: "週日", value: 0 },
  { label: "週一", value: 1 },
  { label: "週二", value: 2 },
  { label: "週三", value: 3 },
  { label: "週四", value: 4 },
  { label: "週五", value: 5 },
  { label: "週六", value: 6 },
];

const BatchBookingModal: React.FC<BatchBookingModalProps> = ({
  isOpen,
  onClose,
  classroom,
  onBatchBookSuccess,
}) => {
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [purpose, setPurpose] = useState("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  // ★ 1. 修改：從 "excludedDays" 改為 "weekdays"，預設選取週一到週五
  const [weekdays, setWeekdays] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleTimeSlotToggle = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  // ★ 2. 修改：函式改名為 handleDayToggle
  const handleDayToggle = (dayValue: number) => {
    setWeekdays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConflicts([]);

    if (new Date(endDate) < new Date(startDate)) {
      setError("結束日期不能早於開始日期。");
      return;
    }
    if (weekdays.length === 0) {
      // ★ 3. 修改：檢查 weekdays
      setError("請至少選擇一個星期。");
      return;
    }
    if (selectedTimeSlots.length === 0) {
      setError("請至少選擇一個時段。");
      return;
    }
    if (!purpose) {
      setError("請輸入事由 (例如：系統維護、考試週)。");
      return;
    }

    try {
      await api.post("/reservations/batch", {
        classroomId: Number(classroom.id),
        purpose,
        startDate,
        endDate,
        timeSlots: selectedTimeSlots,
        weekdays, // ★ 4. 修改：傳送 weekdays
      });

      alert("批次鎖定成功！");
      onBatchBookSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating batch reservation:", err);
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message);
        setConflicts(err.response.data.conflicts);
      } else {
        setError(err.response?.data?.message || "發生未知錯誤。");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            {/* ★ 5. 修改：標題 ★ */}
            <h2 className="text-2xl font-bold text-gray-900">
              批次鎖定時段 - {classroom.name}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
              aria-label="關閉視窗"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* ... (錯誤訊息區塊不變) ... */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md">
              <p className="font-bold">{error}</p>
              {conflicts.length > 0 && (
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {conflicts.map((c, i) => (
                    <li key={i}>
                      {c.date} {c.timeSlot} (已被 {c.userNickname} 預約)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ... (日期範圍區塊不變) ... */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                開始日期
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                結束日期
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          </div>

          {/* ... (事由區塊不變) ... */}
          <div>
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-700"
            >
              事由 (將顯示在日曆上)
            </label>
            <input
              type="text"
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              placeholder="例如：系統鎖定、期中考試"
            />
          </div>

          {/* --- ★ 6. 修改：選取星期幾 (UI) ★ --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選取星期
            </label>
            <div className="flex flex-wrap gap-2">
              {allWeekDays.map((day) => (
                <button
                  type="button"
                  key={day.value}
                  onClick={() => handleDayToggle(day.value)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    weekdays.includes(day.value) // (反轉邏輯)
                      ? "bg-blue-600 text-white border-blue-600" // (選中)
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" // (未選中)
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* ... (選擇時段區塊不變) ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇時段
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {allTimeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => handleTimeSlotToggle(slot)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold border ${
                    selectedTimeSlots.includes(slot)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* --- ★ 7. 修改：按鈕文字 ★ --- */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
            >
              確認批次鎖定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchBookingModal;
