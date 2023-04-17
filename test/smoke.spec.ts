import { expect, test } from '@playwright/test';
import { fail } from 'assert';
import { Validator } from 'jsonschema';
import {
  GET_REQUESTS,
  POST_REQUESTS,
  PostRequest,
  GetRequest,
} from './consts.js';
import { CONFIG } from './config.js';

const validator = new Validator();

test.describe('Smoke GET', () => {
  GET_REQUESTS.forEach((element: GetRequest) => {
    test(element.uri, async ({ request }) => {
      if (CONFIG.STAND_TYPE === 'testnet' && element.skipTestnet) return;

      const resp = await request.get(element.uri);
      expect(resp.status()).toBe(200);
      const validationResult = validator.validate(
        await resp.json(),
        element.schema,
      );
      if (validationResult.errors.length > 0) {
        fail(validationResult.errors.join('\n'));
      }
    });
  });
});

test.describe('Smoke POST', () => {
  POST_REQUESTS.forEach((element: PostRequest) => {
    test(element.uri, async ({ request }) => {
      const resp = await request.post(element.uri, { data: element.body });
      expect(resp.status()).toBe(200);
      const validationResult = validator.validate(
        await resp.json(),
        element.schema,
      );
      if (validationResult.errors.length > 0) {
        fail(validationResult.errors.join('\n'));
      }
    });
  });
});
