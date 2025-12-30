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

  type Upvote = {
    userId: string
  }
  
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

export type Turns = {
    storyId: string;
    userId: string;
    characterId: string;
    content: string;
    createdAt: string;
    story: Story[];
    characters: Character[];
    user: {
        username: string;
      };
    upvotes: Upvote[]
}
  