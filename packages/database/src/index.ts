export { PrismaClient } from './generated/client/index.js';
export type { Prisma } from './generated/client/index.js';

// Identity
export type { Role, User } from './generated/client/index.js';

// Venue
export type { Branch, Room, Seat } from './generated/client/index.js';

// Content
export type { Movie, Showtime, TicketType, Banner } from './generated/client/index.js';

// Reservations & payments
export type {
  Reservation,
  ReservationSeat,
  ReservationTicketType,
  Payment,
  TicketQR,
} from './generated/client/index.js';

// Audit
export type { AuditLog } from './generated/client/index.js';

// Enums
export {
  UserStatus,
  MovieStatus,
  MovieRating,
  MovieVisibility,
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
  BannerStatus,
  BannerTargetType,
} from './generated/client/index.js';
