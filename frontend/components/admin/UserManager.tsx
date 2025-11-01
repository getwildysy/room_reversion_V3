import React, { useState, useEffect } from "react";
import { User } from "../../types";
import api from "../../api";
import { useAuth } from "../../AuthContext";

interface UserManagerProps {
  activeUsers: User[];
  onDataChange: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({
  activeUsers,
  onDataChange,
}) => {
  const { user: currentAdmin } = useAuth(); // 取得當前登入的管理者
  const [users, setUsers] = useState<User[]>(activeUsers);

  // 表單狀態
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  // Prop 同步
  useEffect(() => {
    setUsers(activeUsers);
  }, [activeUsers]);

  // --- 使用者管理函式 ---
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("確定要刪除這位使用者嗎？")) {
      try {
        await api.delete(`/users/${userId}`);
        onDataChange();
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
        onDataChange();
      } catch (err: any) {
        console.error("Error changing user role:", err);
        alert(`變更失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

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
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      onDataChange();
    } catch (err: any) {
      console.error("Error creating user:", err);
      alert(`建立失敗： ${err.response?.data?.message || "未知錯誤"}`);
    }
  };

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
      alert("密碼不能為空。");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">已啟用使用者管理</h2>

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
                {currentAdmin && currentAdmin.id !== u.id && (
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
  );
};

export default UserManager;
