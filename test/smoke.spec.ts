import { describe, expect, test } from '@jest/globals';
import { fail } from 'assert';
import { Validator } from 'jsonschema';
import axios from 'axios';
import { GET_REQUESTS, POST_REQUESTS, PostRequest, GetRequest } from './consts';

const validator = new Validator();

describe('Smoke GET', () => {
  GET_REQUESTS.forEach((element: GetRequest) => {
    test(element.uri, async () => {
      const resp = await axios.get(element.uri);
      expect(resp.status).toBe(200);
      const validationResult = validator.validate(resp.data, element.schema);
      if (validationResult.errors.length > 0) {
        fail(validationResult.errors.join('\n'));
      }
    });
  });
});

describe('Smoke POST', () => {
  POST_REQUESTS.forEach((element: PostRequest) => {
    test(element.uri, async () => {
      const resp = await axios.post(element.uri, element.body);
      expect(resp.status).toBe(200);
      const validationResult = validator.validate(resp.data, element.schema);
      if (validationResult.errors.length > 0) {
        fail(validationResult.errors.join('\n'));
      }
    });
  });
});
