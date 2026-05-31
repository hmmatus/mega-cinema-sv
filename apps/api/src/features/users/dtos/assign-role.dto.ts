import { IsIn, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty()
  @IsIn(['admin', 'employee', 'user'])
  role!: string;
}
