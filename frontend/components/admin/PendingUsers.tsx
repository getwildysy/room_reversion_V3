import React from "react";
import { User } from "../../types";
import api from "../../api";

interface PendingUsersProps {
  pendingUsers: User[];
  onDataChange: () => void; // 用於通知父元件重新載Data
}

const PendingUsers: React.FC<PendingUsersProps> = ({
  pendingUsers,
  onDataChange,
}) => {
  const handleApproveUser = async (userId: number) => {
    if (window.confirm("確定要批准這位使用者嗎？")) {
      try {
        await api.put(`/users/${userId}/approve`);
        onDataChange(); // 通知父元件
      } catch (err: any) {
        console.error("Error approving user:", err);
        alert(`批准失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (window.confirm("確定要拒絕 (刪除) 這位使用者嗎？")) {
      try {
        await api.delete(`/users/${userId}`);
        onDataChange(); // 通知父元件
      } catch (err: any) {
        console.error("Error deleting user:", err);
        alert(`刪除失敗： ${err.response?.data?.message || "未知錯誤"}`);
      }
    }
  };

  return (
    <div className="bg-yellow-50 p-6 rounded-lg shadow-md mb-8 border border-yellow-300">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-800">
        待審核的使用者
      </h2>
      {pendingUsers.length === 0 ? (
        <p className="text-gray-600">目前沒有待審核的使用者。</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-yellow-300">
              <th className="py-2">ID</th>
              <th className="py-2">使用者名稱</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((u) => (
              <tr key={u.id} className="border-b border-yellow-200">
                <td className="py-3">{u.id}</td>
                <td className="py-3">{u.username}</td>
                <td className="py-3 text-right space-x-2">
                  <button
                    onClick={() => handleApproveUser(u.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    批准
                  </button>
                  <button
                    onClick={() => handleRejectUser(u.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    拒絕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingUsers;
