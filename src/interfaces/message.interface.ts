export interface Message {
  text: string;
  createdAt: Date;
  id: number;
  owner: {
    username: string;
    photo: string;
    id: number;
  };
  toUserId?: number;
  toRoomId?: number;
  listOfReaders: number[];
}
