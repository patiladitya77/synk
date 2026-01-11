export type BoardRole = "VIEWER" | "EDITOR";

export interface ICollaborator {
  id: string;
  userId: string;
  role: BoardRole;
}

export interface ICanvas {
  id: string;
  title: string;
  slug: string;
  ownerId: string;

  collaborators: ICollaborator[];

  content?: Record<string, any>; // JSONB

  isArchived: boolean;
  isInviteEnabled: boolean;

  createdAt: string;
  updatedAt: string;
}
