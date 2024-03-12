import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'
import createMongooseMemoryServer from 'mongoose-memory'
import { ConflictError, ValidationError } from 'standard-api-errors'

import { createOne } from './index.js'

const mongooseMemoryServer = createMongooseMemoryServer(mongoose)

const TestModel = mongoose.model('Test', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  refId: { type: mongoose.Types.ObjectId, required: false }
}, { timestamps: true }))

describe('createOne', () => {
  beforeAll(async () => {
    await mongooseMemoryServer.start({ storageEngine: 'wiredTiger' })
    await mongooseMemoryServer.connect('test-db')
  })
  afterEach(async () => {
    await mongooseMemoryServer.purge()
  })
  afterAll(async () => {
    await mongooseMemoryServer.disconnect()
    await mongooseMemoryServer.stop()
  })

  test('Error: Mongoose Validation', async () => {
    await expect(createOne(TestModel))
      .rejects
      .toThrow(new ValidationError('Test validation failed: name: Path `name` is required.'))
  })

  test('Error: Mongoose Duplicate Key', async () => {
    await createOne(TestModel, null, { name: 'test' })
    await expect(createOne(TestModel, null, { name: 'test' }))
      .rejects
      .toThrow(new ConflictError('E11000 duplicate key error collection: test-db.tests index: name_1 dup key: { name: "test" }'))
  })

  test('Success', async () => {
    const res = await createOne(TestModel, null, { name: 'test' })

    expect(res.status).toBe(201)
    expect(res.result.name).toBe('test')

    const entry = await TestModel.findById(res.result._id)

    expect(entry.name).toBe(res.result.name)
  })

  test('Success with params', async () => {
    const refId = new mongoose.Types.ObjectId()
    const res = await createOne(TestModel, { refId }, { name: 'test' })

    expect(res.status).toBe(201)
    expect(res.result.refId.toString()).toBe(refId.toString())
    expect(res.result.name).toBe('test')

    const entry = await TestModel.findById(res.result._id)

    expect(entry.refId.toString()).toBe(res.result.refId.toString())
    expect(entry.name).toBe(res.result.name)
  })
})
