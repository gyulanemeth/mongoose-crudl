import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'

import { list, createOne, readOne, updateOne, patchOne, deleteOne, deleteMany } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('InternalServerError', () => {
  beforeAll(async () => {
    await mongooseMemoryServer.start()
    await mongooseMemoryServer.connect('test-db')
    await mongooseMemoryServer.disconnect()
  })
  afterAll(async () => {
    await mongooseMemoryServer.stop()
  })

  test('list', async () => {
    await expect(list(TestModel))
      .rejects
      .toThrow(/MongoNotConnectedError/)
  })

  test('createOne', async () => {
    await expect(createOne(TestModel, { name: 'test' }))
      .rejects
      .toThrow(/MongoNotConnectedError/)
  })

  test('readOne', async () => {
    await expect(readOne(TestModel))
      .rejects
      .toThrow(/MongoNotConnectedError/)
  })

  test('updateOne', async () => {
    await expect(updateOne(TestModel))
      .rejects
      .toThrow(/MongoNotConnectedError/)
  })

  test('patchOne', async () => {
    await expect(patchOne(TestModel))
      .rejects
      .toThrow(/MongoNotConnectedError/)
  })

  test('deleteOne', async () => {
    await expect(deleteOne(TestModel))
      .rejects
      .toThrow(/MongoNotConnectedError/)
  })

  test('deleteMany', async () => {
    await expect(deleteMany(TestModel))
      .rejects
      .toThrow(/MongoNotConnectedError/)
  })
})
