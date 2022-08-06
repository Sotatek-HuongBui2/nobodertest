import { Body, ClassSerializerInterceptor, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role, Roles } from 'src/common/decorators/roles.decorator';
import { UserScope } from 'src/common/decorators/user.decorator';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ApproveAdminDto } from './dto/approve-admin.dto';
import { ChangeStatusArtistDto } from './dto/change-status-artist.dto';
import { ChangeStatusWhitelistUserDto } from './dto/change-status-whitelist-user.dto';
import { ChangeStatusWhitelistArrayDto } from './dto/change-status-whitelist-array.dto';
import { GetListArtistDto } from './dto/get-list-artist';
import { GetListWhitelistDto } from './dto/get-list-whitelist.dto';


@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.Admin)
  async approveAdmin(@UserScope() user: User, @Body() approveAdminDto: ApproveAdminDto) {
    return await this.adminService.approveAdmin(approveAdminDto.address)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get-all-whitelist')
  @Roles(Role.Admin)
  async getAllWhitelistUser(@UserScope() user: User, @Query() getListWhitelistDto: GetListWhitelistDto) {
    return await this.adminService.getAllWhitelistUser(getListWhitelistDto)
  }

  @Get('get-whitelist-by-address')
  async getWhitelistByAddress(@UserScope() user: User, @Query("address") address: string) {
    return await this.adminService.getWhitelistByAddress(address)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('get-all-artist')
  @Roles(Role.Admin)
  async getAllArtist(@UserScope() user: User, @Query() getListArtistDto: GetListArtistDto) {
    return await this.adminService.getAllArtist(getListArtistDto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('change-status-whitelist')
  @Roles(Role.Admin)
  async changeStatusWhitelistUser(@UserScope() user: User, @Body() changeStatusWhitelistUserDto: ChangeStatusWhitelistUserDto) {
    return await this.adminService.changeStatusWhitelistUser(changeStatusWhitelistUserDto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('change-status-array')
  @Roles(Role.Admin)
  async changeStatusWhitelistUsers(@UserScope() user: User, @Body() changeStatusWhitelistArrayDto: ChangeStatusWhitelistArrayDto) {
    return await this.adminService.changeStatusWhitelistUsers(changeStatusWhitelistArrayDto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('change-status-artist')
  @Roles(Role.Admin)
  async changeStatusArtist(@UserScope() user: User, @Body() changeStatusArtistDto: ChangeStatusArtistDto) {
    return await this.adminService.changeStatusArtist(changeStatusArtistDto)
  }

  @Post('login-external-wallet')
  async loginExternalWallet(@Body() adminLoginDto: AdminLoginDto) {
    let user = await this.authService.getUserAdmin(adminLoginDto.address, adminLoginDto.signature);
    const access_token = await this.authService.login(user);
    return { access_token, user }
  }
}
