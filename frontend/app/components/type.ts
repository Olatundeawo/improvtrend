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
      badge?: UserBadge
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

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type UserBadge =
  | "NEWBIE"
  | "CONTRIBUTOR"
  | "CREATOR"
  | "TREND_STARTER"

// Badges that should actually be displayed
export type DisplayBadge = Exclude<UserBadge, "NEWBIE">