import React, { useState, useEffect } from "react";
import { Classroom, User } from "../types"; // 1. 匯入 User 型別
import api from "../api";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // 教室管理的 State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [color, setColor] = useState("#3b82f6");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 2. 新增：使用者管理的 State
  const [users, setUsers] = useState<User[]>([]);

  // 3. 修改：同時載入教室和使用者
  const fetchData = async () => {
    try {
      const [classroomsRes, usersRes] = await Promise.all([
        api.get("/classrooms"),
        api.get("/users"), // 呼叫新的 API
      ]);

      // 處理教室
      const formattedClassrooms = classroomsRes.data.map((c: any) => ({
        ...c,
        id: String(c.id),
      }));
      setClassrooms(formattedClassrooms);

      // 處理使用者
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 權限檢查 (不變)
  if (user?.role !== "admin") {
    alert("權限不足！");
    return <Navigate to="/" replace />;
  }

  // --- 教室管理 (不變) ---
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
      fetchData(); // 重新載入所有資料
    } catch (error) {
      console.error("Error saving classroom:", error);
      alert("儲存失敗！");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("確定要刪除這間教室嗎？")) {
      try {
        await api.delete(`/classrooms/${id}`);
        fetchData(); // 重新載入所有資料
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

  // --- 4. 新增：使用者管理函式 ---
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("確定要刪除這位使用者嗎？")) {
      try {
        await api.delete(`/users/${userId}`);
        fetchData(); // 重新載入所有資料
      } catch (err: any) {
        console.error("Error deleting user:", err);
        alert(`刪除失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

  const handleChangeRole = async (
    userId: number,
    newRole: "user" | "admin",
  ) => {
    if (window.confirm(`確定要將這位使用者變更為 ${newRole} 嗎？`)) {
      try {
        await api.put(`/users/${userId}/role`, { role: newRole });
        fetchData(); // 重新載入所有資料
      } catch (err: any) {
        console.error("Error changing user role:", err);
        alert(`變更失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">管理後台</h1>

      {/* --- 教室管理區塊 (包含無障礙修正) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">教室管理</h2>

        {/* 表單 */}
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

        {/* 教室列表 */}
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

      {/* --- 5. 新增：使用者管理區塊 --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">使用者管理</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th className="py-2">使用者名稱</th>
              <th className="py-2">角色</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-3">{u.id}</td>
                <td className="py-3">{u.username}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      u.role === "admin"
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 text-right space-x-2">
                  {/* 防止管理者操作自己 */}
                  {user && user.id !== u.id && (
                    <>
                      {u.role === "user" ? (
                        <button
                          onClick={() => handleChangeRole(u.id, "admin")}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          設為管理員
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChangeRole(u.id, "user")}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        >
                          設為使用者
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        刪除
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
