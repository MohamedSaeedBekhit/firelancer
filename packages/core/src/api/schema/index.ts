import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Buffer } from 'buffer';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BalanceEntryType, CustomerType, ID, Permission } from '../../common/shared-types';
import { Customer } from '../../entity';

export class CreateAdministratorInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ isArray: true, type: 'number' })
  @IsNumber({}, { each: true })
  roleIds: Array<ID>;
}

export class UpdateAdministratorInput {
  @ApiProperty()
  @IsNumber()
  id: ID;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emailAddress?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ isArray: true, type: 'number' })
  @IsNumber({}, { each: true })
  @IsOptional()
  roleIds?: Array<ID>;
}

export class UpdateActiveAdministratorInput {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;
}

export class CurrentUser {
  @ApiProperty()
  @IsNumber()
  id: ID;

  @ApiProperty()
  @IsString()
  identifier: string;
}

export class MutationLoginArgs {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;

  @ApiProperty()
  @IsString()
  username: string;
}

export class NativeAuthInput {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  username: string;
}

export class AuthenticationInput {
  @ApiPropertyOptional()
  @IsOptional()
  native?: NativeAuthInput;
}

export class MutationAuthenticateArgs {
  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => AuthenticationInput)
  input: AuthenticationInput;

  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}

export class CreateCustomerInput {
  @ApiProperty()
  @IsString()
  emailAddress: string;

  @ApiProperty()
  @IsEnum(CustomerType)
  customerType: CustomerType;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;
}

export class UpdateCustomerInput {
  @ApiProperty()
  @IsNumber()
  id: ID;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;
}

export class RegisterCustomerInput {
  @ApiProperty()
  @IsString()
  emailAddress: string;

  @ApiProperty()
  @IsEnum(CustomerType)
  customerType: CustomerType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;
}

export class CreateRoleInput {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(Permission, { each: true })
  permissions: Array<Permission>;
}

export class UpdateRoleInput {
  @ApiProperty()
  @IsNumber()
  id: ID;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Array<Permission>;
}

export class MutationRegisterCustomerAccountArgs {
  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => RegisterCustomerInput)
  input: RegisterCustomerInput;
}

export class MutationVerifyCustomerAccountArgs {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsString()
  token: string;
}

export class MutationRefreshCustomerVerificationArgs {
  @ApiProperty()
  @IsString()
  emailAddress: string;
}

export class MutationRequestPasswordResetArgs {
  @ApiProperty()
  @IsString()
  emailAddress: string;
}

export class MutationResetPasswordArgs {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  token: string;
}

export class MutationUpdateCustomerPasswordArgs {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}

export class MutationRequestUpdateCustomerEmailAddressArgs {
  @ApiProperty()
  @IsString()
  newEmailAddress: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class MutationUpdateCustomerEmailAddressArgs {
  @ApiProperty()
  @IsString()
  token: string;
}

export class MutationCreateAdministratorArgs {
  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAdministratorInput)
  input: CreateAdministratorInput;
}

export class MutationUpdateAdministratorArgs {
  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateAdministratorInput)
  input: UpdateAdministratorInput;
}

export class MutationUpdateActiveAdministratorArgs {
  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateActiveAdministratorInput)
  input: UpdateActiveAdministratorInput;
}

export class MutationAssignRoleToAdministratorArgs {
  @ApiProperty()
  @IsNumber()
  administratorId: ID;

  @ApiProperty()
  @IsNumber()
  roleId: ID;
}

export class MutationDeleteAdministratorArgs {
  @ApiProperty()
  @IsNumber()
  id: ID;
}

export class QueryAdministratorArgs {
  @ApiProperty()
  @IsNumber()
  id: ID;
}

export class File {
  @IsString()
  originalname: string;

  @IsString()
  mimetype: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @Type(() => Buffer)
  buffer: Buffer;

  @IsNumber()
  size: number;
}

export class CreateAssetInput {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => File)
  file: File;
}

export class CoordinateInput {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;
}

export class UpdateAssetInput {
  @ApiProperty()
  @IsNumber()
  id: ID;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @ApiProperty()
  @Type(() => CoordinateInput)
  focalPoint?: CoordinateInput;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tags?: string;
}

export class CreateJobPostInput {
  @ApiProperty()
  @IsNumber()
  customerId: ID;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsBoolean()
  private: boolean;

  @ApiPropertyOptional({ isArray: true, type: 'number' })
  @IsNumber({}, { each: true })
  @IsOptional()
  assetIds?: ID[];

  @ApiPropertyOptional({ isArray: true, type: 'number' })
  @IsNumber({}, { each: true })
  @IsOptional()
  facetValueIds?: ID[];
}

export class MutationCreateJobPostArgs {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  private: boolean;

  @ApiPropertyOptional({ isArray: true, type: 'number' })
  @IsNumber({}, { each: true })
  @IsOptional()
  facetValueIds?: Array<ID>;
}

export class CreateFacetValueInput {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  facetId: ID;
}

export class CreateFacetValueWithFacetInput {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;
}

export class UpdateFacetValueInput {
  @ApiProperty()
  @IsNumber()
  id: ID;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  facetId?: ID;
}

export class CreateFacetInput {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFacetValueWithFacetInput)
  values?: CreateFacetValueWithFacetInput[];
}

export class UpdateFacetInput {
  @ApiProperty()
  @IsNumber()
  id: ID;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}

export class CreateBalanceEntryInput {
  customer: Customer;

  @IsEnum(BalanceEntryType)
  type: BalanceEntryType;

  @IsInt()
  @IsPositive()
  @IsOptional()
  reviewDays?: number;

  @IsInt()
  @IsPositive()
  credit: number;

  @IsInt()
  @IsPositive()
  debit: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

export class ConfigArg {
  name: string;
  value: string;
}

export class ConfigurableOperation {
  code: string;
  args: Array<ConfigArg>;
}

export class CreateCollectionInput {
  name: string;
  description: string;
  slug: string;
  filters: Array<ConfigurableOperation>;
  inheritFilters?: boolean;
  isPrivate?: boolean;
  parentId?: ID;
}

export class MutationCreateCollectionArgs {
  input: CreateCollectionInput;
}

export class UpdateCollectionInput {
  id: ID;
  name?: string;
  description?: string;
  slug?: string;
  filters?: Array<ConfigurableOperation>;
  inheritFilters?: boolean;
  isPrivate?: boolean;
  parentId?: ID;
}

export class MutationUpdateCollectionArgs {
  input: UpdateCollectionInput;
}

export class MoveCollectionInput {
  collectionId: ID;
  index: number;
  parentId: ID;
}

export class MutationMoveCollectionArgs {
  input: MoveCollectionInput;
}
