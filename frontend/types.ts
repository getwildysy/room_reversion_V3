export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  color: string;
}

export interface Reservation {
  id: string;
  classroomId: string;
  userId: number;
  userNickname: string;
  purpose: string;
  date: string; // YYYY-MM-DD format
  timeSlot: string; // e.g., "第一節"
  batch_id?: string;
}

export interface User {
  id: number;
  username: string;
  role: "user" | "admin";
  nickname: string;
}
