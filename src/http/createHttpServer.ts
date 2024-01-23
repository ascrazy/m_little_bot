import Router from '@koa/router';
import Koa from 'koa';
import type { Telegraf } from 'telegraf';

export const createHttpServer = (bot: Telegraf) => {
  const http = new Koa();

  const router = new Router();

  router.get('/', async (ctx) => {
    try {
      const me = await bot.telegram.getMe();
      ctx.response.status = 200;
      ctx.response.body = `Status: ok\nUsername: ${me.username}`;
    } catch (err) {
      ctx.response.status = 500;
      ctx.response.body = `Status: error, Error: ${(err as Error).message}`;
    }
  });

  router.get('/status', async (ctx) => {
    try {
      const me = await bot.telegram.getMe();

      ctx.status = 200;
      ctx.headers['content-type'] = 'application/json';
      ctx.body = {
        status: 'ok',
        username: me.username,
      };
    } catch (err) {
      ctx.status = 500;
      ctx.headers['content-type'] = 'application/json';
      ctx.body = {
        status: 'error',
        error: (err as Error).message,
      };
    }
  });

  http.use(router.routes());
  http.use(router.allowedMethods());

  return http;
};
