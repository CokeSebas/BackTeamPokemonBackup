import { Logger } from '@nestjs/common';

export class MyLoggerService {

  //private readonly logger = new Logger(MyLoggerService.name);

  private readonly isLoggerEnabled = process.env.LOG_ACTIVE;

  log(message: string, className: string) {
    const logger = new Logger(className);
    if(this.isLoggerEnabled == "true"){
      logger.log(message);
    }
  }

  error(message: string, className: string, trace?: string) {
    const logger = new Logger(className);
    if(this.isLoggerEnabled == "true"){
      logger.error(message, trace);
    }
  }

  warn(message: string, className: string) {
    const logger = new Logger(className);
    if(this.isLoggerEnabled == "true"){
      logger.warn(message);
    }
  }

  debug(message: string, className: string) {
    const logger = new Logger(className);
    if(this.isLoggerEnabled == "true"){
      logger.debug(message);
    }
  }

  verbose(message: string, className: string) {
    const logger = new Logger(className);
    if(this.isLoggerEnabled == "true"){
      logger.verbose(message);
    }
  }
}
