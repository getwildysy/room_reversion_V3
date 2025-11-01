import React, { useState, useEffect } from "react";
import { Classroom, User } from "../types";
import api from "../api";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // 教室管理 State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [color, setColor] = useState("#3b82f6");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 使用者管理 State
  const [users, setUsers] = useState<User[]>([]);

  // 1. 新增：建立使用者表單的 State
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  const fetchData = async () => {
    try {
      const [classroomsRes, usersRes] = await Promise.all([
        api.get("/classrooms"),
        api.get("/users"),
      ]);

      const formattedClassrooms = classroomsRes.data.map((c: any) => ({
        ...c,
        id: String(c.id),
      }));
      setClassrooms(formattedClassrooms);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (user?.role !== "admin") {
    alert("權限不足！");
    return <Navigate to="/" replace />;
  }

  // --- 教室管理 (不變) ---
  const resetClassroomForm = () => {
    setName("");
    setCapacity(40);
    setColor("#3b82f6");
    setEditingId(null);
  };

  const handleClassroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classroomData = { name, capacity: Number(capacity), color };
    try {
      if (editingId) {
        await api.put(`/classrooms/${editingId}`, classroomData);
      } else {
        await api.post("/classrooms", classroomData);
      }
      resetClassroomForm();
      fetchData();
    } catch (error) {
      console.error("Error saving classroom:", error);
      alert("儲存失敗！");
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (window.confirm("確定要刪除這間教室嗎？")) {
      try {
        await api.delete(`/classrooms/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting classroom:", error);
        alert("刪除失敗！");
      }
    }
  };

  const handleEditClassroom = (classroom: Classroom) => {
    setEditingId(classroom.id);
    setName(classroom.name);
    setCapacity(classroom.capacity);
    setColor(classroom.color);
  };

  // --- 使用者管理 ---
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("確定要刪除這位使用者嗎？")) {
      try {
        await api.delete(`/users/${userId}`);
        fetchData();
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
        fetchData();
      } catch (err: any) {
        console.error("Error changing user role:", err);
        alert(`變更失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

  // 2. 新增：建立使用者表單的 Submit 函式
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      alert("使用者名稱和密碼為必填項。");
      return;
    }
    try {
      await api.post("/users", {
        username: newUsername,
        password: newPassword,
        role: newRole,
      });
      alert("使用者建立成功！");
      // 清空表單
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      fetchData(); // 重新載入列表
    } catch (err: any) {
      console.error("Error creating user:", err);
      alert(`建立失敗： ${err.response?.data?.message || "未知錯誤"}`);
    }
  };

  // 3. 新增：重設密碼函式
  const handleResetPassword = async (userId: number, username: string) => {
    const newPassword = window.prompt(`請輸入 "${username}" 的新密碼：`);

    if (newPassword && newPassword.trim() !== "") {
      try {
        await api.put(`/users/${userId}/password`, { password: newPassword });
        alert(`使用者 "${username}" 的密碼已成功重設。`);
      } catch (err: any) {
        console.error("Error resetting password:", err);
        alert(`密碼重設失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    } else if (newPassword !== null) {
      // (使用者按了 "確定" 但沒輸入)
      alert("密碼不能為空。");
    }
    // (如果 newPassword 是 null, 代表使用者按了 "取消")
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">管理後台</h1>

      {/* --- 教室管理區塊 --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">教室管理</h2>

        <form onSubmit={handleClassroomSubmit} className="mb-6 border-b pb-6">
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
                onClick={resetClassroomForm}
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
        {/* ... (教室列表的 ul ... map ... li) ... (不變) */}
        <ul className="space-y-3">
          {classrooms.map((room) => (
            <li
              key={room.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              {/* ... (教室資訊) ... */}
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
                  onClick={() => handleEditClassroom(room)}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  編輯
                </button>
                <button
                  onClick={() => handleDeleteClassroom(room.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* --- 使用者管理區塊 --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">使用者管理</h2>

        {/* 4. 新增：建立使用者表單 */}
        <form onSubmit={handleCreateUser} className="mb-6 border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">建立新使用者</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="newUsername"
                className="block text-sm font-medium text-gray-700"
              >
                使用者名稱
              </label>
              <input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                密碼
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
                placeholder="設定一個密碼"
              />
            </div>
            <div>
              <label
                htmlFor="newRole"
                className="block text-sm font-medium text-gray-700"
              >
                角色
              </label>
              <select
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              建立使用者
            </button>
          </div>
        </form>

        {/* 使用者列表 */}
        <h3 className="text-xl font-semibold mb-4">現有使用者列表</h3>
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

                      {/* 5. 新增：重設密碼按鈕 */}
                      <button
                        onClick={() => handleResetPassword(u.id, u.username)}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        重設密碼
                      </button>

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
