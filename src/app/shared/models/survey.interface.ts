export interface SurveyInterface {
  id: string;
  title: string;
  category: string;
  endDate: string;
  status: 'active' | 'past';
}

