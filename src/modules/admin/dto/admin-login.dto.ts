import { ApiProperty } from "@nestjs/swagger";

export class AdminLoginDto {
    @ApiProperty({ required: true, description: 'Signature' })
    signature: string;
  
    @ApiProperty({ required: true, description: 'Address' })
    address: string;
}
