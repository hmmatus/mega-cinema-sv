import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { MOVIE_REPOSITORY, type MovieRepository } from '../domain/ports/movie.repository';
import { MovieArchivedEvent } from '../domain/events/movie-archived.event';
import { HttpProblemException } from '../../../common/exceptions/http-problem.exception';

@Injectable()
export class ArchiveMovieUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY) private readonly movieRepo: MovieRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, userId: string, roleId: string, sourceIp?: string): Promise<void> {
    const existing = await this.movieRepo.findById(id);
    if (!existing) {
      throw new HttpProblemException({ type: '/problems/movie-not-found', title: 'Movie Not Found', status: 404, message: 'The requested movie does not exist.' });
    }

    const futureShowtimeIds = await this.movieRepo.findFutureShowtimeIds(id);

    const affectedReservationIds: string[] = [];

    await this.prisma.$transaction(async (tx) => {
      await tx.movie.update({ where: { id }, data: { status: 'ARCHIVED', updatedById: userId } });

      if (futureShowtimeIds.length > 0) {
        await tx.showtime.updateMany({
          where: { id: { in: futureShowtimeIds } },
          data: { status: 'CANCELADA' },
        });

        const nonPaidReservations = await tx.reservation.findMany({
          where: { showtimeId: { in: futureShowtimeIds }, status: { in: ['PENDIENTE', 'BLOQUEADA'] } },
          select: { id: true },
        });
        const nonPaidIds = nonPaidReservations.map((r) => r.id);

        if (nonPaidIds.length > 0) {
          await tx.reservation.updateMany({
            where: { id: { in: nonPaidIds } },
            data: { status: 'CANCELADA' },
          });
          affectedReservationIds.push(...nonPaidIds);
        }

        const paidReservations = await tx.reservation.findMany({
          where: { showtimeId: { in: futureShowtimeIds }, status: 'PAGADA' },
          select: { id: true },
        });
        const paidIds = paidReservations.map((r) => r.id);

        if (paidIds.length > 0) {
          await tx.reservation.updateMany({
            where: { id: { in: paidIds } },
            data: { pendingResolution: true },
          });
          affectedReservationIds.push(...paidIds);
        }
      }

      await this.audit.log(tx, {
        userId,
        roleId,
        entityName: 'movies',
        entityId: id,
        action: 'ARCHIVE',
        previousValue: existing as unknown as object,
        newValue: { status: 'ARCHIVED' },
        metadata: { affectedShowtimes: futureShowtimeIds, affectedReservations: affectedReservationIds },
        sourceIp,
      });
    });

    if (futureShowtimeIds.length > 0) {
      this.eventEmitter.emit('movie.archived', new MovieArchivedEvent(id, futureShowtimeIds, affectedReservationIds));
    }
  }
}
