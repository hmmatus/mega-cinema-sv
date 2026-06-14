import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MovieArchivedEvent } from '../../domain/events/movie-archived.event';

@Injectable()
export class MovieArchivedListener {
  private readonly logger = new Logger(MovieArchivedListener.name);

  @OnEvent('movie.archived')
  handle(event: MovieArchivedEvent): void {
    this.logger.log(
      `Movie ${event.movieId} archived. Showtimes cancelled: ${event.affectedShowtimeIds.length}. Reservations affected: ${event.affectedReservationIds.length}.`,
    );
  }
}
