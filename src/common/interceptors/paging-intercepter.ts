import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as _ from 'lodash';

@Injectable()
export class pagingInterceptor implements NestInterceptor {
  public intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = _context.switchToHttp().getRequest();
    const { page, limit } = this.getPageAndLimit(request);

    if (request.query) {
      request.query.limit = limit;
      request.query.page = page;
    }
    if (request.body) {
      request.body.limit = limit;
      request.body.page = page;
    }
    return next.handle();
  }

  /**
   * Get Page And Limit From Body Or Query
   * @param {Request} request
   */
  private getPageAndLimit(request: Request) {
    const { query, body } = request;
    let page = _.get(query, 'page') || _.get(body, 'page');
    let limit = _.get(query, 'limit') || _.get(body, 'limit');
    if (!page) page = 1;
    if (!limit) {
      limit = 10;
    } else {
      limit > 100 ? (limit = 100) : limit;
    }
    return { page, limit };
  }
}
