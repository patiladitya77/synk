export type BoardRole = "VIEWER" | "EDITOR";

export interface ICollaborator {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
}

export interface ICanvas {
  id: string;
  title: string;
  slug: string;
  ownerId: string;

  collaborators: ICollaborator[];

  content?: Record<string, any> | null; // JSONB

  isArchived: boolean;
  isInviteEnabled: boolean;
  inviteToken: string | null;
  inviteTokenExpiresAt: string | null;

  createdAt: string;
  updatedAt: string;
}
