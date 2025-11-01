import React, { useState, useEffect } from "react";
import { Classroom } from "../../types";
import api from "../../api";

interface ClassroomManagerProps {
  initialClassrooms: Classroom[];
  onDataChange: () => void;
}

const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  initialClassrooms,
  onDataChange,
}) => {
  // 列表狀態
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);

  // 表單狀態
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [color, setColor] = useState("#3b82f6");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 當從父元件傳來的 prop 改變時，同步更新此元件的列表狀態
  useEffect(() => {
    setClassrooms(initialClassrooms);
  }, [initialClassrooms]);

  const resetForm = () => {
    setName("");
    setCapacity(40);
    setColor("#3b82f6");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classroomData = { name, capacity: Number(capacity), color };
    try {
      if (editingId) {
        await api.put(`/classrooms/${editingId}`, classroomData);
      } else {
        await api.post("/classrooms", classroomData);
      }
      resetForm();
      onDataChange(); // 通知父元件
    } catch (error) {
      console.error("Error saving classroom:", error);
      alert("儲存失敗！");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("確定要刪除這間教室嗎？")) {
      try {
        await api.delete(`/classrooms/${id}`);
        onDataChange(); // 通知父元件
      } catch (error) {
        console.error("Error deleting classroom:", error);
        alert("刪除失敗！");
      }
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingId(classroom.id);
    setName(classroom.name);
    setCapacity(classroom.capacity);
    setColor(classroom.color);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">教室管理</h2>

      <form onSubmit={handleSubmit} className="mb-6 border-b pb-6">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? "編輯教室" : "新增教室"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="classroomName"
              className="block text-sm font-medium text-gray-700"
            >
              教室名稱
            </label>
            <input
              id="classroomName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label
              htmlFor="classroomCapacity"
              className="block text-sm font-medium text-gray-700"
            >
              容納人數
            </label>
            <input
              id="classroomCapacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label
              htmlFor="classroomColor"
              className="block text-sm font-medium text-gray-700"
            >
              代表顏色
            </label>
            <input
              id="classroomColor"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
              title="選擇教室代表色"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              取消編輯
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingId ? "儲存變更" : "確認新增"}
          </button>
        </div>
      </form>

      <h3 className="text-xl font-semibold mb-4">現有教室列表</h3>
      <ul className="space-y-3">
        {classrooms.map((room) => (
          <li
            key={room.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: room.color }}
              ></div>
              <span className="font-semibold">{room.name}</span>
              <span className="text-sm text-gray-500">
                ({room.capacity} 人)
              </span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(room)}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                編輯
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                刪除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassroomManager;
