import Router from 'koa-router';
import AppService from '../services/AppService';

export default function createRoutes(service: AppService) {
  const router = new Router();

  router.get('/shards', async (ctx, next) => {
    ctx.body = service.getShards();
    ctx.set('Cache-Control', 'public, max-age=3600');
    await next();
  });

  router.get('/labels', async (ctx, next) => {
    ctx.body = service.getLabels();
    ctx.set('Cache-Control', 'public, max-age=3600');
    await next();
  });

  router.get('/featured-players', async (ctx, next) => {
    ctx.body = service.getFeaturedPlayers();
    ctx.set('Cache-Control', 'public, max-age=3600');
    await next();
  });

  router.get('/player/:shard/:name', async (ctx, next) => {
    const data = await service.getPlayerStatistics(ctx.params.shard, ctx.params.name);
    if (data == null) {
      ctx.throw(404, 'not found');
    } else {
      ctx.body = data;
    }
    ctx.set('Cache-Control', 'public, max-age=300');
    await next();
  });

  return router.routes();
};
