export interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  closeButtonLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}
