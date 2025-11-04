import React, { useState } from "react";
import { Classroom } from "../../types";
import api from "../../api";

interface ReservationExporterProps {
  classrooms: Classroom[]; // 從 AdminPage 傳入教室列表
}

// 取得今天的 YYYY-MM-DD 格式
const getTodayString = () => new Date().toISOString().split("T")[0];

const ReservationExporter: React.FC<ReservationExporterProps> = ({
  classrooms,
}) => {
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [classroomId, setClassroomId] = useState("all"); // 預設匯出全部教室
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    if (new Date(endDate) < new Date(startDate)) {
      setError("結束日期不能早於開始日期。");
      setIsLoading(false);
      return;
    }

    try {
      // 1. 呼叫新的 API
      const response = await api.get("/reservations/export", {
        params: {
          startDate,
          endDate,
          classroomId,
        },
        responseType: "blob", // ★ 關鍵：告訴 axios 我們要下載的是檔案
      });

      // 2. 處理檔案下載
      const blob = new Blob([response.data], {
        type: "text/csv; charset=utf-8-sig",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // 從後端回傳的 header 取得檔案名稱 (如果有的話)，否則用預設的
      const contentDisposition = response.headers["content-disposition"];
      let filename = "reservations.csv";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // 3. 清理
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error exporting data:", err);
      // 如果回傳的是 JSON (例如 404 Not Found)，我們需要解析它
      if (err.response && err.response.data.type === "application/json") {
        const reader = new FileReader();
        reader.onload = function () {
          const errorData = JSON.parse(this.result as string);
          setError(errorData.message || "匯出失敗");
        };
        reader.readAsText(err.response.data);
      } else {
        setError("匯出失敗，請檢查日期範圍內是否有資料。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">匯出預約紀錄</h2>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md mb-4">
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. 開始日期 */}
        <div>
          <label
            htmlFor="exportStartDate"
            className="block text-sm font-medium text-gray-700"
          >
            開始日期
          </label>
          <input
            type="date"
            id="exportStartDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        {/* 2. 結束日期 */}
        <div>
          <label
            htmlFor="exportEndDate"
            className="block text-sm font-medium text-gray-700"
          >
            結束日期
          </label>
          <input
            type="date"
            id="exportEndDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        {/* 3. 選擇教室 */}
        <div>
          <label
            htmlFor="exportClassroom"
            className="block text-sm font-medium text-gray-700"
          >
            選擇教室
          </label>
          <select
            id="exportClassroom"
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="all">匯出全部教室</option>
            {classrooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. 匯出按鈕 */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold disabled:bg-gray-400"
        >
          {isLoading ? "匯出中..." : "下載 CSV 報表"}
        </button>
      </div>
    </div>
  );
};

export default ReservationExporter;
