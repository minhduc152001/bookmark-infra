import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((_, context: ExecutionContext) => {
  const request: Express.Request = context.switchToHttp().getRequest();
  return request.user;
});
