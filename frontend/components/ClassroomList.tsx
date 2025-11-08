import React, { useState } from "react"; // 1. 匯入 useState
import { Classroom } from "../types";
import { UsersIcon, ComputerIcon, ChevronDownIcon } from "./Icons"; // 2. 匯入 ChevronDownIcon

interface ClassroomListProps {
  classrooms: Classroom[];
  selectedClassroomId: string;
  onSelectClassroom: (id: string) => void;
}

const ClassroomList: React.FC<ClassroomListProps> = ({
  classrooms,
  selectedClassroomId,
  onSelectClassroom,
}) => {
  // 3. 新增 state，預設在手機上是關閉的
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 4. 找到目前選中的教室資訊 (用於手機上顯示)
  const selectedClassroom = classrooms.find(
    (c) => c.id === selectedClassroomId,
  );

  return (
    // 5. 修改外層 div，讓它在手機上高度可以自適應
    <div className="bg-white p-4 rounded-lg shadow-md md:h-full">
      {/* 6. 桌面版標題 (只在 md 尺寸以上顯示) */}
      <h2 className="hidden md:block text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
        教室列表
      </h2>

      {/* 7. 新增：手機版折疊開關 (只在 md 尺寸以下顯示) */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden w-full text-left p-3 rounded-lg bg-gray-100 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          {selectedClassroom ? (
            <>
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedClassroom.color }}
              >
                <ComputerIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {selectedClassroom.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedClassroom.capacity} 人
                </p>
              </div>
            </>
          ) : (
            <p className="font-semibold text-gray-800">請選擇一間教室</p>
          )}
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isMobileOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* 8. 修改：教室列表 ul */}
      <ul
        className={`
          space-y-2 mt-2 
          ${isMobileOpen ? "block" : "hidden"} 
          md:block
        `}
      >
        {classrooms.map((classroom) => (
          <li key={classroom.id}>
            <button
              // 9. 新增：點擊後在手機上自動收合
              onClick={() => {
                onSelectClassroom(classroom.id);
                setIsMobileOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-start space-x-3 ${
                selectedClassroomId === classroom.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-800 hover:bg-blue-100 hover:shadow-md"
              }`}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: classroom.color }}
              >
                <ComputerIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{classroom.name}</p>
                <div className="text-sm mt-1 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{classroom.capacity} 人</span>
                  </div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassroomList;
