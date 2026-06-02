export class MovieArchivedEvent {
  constructor(
    public readonly movieId: string,
    public readonly affectedShowtimeIds: string[],
    public readonly affectedReservationIds: string[],
  ) {}
}
