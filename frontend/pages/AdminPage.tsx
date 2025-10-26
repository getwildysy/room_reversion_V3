import React, { useState, useEffect } from "react";
import { Classroom } from "../types";
import api from "../api";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom"; // 用於權限導向

// 用於管理教室列表和表單
const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // 用於新增/編輯教室的表單狀態
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [color, setColor] = useState("#3b82f6");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 載入所有教室
  const fetchClassrooms = async () => {
    try {
      const response = await api.get("/classrooms");
      // 同樣，我們需要轉換 id
      const formatted = response.data.map((c: any) => ({
        ...c,
        id: String(c.id),
      }));
      setClassrooms(formatted);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // 權限檢查：如果不是 admin，自動導向回首頁
  if (user?.role !== "admin") {
    alert("權限不足！");
    return <Navigate to="/" replace />;
  }

  const resetForm = () => {
    setName("");
    setCapacity(40);
    setColor("#3b82f6");
    setEditingId(null);
  };

  // 處理表單提交 (新增或更新)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // API 需要 number 格式的 capacity
    const classroomData = { name, capacity: Number(capacity), color };

    try {
      if (editingId) {
        // 更新 (PUT /api/classrooms/:id)
        await api.put(`/classrooms/${editingId}`, classroomData);
      } else {
        // 新增 (POST /api/classrooms)
        await api.post("/classrooms", classroomData);
      }
      resetForm();
      fetchClassrooms(); // 重新載入列表
    } catch (error) {
      console.error("Error saving classroom:", error);
      alert("儲存失敗！");
    }
  };

  // 刪除教室
  const handleDelete = async (id: string) => {
    if (window.confirm("確定要刪除這間教室嗎？所有相關預約將一併刪除。")) {
      try {
        await api.delete(`/classrooms/${id}`);
        fetchClassrooms(); // 重新載入列表
      } catch (error) {
        console.error("Error deleting classroom:", error);
        alert("刪除失敗！");
      }
    }
  };

  // 載入資料到表單中以進行編輯
  const handleEdit = (classroom: Classroom) => {
    setEditingId(classroom.id);
    setName(classroom.name);
    setCapacity(classroom.capacity);
    setColor(classroom.color);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">管理後台 - 教室管理</h1>

      {/* 新增/編輯表單 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "編輯教室" : "新增教室"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* --- 修正 1: 教室名稱 --- */}
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

          {/* --- 修正 2: 容納人數 --- */}
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

          {/* --- 修正 3: 代表顏色 --- */}
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

      {/* 教室列表 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">現有教室列表</h2>
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
    </div>
  );
};

export default AdminPage;
