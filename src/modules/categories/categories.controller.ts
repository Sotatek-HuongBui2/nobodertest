import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('one')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Query('id') id: number) {
    return this.categoriesService.findOne(id);
  }
}
