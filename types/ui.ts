export interface BubbleSettings {
  alignment: 'left' | 'right';
  scale: number;
  textDirection: 'ltr' | 'rtl';
  fontSize: number; // Stored as a rem value, e.g., 1 for 1rem
}