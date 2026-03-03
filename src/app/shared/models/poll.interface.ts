export interface Survey {
  id: string;
  owner_id: string;
  expires_at: string | null; 
  created_at: string;
  title: string;
  description: string | null;
  category: string | null;    
  is_published: boolean;
}

export interface PollQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  allow_multiple: boolean;
  options?: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
}

export interface Category {
  id: string;
  name: string;
}