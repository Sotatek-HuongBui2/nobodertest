import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';
import { CustomErrorMessage } from '../../common/constants/error-message';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  findAll() {
    return this.categoriesRepository.find();
  }

  findByIds(ids: number[]) {
    return this.categoriesRepository.findByIds(ids);
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne(id);
    if (!category) {
      throw new NotFoundException(CustomErrorMessage['CATEGORY.NOT_FOUND']);
    } else return category;
  }

  save(category: Category) {
    return this.categoriesRepository.save(category);
  }
}
