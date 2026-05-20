export { PrismaClient } from './generated/client';
export type { Prisma } from './generated/client';

// Identity
export type { Role, User } from './generated/client';

// Venue
export type { Branch, Room, Seat } from './generated/client';

// Content
export type { Movie, Showtime, TicketType } from './generated/client';

// Reservations & payments
export type {
  Reservation,
  ReservationSeat,
  ReservationTicketType,
  Payment,
  TicketQR,
} from './generated/client';

// Audit
export type { AuditLog } from './generated/client';

// Enums
export {
  UserStatus,
  MovieStatus,
  ShowtimeStatus,
  SeatStatus,
  SeatType,
  RoomStatus,
  RoomType,
  BranchStatus,
  ReservationStatus,
  ReservationSeatStatus,
  PaymentStatus,
  QRStatus,
  AdjustmentType,
  TicketTypeStatus,
} from './generated/client';
