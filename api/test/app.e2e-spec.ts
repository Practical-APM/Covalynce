import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type HealthBody = {
  status: string;
  service: string;
  checks?: {
    database: string;
    redis: string;
    workers: string;
  };
};

type MetricsBody = {
  requests: number;
  uptimeSeconds: number;
};

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as HealthBody;
        expect(body.status).toBe('ok');
        expect(body.service).toBe('covalynce-api');
      });
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as HealthBody;
        expect(body.checks).toBeDefined();
        expect(body.checks?.database).toBeDefined();
        expect(body.checks?.redis).toBeDefined();
        expect(body.checks?.workers).toBeDefined();
      });
  });

  it('/health returns X-Request-Id', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-request-id']).toBeDefined();
        expect(String(res.headers['x-request-id']).length).toBeGreaterThan(0);
      });
  });

  it('/api/v1/health/metrics (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/metrics')
      .expect(200)
      .expect((res) => {
        const body = res.body as MetricsBody;
        expect(body.requests).toBeDefined();
        expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
      });
  });
});
