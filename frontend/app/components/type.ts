type Character = {
    id: number;
    name: string;
  };
  
  type Comment = {
    id: string;
  };
  
 type Turn = {
    id: string;
  };
  
export type Story = {
    id: string;
    title: string;
    content: string;
    user: {
      username: string;
    };
    createdAt: string;
    characters: Character[];
    comments: Comment[];
    turns: Turn[];
  };
  