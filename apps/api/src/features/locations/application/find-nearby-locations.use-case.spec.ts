import { Test, TestingModule } from '@nestjs/testing';
import { FindNearbyLocationsUseCase } from './find-nearby-locations.use-case';
import { LOCATION_REPOSITORY } from '../domain/ports/location.repository';

const mockRepo = { findAllWithCoords: jest.fn() };

describe('FindNearbyLocationsUseCase', () => {
  let useCase: FindNearbyLocationsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindNearbyLocationsUseCase, { provide: LOCATION_REPOSITORY, useValue: mockRepo }],
    }).compile();

    useCase = module.get<FindNearbyLocationsUseCase>(FindNearbyLocationsUseCase);
    jest.clearAllMocks();
  });

  it('returns empty array when no branches have coords', async () => {
    mockRepo.findAllWithCoords.mockResolvedValue([]);
    const result = await useCase.execute(13.69, -89.22, 15);
    expect(result).toEqual([]);
  });

  it('includes branches within radius and excludes those outside', async () => {
    const nearby = { id: '1', name: 'Centro', latitude: 13.6929, longitude: -89.2182, status: 'ACTIVE' };
    const far = { id: '2', name: 'Remote', latitude: 14.5, longitude: -90.0, status: 'ACTIVE' };
    mockRepo.findAllWithCoords.mockResolvedValue([nearby, far]);

    const result = await useCase.execute(13.6929, -89.2182, 5);
    const ids = result.map((r) => r.id);
    expect(ids).toContain('1');
    expect(ids).not.toContain('2');
  });

  it('sorts results by distance ascending', async () => {
    const close = { id: '1', latitude: 13.693, longitude: -89.219, status: 'ACTIVE' };
    const medium = { id: '2', latitude: 13.700, longitude: -89.220, status: 'ACTIVE' };
    mockRepo.findAllWithCoords.mockResolvedValue([medium, close]);

    const result = await useCase.execute(13.693, -89.219, 20);
    expect(result[0].id).toBe('1');
  });
});
