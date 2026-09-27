import { ContentStatus, Visibility } from './content-visibility.model';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  publishedAt: string | null;
  status: ContentStatus;
  visibility: Visibility;
  createdAt: string;
}

export interface UpsertAnnouncementRequest {
  title: string;
  content: string;
  visibility: Visibility;
}
