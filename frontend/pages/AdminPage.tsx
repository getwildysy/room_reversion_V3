import React, { useState, useEffect, useCallback } from "react";
import { Classroom, User } from "../types";
import api from "../api";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

// 匯入我們的子元件
import PendingUsers from "../components/admin/PendingUsers";
import ClassroomManager from "../components/admin/ClassroomManager";
import UserManager from "../components/admin/UserManager";

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // 父元件只負責掌管 "資料列表" 的狀態
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // fetchData 函式現在是此元件的核心
  const fetchData = useCallback(async () => {
    try {
      const [classroomsRes, usersRes, pendingUsersRes] = await Promise.all([
        api.get("/classrooms"),
        api.get("/users"),
        api.get("/users/pending"),
      ]);

      const formattedClassrooms = classroomsRes.data.map((c: any) => ({
        ...c,
        id: String(c.id),
      }));
      setClassrooms(formattedClassrooms);
      setUsers(usersRes.data);
      setPendingUsers(pendingUsersRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // 空依賴陣列，此函式永不改變

  // 在載入時呼叫 fetchData
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 權限檢查
  if (user?.role !== "admin") {
    alert("權限不足！");
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">正在載入管理資料...</div>;
  }

  // Render 函式現在非常乾淨！
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">管理後台</h1>

      {/* --- ★★★ 順序調整 ★★★ --- */}

      {/* 1. 待審核的使用者 */}
      <PendingUsers pendingUsers={pendingUsers} onDataChange={fetchData} />

      {/* 2. 已啟用使用者管理 (移到前面) */}
      <UserManager activeUsers={users} onDataChange={fetchData} />

      {/* 3. 教室管理 (移到後面) */}
      <ClassroomManager
        initialClassrooms={classrooms}
        onDataChange={fetchData}
      />
    </div>
  );
};

export default AdminPage;
