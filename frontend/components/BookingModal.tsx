import React, { useState, useEffect } from "react";
import { Classroom } from "../types";
import { CloseIcon } from "./Icons";
import { useAuth } from "../AuthContext"; // 1. 匯入 useAuth

type SelectedSlot = { date: Date; timeSlot: string };

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { purpose: string }) => void; // 2. 移除 userName
  classroom: Classroom | undefined;
  selectedSlots: SelectedSlot[];
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classroom,
  selectedSlots,
}) => {
  // 3. 從 Context 取得使用者，並移除 userName state
  const { user } = useAuth();
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPurpose("");
    }
  }, [isOpen]);

  if (!isOpen || !classroom || selectedSlots.length === 0 || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (purpose.trim()) {
      onSubmit({ purpose }); // 4. 只回傳 purpose
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">
                預約教室 - {classroom.name}
              </h2>
              <p className="text-sm text-gray-500">
                您正在預約 {selectedSlots.length} 個時段
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
              aria-label="關閉視窗"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-4 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-md border">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">
              已選取時段：
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {selectedSlots.map(({ date, timeSlot }, index) => (
                <li key={index}>
                  {date.toLocaleDateString("zh-TW", {
                    month: "numeric",
                    day: "numeric",
                  })}{" "}
                  (週{["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}
                  ) - {timeSlot}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              {/* 5. 顯示登入者的名稱，而不是輸入框 */}
              <label className="block text-sm font-medium text-gray-700">
                借用人姓名
              </label>
              <p className="mt-1 block w-full py-2 px-3 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                {user.username}
              </p>
            </div>
            <div>
              <label
                htmlFor="purpose"
                className="block text-sm font-medium text-gray-700"
              >
                借用事由
              </label>
              <input
                type="text"
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="例如：社團活動、專題討論"
              />
            </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                確認預約
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
