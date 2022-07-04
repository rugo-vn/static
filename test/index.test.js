/* eslint-disable */

import request from 'supertest';
import assert from 'assert';
import serve from '../src/index.js';
import Koa from 'koa';

describe('static test', function () {
  it('should serve from cwd', function (done) {
    const app = new Koa();

    app.use(serve({ root: '.' }));

    request(app.listen())
      .get('/package.json')
      .expect(200, done)
  });

  it('should 404', function (done) {
    const app = new Koa()

    app.use(serve({ root: 'test/fixtures' }));

    request(app.listen())
      .get('/something')
      .expect(404, done)
  })

  it('should not throw 404 error', function (done) {
    const app = new Koa()

    let err = null

    app.use(async (ctx, next) => {
      try {
        await next()
      } catch (e) {
        err = e
      }
    })

    app.use(serve({ root: 'test/fixtures' }));

    app.use(async (ctx) => {
      ctx.body = 'ok'
    })

    request(app.listen())
      .get('/something')
      .expect(200)
      .end((_, res) => {
        assert.equal(res.text, 'ok')
        assert.equal(err, null)
        done()
      })
  })

  it('should respond', function (done) {
    const app = new Koa()

    app.use(serve({ root: 'test/fixtures'}));

    app.use((ctx, next) => {
      return next().then(() => {
        ctx.body = 'hey'
      })
    })

    request(app.listen())
      .get('/hello.txt')
      .expect(200)
      .expect('world', done)
  })

  it('should serve the file', function (done) {
    const app = new Koa()

    app.use(serve({ root: 'test/fixtures'}));

    request(app.listen())
      .get('/hello.txt')
      .expect(200)
      .expect('world', done)
  })

  it('should use index.html', function (done) {
    const app = new Koa()

    app.use(serve({ root: 'test/fixtures'}));

    request(app.listen())
      .get('/world/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect('html index', done)
  })

  it('should 404', function (done) {
    const app = new Koa()

    app.use(serve({root:'test/fixtures'}));

    request(app.listen())
      .post('/hello.txt')
      .expect(404, done)
  })
});
