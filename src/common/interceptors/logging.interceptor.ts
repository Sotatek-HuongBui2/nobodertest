import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.Authorizion ? true : false;
    const requestInformation = {
      params: request.params,
      query: request.query,
      body: request.body,
      auth: auth
    }
    
    const timeStartRequest = new Date();
    let log = `[${timeStartRequest.toLocaleString('en-US', { timeZone: 'UTC' })}] `
      + `${this.colorizeLogToMagenta(`REQUEST`)}: {url: ${this.colorizeLogToGreen(request.url)}, method: ${this.colorizeLogToGreen(request.method)}, `
      + `detail:${JSON.stringify(requestInformation)}} `;
    const responseStatusCode = context.switchToHttp().getResponse().statusCode;

    return next
      .handle()
      .pipe(
        tap(() => {
          const executionTime = Date.now() - timeStartRequest.getTime();
          log += `${this.colorizeLogToMagenta(`RESPONSE`)}: {status: ${this.colorizeLogToYellow(responseStatusCode)}, execution_time: ${this.colorizeLogToYellow(String(executionTime) + `ms`)}}`;
          console.log(log);
        }),
      );
  }

  colorizeLogToGreen(string: string) {
    return `\x1b[4m\x1b[32m${string}\x1b[0m`;
  }

  colorizeLogToYellow(string: any) {
    return `\x1b[4m\x1b[33m${string}\x1b[0m`;
  }

  colorizeLogToMagenta(string: any) {
    return `\x1b[35m${string}\x1b[0m`;
  }
}
