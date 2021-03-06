import Router from 'koa-router';
import sharp from 'sharp';
import fileType from 'file-type';

import MediaService from './services/Media';
import { Context } from 'koa';

const service = new MediaService();

const router = new Router();

router.get('/status', async (ctx, next) => {
  ctx.body = ({ 'status': 'ok' });
  await next();
});

async function respond(ctx: Context, buffer: Buffer|null) {
  // reply with placeholder image for 404
  let img = buffer != null ? sharp(buffer) : sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 0, b: 0, g: 0, alpha: 0.0 },
    }
  }).png();

  if ('size' in ctx.query) {
    img = img.resize(parseInt(ctx.query.size));
  }
  img = img.toFormat(ctx.params.ext);
  ctx.body = await img.toBuffer();

  const type = await fileType.fromBuffer(ctx.body);
  if (type !== undefined) {
    ctx.type = type.mime;
  }
  if (buffer != null) {
    ctx.set('Cache-Control', 'public, max-age=86400'); // 1 day
  }
}

const EXT = '.:ext(webp|png|jpg)';

router.get(`/brawlers/:name/avatar${EXT}`, async (ctx, next) => {
  const buffer = await service.getBrawlerAvatar(ctx.params.name.toLowerCase(), ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get(`/brawlers/:name/model${EXT}`, async (ctx, next) => {
  const buffer = await service.getBrawlerModel(ctx.params.name.toLowerCase(), ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get(`/brawlers/:name/info`, async (ctx, next) => {
  ctx.body = await service.getBrawlerInfo(ctx.params.name.toLowerCase());
  if (ctx.body == null) {
    ctx.throw(404, ctx.params.name + ' not found')
  } else {
    ctx.set('Cache-Control', 'public, max-age=86400'); // 1 day
  }
  await next();
});

router.get(`/starpowers/:id${EXT}`, async (ctx, next) => {
  const buffer = await service.getStarpower(ctx.params.id, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get(`/gadgets/:id${EXT}`, async (ctx, next) => {
  const buffer = await service.getGadget(ctx.params.id, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get(`/maps/:id${EXT}`, async (ctx, next) => {
  let id = ctx.params.id;
  if (id.length < '15000000'.length) {
    id = id.replace('^150', '1500');
  }

  const buffer = await service.getMap(id, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get(`/modes/:name/icon${EXT}`, async (ctx, next) => {
  const name = ctx.params.name.replace(/-| /g, '').toLowerCase().replace(/soloshowdown/, 'showdown')
  const buffer = await service.getModeIcon(name, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get(`/modes/:name/background${EXT}`, async (ctx, next) => {
  const name = ctx.params.name.replace(/-| /g, '').toLowerCase().replace(/soloshowdown/, 'showdown')
  const buffer = await service.getModeBackground(name, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get(`/avatars/:id${EXT}`, async (ctx, next) => {
  const buffer = await service.getAvatarIcon(ctx.params.id, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

export default router.routes();
