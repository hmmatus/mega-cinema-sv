import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';

const mockUserRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    useCase = new UpdateUserUseCase(mockUserRepo as any);
    jest.clearAllMocks();
  });

  it('updates and returns user when found', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'uid-1' });
    mockUserRepo.update.mockResolvedValue({ id: 'uid-1', firstName: 'Updated' });

    const result = await useCase.execute('uid-1', { firstName: 'Updated' });

    expect(mockUserRepo.update).toHaveBeenCalledWith('uid-1', { firstName: 'Updated' });
    expect(result).toEqual({ id: 'uid-1', firstName: 'Updated' });
  });

  it('throws NotFoundException when user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing', { firstName: 'X' })).rejects.toThrow(NotFoundException);
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });
});
